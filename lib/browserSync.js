/*
Copyright 2021 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

const browserSync = require('browser-sync').create();
const CONFIG = require('../lib/proxyConfig');
const dotenv = require('dotenv');
const env = dotenv.config().parsed;

function runBrowserSync ({ port, portProxy }) {
  let url = `localhost:${portProxy}/content/${env.AEM_SITE}.html?wcmmode=disabled`
  if(env.AEM_ADAPTIVE_FORM)
    url = `localhost:${portProxy}/content/forms/af/${env.AEM_ADAPTIVE_FORM}.html?wcmmode=disabled`
  browserSync.init({
    port,
    proxy: url,
    files: CONFIG.dir
  });
}

module.exports = runBrowserSync;
