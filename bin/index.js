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

require('yargs')
  .scriptName('aem-site-theme-builder')
  .usage('$0 <cmd> [args]')
  .command('live', 'Runs live preview of your theme with content from AEM', (yargs) => {}, function (argv) {
    const proxyConfig = require('../lib/proxyConfig');
    proxy(proxyConfig);
  })
  .command('deploy', 'Deploys your theme to AEM instance', (yargs) => {}, function (argv) {
    shell.exec('dotenv -- cross-var curl -d \'site=%AEM_SITE%\' -d \'artifact=%GIT_ARTIFACT_ID%\' -d \'expiration=%GIT_HASH_EXPIRATION%\' -d \'hash=%GIT_HASH%\' %AEM_URL%/aem/update.theme.html');
  })
  .help()
  .argv;
