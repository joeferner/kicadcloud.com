#!/usr/bin/env node

'use strict';

var optimist = require('optimist');
var search = require('../lib/search');

var args = optimist
  .alias('h', 'help')
  .alias('h', '?')
  .argv;

if (args.help) {
  optimist.showHelp();
  return process.exit(-1);
}

search.index(1, 'this is a test', function(err) {
  if (err) {
    return console.error('index', err.stack);
  }
  return search.query('test', {}, function(err, items) {
    if (err) {
      return console.error('query', err.stack);
    }
    return console.log(items);
  })
});
