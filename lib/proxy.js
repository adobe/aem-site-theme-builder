/*
Copyright 2020 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

const fs = require('fs');
const path = require('path');
const http = require('http');
const zlib = require('zlib');
const connect = require('connect');
const httpProxy = require('http-proxy');
const listFiles = require('./listFiles');

const proxy = async function (CONFIG) {
  const app = connect();
  const prefix = '[aem-site-theme-builder]';
  const log = msg => console.log(`${prefix} ${msg}`);
  const error = msg => console.error(`${prefix} ${msg}`);

  // Create proxy server
  const proxy = httpProxy.createProxyServer({
    target: CONFIG.url,
    secure: false,
    autoRewrite: true,
    protocolRewrite: 'http',
    preserveHeaderKeyCase: true,
    selfHandleResponse: true,
    headers: {
      Host: CONFIG.url.replace(/(^\w+:|^)\/\//, ''),
      Referer: CONFIG.url,
      Origin: CONFIG.url
    }
  });

  // Modify proxy response
  proxy.on('proxyRes', function (proxyRes, req, res) {
    const requestUrl = req.url;
    const proxyHeaders = proxyRes && proxyRes.headers;
    const isHtmlRequest = proxyHeaders && proxyHeaders['content-type'] && proxyHeaders['content-type'].match(/(text\/html|application\/xhtml+xml)/);
    const isGzipedRequest = proxyHeaders && proxyHeaders['content-encoding'] && proxyHeaders['content-encoding'].includes('gzip');
    let cookieHeader = proxyHeaders && proxyHeaders['set-cookie'];

    // Pass-through the status code
    res.statusCode = proxyRes.statusCode;

    // Detect theme artifacts in a html request
    if (isHtmlRequest) {
      const body = [];

      proxyRes.on('data', function (chunk) {
        body.push(chunk);
      });

      proxyRes.on('end', function () {
        const data = Buffer.concat(body);
        const html = isGzipedRequest ? zlib.unzipSync(data).toString() : data.toString();
        const replacedHtml = html.replace(/"\s*?(http|\/).*?\/(_default|[0-9a-f]{64})\//g, '"/');
        const isHtmlModified = (replacedHtml.length !== html.length);

        if (isHtmlModified) {
          try {
            res.setHeader('content-encoding', '');
            res.setHeader('content-type', 'text/html');
            res.removeHeader('content-length');
            res.end(replacedHtml);
            log(`Proxy ${requestUrl} with modified theme artifacts.`);
          } catch (err) {
            error('Something went wrong. Proxy html rewrite error: ', err);
          }
        } else {
          res.end(data.toString('binary'));
          log(`Proxy ${requestUrl} without changes.`);
        }
      });
    } else {
      proxyRes.pipe(res);
    }

    // Remove the `secure` attribute from cookies to support Chrome
    if (cookieHeader) {
      cookieHeader = cookieHeader.map(val => val.replace('Secure;', ''));
    }

    // Set headers to be sent to client
    for (const header in proxyHeaders) {
      // Rewrite URLs
      const replaceUrl = val => val.replace(CONFIG.url, `http://localhost:${CONFIG.port}`);

      if (Array.isArray(proxyHeaders[header])) {
        res.setHeader(header, proxyHeaders[header].map(replaceUrl));
      } else {
        res.setHeader(header, replaceUrl(proxyHeaders[header]));
      }
    }
  });

  proxy.on('error', function (err, req, res) {
    res.writeHead(500, {
      'Content-Type': 'text/plain'
    });

    res.end(`${prefix} Something went wrong. Proxy error: `, err);
  });

  app.use(
    function (req, res) {
      const files = listFiles(CONFIG.dir);
      // Remove / and query string from request url
      const reqUrl = path.normalize(req.url).slice(1).split('?')[0];

      // Prepare route map requestUrl => localFilePath
      const routeMap = new Map(files.reduce((acc, file) => [...acc, [path.relative(CONFIG.dir, file), file]], []));

      for (const [request, filePath] of routeMap) {
        const urlMatch = path.relative(reqUrl, request) === '';

        if (urlMatch && fs.existsSync(filePath)) {
          log(`Proxy ${request} to a local file: ${filePath}`);

          fs.createReadStream(filePath).pipe(res);
          return;
        }
      }
      proxy.web(req, res);
    }
  );

  http.createServer(app).listen(CONFIG.port);

  log(`Proxy running on http://localhost:${CONFIG.port}.`);
};

module.exports = proxy;
