#!/usr/bin/env node

'use strict';

var path = require('path');
var optimist = require('optimist');
var databaseJson = require(path.resolve(__dirname, '../database.json'));

var args = optimist
  .alias('h', 'help')
  .alias('h', '?')
  .options('port', {
    alias: 'p',
    default: 80,
    describe: 'Port.'
  })
  .options('sessionSecret', {
    describe: 'Secret used to secure session storage.'
  })
  .options('workers', {
    describe: 'Number of workers to run.'
  })
  .argv;

if(databaseJson) {
  args.sessionSecret = args.sessionSecret || databaseJson.sessionSecret;
}

if (args.help) {
  optimist.showHelp();
  return process.exit(-1);
}

if (!args.sessionSecret) {
  console.log('Require a sessionSecret to start');
  return process.exit(-1);
}

require('../lib/server')(args);
