#!/usr/bin/env node

'use strict';

var search = require('../lib/search');
var async = require('async');
var persist = require('persist');
var optimist = require('optimist');
var models = require('../lib/models');

var args = optimist
  .options('id', {
    describe: 'Id of item to index.'
  })
  .alias('h', 'help')
  .alias('h', '?')
  .argv;

if (args.help) {
  optimist.showHelp();
  return process.exit(-1);
}

run(function(err) {
  if (err) {
    console.error("Could not rebuild search index", err.stack);
    return process.exit(-1);
  }
  console.log('indexing complete!');
  return process.exit(0);
});

function run(callback) {
  persist.connect(function(err, conn) {
    if (err) {
      return callback(err);
    }

    return models.EdaItem.all(conn, function(err, items) {
      if (err) {
        return callback(err);
      }

      var i = 0;
      return async.forEachSeries(items, function(item, callback) {
        i++;
        if (args.id && args.id != item.id) {
          return process.nextTick(callback);
        }
        console.log('indexing item ' + i + '/' + items.length + ' (id: ' + item.id + ')');
        return search.indexEdaItem(item, callback);
      }, function(err) {
        if (err) {
          return callback(err);
        }
        conn.close();
        return callback();
      });
    });
  });
}
