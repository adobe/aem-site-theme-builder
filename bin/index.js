#!/usr/bin/env node

/*
Copyright 2020 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

const shell = require('shelljs');
const proxy = require('../lib/proxy');
const browserSync = require('../lib/browserSync');
const findPort = require('../lib/findPort');
const dotenv = require('dotenv');
const env = dotenv.config().parsed;

require('yargs')
  .scriptName('aem-site-theme-builder')
  .usage('$0 <cmd> [args]')
  .command('proxy', 'Runs proxy to preview your theme with content from AEM', () => {}, async function () {
    const CONFIG = require('../lib/proxyConfig');
    const port = await findPort(parseInt(CONFIG.port, 10));
    proxy({ ...CONFIG, port });
  })
  .command('live', 'Runs live preview (proxy + browser sync) of your theme with content from AEM', () => {}, async function () {
    const CONFIG = require('../lib/proxyConfig');
    const portProxy = await findPort(parseInt(CONFIG.port, 10));
    await proxy({ ...CONFIG, port: portProxy });
    // wait for proxy to start before finding next port for browser sync
    const portBrowserSync = await findPort(portProxy);
    browserSync({ port: portBrowserSync, portProxy, siteName: env.AEM_SITE });
  })
  .command('deploy', 'Deploys your theme to AEM instance', () => {}, function () {
    shell.exec('dotenv -- cross-var curl -d \'site=%AEM_SITE%\' -d \'artifact=%GIT_ARTIFACT_ID%\' -d \'expiration=%GIT_HASH_EXPIRATION%\' -d \'hash=%GIT_HASH%\' %AEM_URL%/aem/update.theme.html');
  })
  .help()
  .argv;
