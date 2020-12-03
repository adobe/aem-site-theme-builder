/*
Copyright 2020 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/
const dotenv = require('dotenv');
const url = require('url');
const env = dotenv.config().parsed;

function normalizeUrl(url) {
  const parsedUrl = url.parse(env.URL);
  const port = (parsedUrl.port === '80' || parsedUrl.port === '443' || !parsedUrl.port) ? '' : ':' + parsedUrl.port;
  return parsedUrl.protocol + '//' + parsedUrl.hostname + port;
}

module.exports = {
  url: normalizeUrl(url),
  css: {
    "dist": "./dist/css/theme.css",
    "url": `/content/${env.SITE}.theme/.*/css/theme.css`
  },
  js: {
    "dist": "./dist/js/theme.js",
    "url": `/content/${env.SITE}.theme/.*/js/theme.js`
  },
  resources: {
    "dist": "./dist/resources/",
    "url": `/content/${env.SITE}.theme/.*/resources/*`
  },
  port: `${env.AEM_SITE_PROXY_PORT}`
};
