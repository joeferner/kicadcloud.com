#!/usr/bin/env node

'use strict';

var optimist = require('optimist');

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
  .argv;

if (args.help) {
  optimist.showHelp();
  return process.exit(-1);
}

if (!args.sessionSecret) {
  console.log('Require a sessionSecret to start');
  return process.exit(-1);
}

require('../lib/server')(args);
