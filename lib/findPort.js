/*
Copyright 2021 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

const tcpPortUsed = require('tcp-port-used');

async function findPort (port = 7001) {
  let itterator = 0;
  let freePort;
  const limit = 1000;

  while (itterator < limit && !freePort) {
    freePort = await tcpPortUsed.check(port)
      .then(function (inUse) {
        if (!inUse) {
          return port;
        } else {
          port++;
        }
      }, function (err) {
        console.error('Could not check port: ', err.message);
        process.exit(1);
      });

    itterator++;
  }

  if (itterator === limit) {
    console.error(`Could not find a free port for aem-site-theme-builder proxy in range from ${port} to ${port + limit}!`);
    process.exit(1);
  }

  return port;
}

module.exports = findPort;
