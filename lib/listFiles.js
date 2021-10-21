/*
Copyright 2021 Adobe
All Rights Reserved.

NOTICE: Adobe permits you to use, modify, and distribute this file in
accordance with the terms of the Adobe license agreement accompanying
it.
*/

const fs = require('fs');
const path = require('path');

const filesList = [];

function listFiles (dir) {
  const stats = fs.statSync(dir);

  if (!stats.isDirectory()) {
    filesList.push(dir);
    return;
  }

  fs.readdirSync(dir).forEach(file => {
    listFiles(path.join(dir, file));
  });

  return filesList.map(file => file.replace(/\\/g, '/'));
}

module.exports = listFiles;
