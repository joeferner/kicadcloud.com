#!/usr/bin/env node

'use strict';

var async = require('async');
var fs = require('fs');
var path = require('path');
var optimist = require('optimist');
var persist = require('persist');
var kicad2svg = require('kicad2svg');
var models = require('../lib/models');

var args = optimist
  .alias('h', 'help')
  .alias('h', '?')
  .options('in', {
    alias: 'i',
    describe: 'Input file.'
  })
  .options('username', {
    alias: 'u',
    describe: 'The username of creator.'
  })
  .argv;

if (args.help) {
  optimist.showHelp();
  return process.exit(-1);
}

run(function(err) {
  if (err) {
    console.error("Could not import", err.stack);
    return process.exit(-1);
  }
  return process.exit(0);
});

function run(callback) {
  var code = fs.readFileSync(args.in, 'utf8');

  persist.connect(function(err, conn) {
    if (err) {
      return callback(err);
    }

    return models.User.findByUsernameOrEmail(conn, args.username, function(err, user) {
      if (err) {
        return callback(err);
      }
      if (!user) {
        return callback(new Error("Could not find user " + args.username));
      }

      var userId = user.id;

      try {
        var mod = kicad2svg.modParser(code);
        return importPcbModules(conn, userId, mod, callback);
      } catch (ex) {
        try {
          var lib = kicad2svg.libParser(code);
          return importSchematicSymbols(conn, userId, lib, callback);
        } catch (ex) {
          return callback(new Error("Could not parse data: " + ex.stack));
        }
      }
    });
  });
}

function importPcbModules(conn, userId, modules, callback) {
  console.log(modules);
}

function importSchematicSymbols(conn, userId, schematicSymbols, callback) {
  return async.forEachSeries(Object.keys(schematicSymbols.symbols), function(key, callback) {
    return importSchematicSymbol(conn, userId, schematicSymbols.symbols[key], callback);
  }, callback);
}

function importSchematicSymbol(conn, userId, schematicSymbol, callback) {
  var s = new models.SchematicSymbols();
  s.title = schematicSymbol.name;
  s.description = 'Imported from ' + path.basename(args.in);
  s.keywords = '';
  s.code = schematicSymbol.original;
  s.createdBy = userId;
  s.createdDate = Date.now();
  s.modifiedBy = userId;
  s.modifiedDate = Date.now();
  return s.save(conn, callback);
}
