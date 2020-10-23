#!/usr/bin/env node

/*
Copyright 2020 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

const path = require('path');
const shell = require('shelljs');
const proxy = require('../lib/proxy');
const proxyConfig = require('../lib/proxyConfig');

require('yargs')
  .scriptName('aem-site-theme-builder')
  .usage('$0 <cmd> [args]')
  .command('live', 'Runs live preview of your theme with content from AEM', (yargs) => {}, function (argv) {
    proxy(proxyConfig);
  })
  .command('deploy', 'Deploys your theme to AEM instance', (yargs) => {}, function (argv) {
    shell.exec('dotenv -- cross-var curl -u %AEM_USER%:%AEM_PASS% -d \'prefixPath=/%GIT_ORG%/%GIT_REPO%/%GIT_ARTIFACT_ID%\' -d \'githubToken=%GIT_TOKEN%\' %URL%/conf/%SITE%.updatetheme.html');
  })
  .help()
  .argv;
