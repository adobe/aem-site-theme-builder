/*
Copyright 2020 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/
const http = require('http');
const connect = require('connect');
const httpProxy = require('http-proxy');
const fileSystem = require('fs');

const proxy = async function(CONFIG) {

  // Append Theme to head of html in proxy response

  const app = connect();

  // Create proxy server

  const proxy = httpProxy.createProxyServer({
    target: CONFIG.url,
    secure: false,
    autoRewrite: true,
    protocolRewrite: "http",
    preserveHeaderKeyCase: true,
    headers: {
      "Host": CONFIG.url.replace(/(^\w+:|^)\/\//, ''),
      "Referer" : CONFIG.url,
      "Origin": CONFIG.url
    }
  });

  // Remove the `secure` attribute from cookies to support Chrome

  proxy.on('proxyRes', function(proxyRes, req, res) {
    if (proxyRes.headers['set-cookie']) {
      proxyRes.headers['set-cookie'] = proxyRes.headers['set-cookie'].map(val => val.replace('Secure;', ''))
    }
  });

  proxy.on('error', function (err, req, res) {
    res.writeHead(500, {
      'Content-Type': 'text/plain'
    });

    res.end('Something went wrong. Proxy error: ', err);
  });

  const routeMap = new Map([
    [CONFIG.css.url, CONFIG.css.dist],
    [CONFIG.js.url, CONFIG.js.dist],
    [CONFIG.resources.url, CONFIG.resources.dist]
  ]);

  app.use(
    function (req, res) {
      for (let [key, value] of routeMap) {
        const urlMatch = req.url.match(key);
        const filePath = urlMatch && req.url.replace(urlMatch[0], value).split('?')[0];

        if (fileSystem.existsSync(filePath)) {
          fileSystem.createReadStream(filePath).pipe(res);
        }
      }
      proxy.web(req, res);
    }
  );

  http.createServer(app).listen(CONFIG.port);

  console.log(`Proxy running on http://localhost:${CONFIG.port}.`);
}

module.exports = proxy;
