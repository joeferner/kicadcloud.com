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

var unitsCache;

run(function(err) {
  if (err) {
    console.error("Could not import", err.stack);
    return process.exit(-1);
  }
  return process.exit(0);
});

function run(callback) {
  if (!fs.existsSync(args.in)) {
    return callback(new Error("Invalid input file"));
  }
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

      return models.Unit.all(conn, function(err, units) {
        if (err) {
          return callback(err);
        }

        unitsCache = {};
        units.forEach(function(unit) {
          unitsCache[unit.name] = unit.id;
        });

        try {
          var mod = kicad2svg.modParser(code);
          return importPcbModules(conn, userId, mod, callback);
        } catch (ex) {
          console.log("could not parse as pcb module", ex.stack);
          try {
            var lib = kicad2svg.libParser(code);
            return importSchematicSymbols(conn, userId, lib, callback);
          } catch (ex) {
            return callback(new Error("Could not parse data: " + ex.stack));
          }
        }
      });
    });
  });
}

function importPcbModules(conn, userId, modules, callback) {
  return async.forEachSeries(Object.keys(modules.modules), function(key, callback) {
    return importPcbModule(conn, userId, modules.modules[key], callback);
  }, callback);
}

function importPcbModule(conn, userId, pcbModule, callback) {
  return findAddUnitsId(conn, pcbModule.units, function(err, unitId) {
    if (err) {
      return callback(err);
    }
    console.log('importing ' + pcbModule.name);
    var s = new models.EdaItem();
    s.type = models.EdaItem.types.pcbModule;
    s.unitId = unitId;
    s.title = pcbModule.name;
    s.description = 'Imported from ' + path.basename(args.in);
    s.keywords = '';
    s.code = pcbModule.original;
    s.createdBy = userId;
    s.createdDate = Date.now();
    s.modifiedBy = userId;
    s.modifiedDate = Date.now();
    return s.save(conn, callback);
  });
}

function importSchematicSymbols(conn, userId, schematicSymbols, callback) {
  return async.forEachSeries(Object.keys(schematicSymbols.symbols), function(key, callback) {
    return importSchematicSymbol(conn, userId, schematicSymbols.symbols[key], callback);
  }, callback);
}

function importSchematicSymbol(conn, userId, schematicSymbol, callback) {
  var s = new models.EdaItem();
  s.type = models.EdaItem.types.schematicSymbol;
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

function findAddUnitsId(conn, unitName, callback) {
  if (unitsCache[unitName]) {
    return callback(null, unitsCache[unitName]);
  }

  var unit = new models.Unit();
  unit.name = unitName;
  unit.save(conn, function(err, unit) {
    if (err) {
      return callback(err);
    }
    unitsCache[unitName] = unit.id;
    return callback(null, unit.id);
  });
}