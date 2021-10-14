/*
Copyright 2020 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

const fs = require('fs');
const http = require('http');
const connect = require('connect');
const httpProxy = require('http-proxy');
const listFiles = require('./listFiles');
const zlib = require('zlib');

const proxy = async function (CONFIG) {
  const app = connect();

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

        try {
          res.setHeader('content-encoding', '');
          res.setHeader('content-type', 'text/html');
          res.setHeader('content-length', replacedHtml.length);
          res.end(replacedHtml);
          console.log(`[aem-site-theme-builder] Proxy ${requestUrl}${isHtmlModified ? ' with modified theme artifacts.' : ''}`);
        } catch (err) {
          console.error('[aem-site-theme-builder] Something went wrong. Proxy html rewrite error: ', err);
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
      res.setHeader(header, proxyHeaders[header]);
    }
  });

  proxy.on('error', function (err, req, res) {
    res.writeHead(500, {
      'Content-Type': 'text/plain'
    });

    res.end('[aem-site-theme-builder] Something went wrong. Proxy error: ', err);
  });

  app.use(
    function (req, res) {
      const files = listFiles(CONFIG.dir);

      // Prepare route map requestUrl => localFilePath

      const routeMap = new Map(files.reduce((acc, file) => [...acc, [file.slice(CONFIG.dir.length - 1), file]], []));

      for (const [request, filePath] of routeMap) {
        const urlMatch = req.url.match(request);

        if (urlMatch && fs.existsSync(filePath)) {
          console.log(`[aem-site-theme-builder] Proxy ${request} to a local file: ${filePath}`);

          fs.createReadStream(filePath).pipe(res);
          return;
        }
      }
      proxy.web(req, res);
    }
  );

  http.createServer(app).listen(CONFIG.port);

  console.log(`[aem-site-theme-builder] Proxy running on http://localhost:${CONFIG.port}.`);
};

module.exports = proxy;
