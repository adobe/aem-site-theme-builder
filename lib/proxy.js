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
const cheerio = require('cheerio');
const listFiles = require('./listFiles');

const proxy = async function (CONFIG) {
  const app = connect();

  // Create proxy server

  const proxy = httpProxy.createProxyServer({
    target: CONFIG.url,
    secure: false,
    autoRewrite: true,
    protocolRewrite: 'http',
    preserveHeaderKeyCase: true,
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
    const isHtmlRequest = proxyHeaders['content-type'] && proxyHeaders['content-type'].match(/(text\/html|application\/xhtml+xml)/);
    let isHtmlModified = false;

    // Detect theme artifacts in a html request
    
    if (isHtmlRequest) {
      const _write = res.write;
      let body = '';

      proxyRes.on('data', function (data) {
        data = data.toString('utf-8');
        body += data;
      });

      res.write = function () {
        const $ = cheerio.load(body);

        $('link').each((i, link) => {
          const linkMatch = link && link.attribs && link.attribs.href && link.attribs.href.match(/\/(_default|[0-9a-f]{64})\/css/);
          if (linkMatch) {
            link.attribs.href = link.attribs.href.slice(linkMatch.index);
            isHtmlModified = true;
          }
        });

        $('script').each((i, script) => {
          const scriptMatch = script.attribs && script.attribs.src && script.attribs.src.match(/\/(_default|[0-9a-f]{64})\/js/);
          if (scriptMatch) {
            script.attribs.src = script.attribs.src.slice(scriptMatch.index);
            isHtmlModified = true;
          }
        });

        try {
          _write.call(res, $.html());

          console.log(`[aem-site-theme-builder] Proxy ${requestUrl}${isHtmlModified ? ' with modified theme artifacts.' : ''}`);
        } catch (err) {
          console.error('[aem-site-theme-builder] Something went wrong. Proxy html rewrite error: ', err);
        }
      };
    }

    // Remove the `secure` attribute from cookies to support Chrome

    if (proxyRes.headers['set-cookie']) {
      proxyRes.headers['set-cookie'] = proxyRes.headers['set-cookie'].map(val => val.replace('Secure;', ''));
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
        }
      }
      proxy.web(req, res);
    }
  );

  http.createServer(app).listen(CONFIG.port);

  console.log(`[aem-site-theme-builder] Proxy running on http://localhost:${CONFIG.port}.`);
};

module.exports = proxy;
