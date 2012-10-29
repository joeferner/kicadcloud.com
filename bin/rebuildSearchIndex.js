#!/usr/bin/env node

'use strict';

var search = require('../lib/search');
var async = require('async');
var persist = require('persist');
var optimist = require('optimist');
var models = require('../lib/models');

var args = optimist
  .alias('h', 'help')
  .alias('h', '?')
  .argv;

if (args.help) {
  optimist.showHelp();
  return process.exit(-1);
}

//return search.query('C', {}, function(err, items) {
//  if (err) {
//    return console.error('query', err.stack);
//  }
//  return console.log(items);
//});

run(function(err) {
  if (err) {
    console.error("Could not rebuild search index", err.stack);
    return process.exit(-1);
  }
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

      return async.forEachSeries(items, function(item, callback) {
        var text = item.title + ' ' + item.description + ' ' + item.keywords;
        console.log('indexing item ' + item.id);
        return search.index(item.id, text, callback);
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
