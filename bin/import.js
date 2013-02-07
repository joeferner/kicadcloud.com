#!/usr/bin/env node

/*
 for f in `ls /usr/share/kicad/modules/*.mod`; do bin/import.js -i $f -u import; done;
 for f in `ls ~/Downloads/kicad/mods/*.mod`; do bin/import.js -i $f -u import; done;
 for f in `ls /usr/share/kicad/library/*.lib`; do bin/import.js -i $f -u import; done;
 for f in `ls ~/Downloads/kicad/libs/*.lib`; do bin/import.js -i $f -u import; done;
 */

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

var fileDir = path.dirname(args.in);

var unitsCache;

if (!args.in) {
  console.error('input file required');
  return process.exit(-1);
}

if (!args.username) {
  console.error('username is required');
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
  if (!fs.existsSync(args.in)) {
    return callback(new Error("Invalid input file: " + args.in));
  }
  console.log('processing file: ' + args.in);
  var code = fs.readFileSync(args.in, 'utf8');
  tryLoadDocFile(args.in, function(err, docData) {
    if (err) {
      return callback(err);
    }

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
            return importPcbModules(conn, userId, mod, docData, callback);
          } catch (ex1) {
            try {
              var lib = kicad2svg.libParser(code);
              return importSchematicSymbols(conn, userId, lib, docData, callback);
            } catch (ex2) {
              return callback(new Error("Could not parse:\n" + ex1.stack + "\n" + ex2.stack));
            }
          }
        });
      });
    });
  });
}

function tryLoadDocFile(libModFilename, callback) {
  var ext = path.extname(libModFilename);
  var docExt = (ext == '.mod') ? '.mdc' : '.dcm';
  var base = path.join(path.dirname(libModFilename), path.basename(libModFilename, ext));
  var docFileName = base + docExt;
  return fs.exists(docFileName, function(exists) {
    if (!exists) {
      return callback();
    }
    return fs.readFile(docFileName, 'utf8', function(err, data) {
      if (err) {
        return callback(err);
      }
      console.log('found doc file:', docFileName);
      if (docExt == '.mdc') {
        return callback(null, kicad2svg.mdcParser(data));
      }
      if (docExt == '.dcm') {
        return callback(null, kicad2svg.dcmParser(data));
      }
      return callback(new Error('Unknown docExt: ' + docExt));
    });
  });
}

function importPcbModules(conn, userId, modules, docData, callback) {
  return async.forEachSeries(Object.keys(modules.modules), function(key, callback) {
    var modDocs = null;
    if (docData) {
      modDocs = docData.modules[key];
    }
    return importPcbModule(conn, userId, modules.modules[key], modDocs, callback);
  }, callback);
}

function importPcbModule(conn, userId, pcbModule, docData, callback) {
  if (pcbModule.shape3d && pcbModule.shape3d.fileName) {
    var shape3dFileName = path.resolve(fileDir, pcbModule.shape3d.fileName);
    if (fs.existsSync(shape3dFileName)) {
      return fs.readFile(shape3dFileName, 'utf8', function(err, data3d) {
        if (err) {
          return callback(err);
        }
        return save(data3d);
      });
    }
  }

  return save();

  function save(data3d) {
    return findAddUnitsId(conn, pcbModule.units, function(err, unitId) {
      if (err) {
        return callback(err);
      }
      console.log('importing ' + pcbModule.name);
      //console.log(pcbModule);
      var s = new models.EdaItem();
      s.type = models.EdaItem.types.pcbModule;
      s.unitId = unitId;
      s.title = pcbModule.name;
      s.description = 'Imported from ' + path.basename(args.in);
      if (docData && docData.description) {
        s.description += '\n\n' + docData.description;
      }
      s.keywords = '';
      if (docData && docData.keywords) {
        s.keywords = docData.keywords.join(', ');
      }
      s.code = pcbModule.original;
      s.codeWrl = data3d;
      s.createdBy = userId;
      s.createdDate = Date.now();
      s.modifiedBy = userId;
      s.modifiedDate = Date.now();
      return s.save(conn, callback);
    });
  }
}

function importSchematicSymbols(conn, userId, schematicSymbols, docData, callback) {
  return async.forEachSeries(Object.keys(schematicSymbols.symbols), function(key, callback) {
    var libDocs = null;
    if (docData) {
      libDocs = docData.symbols[key];
    }
    return importSchematicSymbol(conn, userId, schematicSymbols.symbols[key], libDocs, callback);
  }, callback);
}

function importSchematicSymbol(conn, userId, schematicSymbol, docData, callback) {
  var s = new models.EdaItem();
  s.type = models.EdaItem.types.schematicSymbol;
  s.title = schematicSymbol.name;
  s.description = 'Imported from ' + path.basename(args.in);
  if (docData && docData.description) {
    s.description += '\n\n' + docData.description;
  }
  s.keywords = '';
  if (docData && docData.keywords) {
    s.keywords = '\n\n' + docData.keywords.join(', ');
  }
  s.code = schematicSymbol.original;
  s.createdBy = userId;
  s.createdDate = Date.now();
  s.modifiedBy = userId;
  s.modifiedDate = Date.now();
  console.log('importing ' + schematicSymbol.name);
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