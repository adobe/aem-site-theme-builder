#!/usr/bin/env node

const path = require('path');
const shell = require('shelljs');
const proxy = require('../lib/proxy');

require('yargs')
  .scriptName("aem-site-theme-builder")
  .usage('$0 <cmd> [args]')
  .command('live', 'Runs live preview of your theme with content from AEM', (yargs) => {
    yargs.positional('config', {
      type: 'string',
      default: 'proxy.config.js',
      describe: 'Configuration file for the proxy'
    })
  }, function (argv) {
    const proxyConfig = require(path.join(process.cwd(), argv.config));
    proxy(proxyConfig);
  })
  .command('deploy', 'Deploys your theme to AEM instance', (yargs) => {}, function (argv) {
    shell.exec("dotenv -- cross-var curl -u %AEM_USER%:%AEM_PASS% -d 'prefixPath=/%GIT_ORG%/%GIT_REPO%/%GIT_ARTIFACT_ID%' -d 'githubToken=%GIT_TOKEN%' %URL%/conf/%SITE%.updatetheme.html");
  })
  .help()
  .argv;
