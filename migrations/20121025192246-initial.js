'use strict';

var dbm = require('db-migrate');
var async = require('async');
var type = dbm.dataType;

exports.up = function (db, callback) {
  async.series([
    db.createTable.bind(db, 'users', {
      'id': {type: type.INTEGER, primaryKey: true, autoIncrement: true },
      'username': type.STRING,
      'password': type.STRING,
      'email': type.STRING,
      'verified': type.INTEGER
    }),

    db.createTable.bind(db, 'schematicSymbols', {
      'id': {type: type.INTEGER, primaryKey: true, autoIncrement: true },
      'title': type.STRING,
      'description': type.STRING,
      'keywords': type.STRING,
      'code': type.TEXT,
      'created_by': type.INTEGER,
      'created_date': type.DATE_TIME,
      'modified_by': type.INTEGER,
      'modified_date': type.DATE_TIME
    }),

    db.createTable.bind(db, 'schematicSymbolComments', {
      'id': {type: type.INTEGER, primaryKey: true, autoIncrement: true },
      'schematic_symbol_id': type.INTEGER,
      'body': type.TEXT,
      'created_by': type.INTEGER,
      'created_date': type.DATE_TIME
    }),

    db.createTable.bind(db, 'pcbModules', {
      'id': {type: type.INTEGER, primaryKey: true, autoIncrement: true },
      'title': type.STRING,
      'description': type.STRING,
      'keywords': type.STRING,
      'code': type.TEXT,
      'created_by': type.INTEGER,
      'created_date': type.DATE_TIME,
      'modified_by': type.INTEGER,
      'modified_date': type.DATE_TIME
    }),

    db.createTable.bind(db, 'pcbModuleComments', {
      'id': {type: type.INTEGER, primaryKey: true, autoIncrement: true },
      'pcb_module_id': type.INTEGER,
      'body': type.TEXT,
      'created_by': type.INTEGER,
      'created_date': type.DATE_TIME
    }),

    db.createTable.bind(db, 'userFavoriteSchematicSymbols', {
      'user_id': {type: type.INTEGER, primaryKey: true },
      'schematic_symbol_id': {type: type.INTEGER, primaryKey: true }
    }),

    db.createTable.bind(db, 'userFavoritePcbModules', {
      'user_id': {type: type.INTEGER, primaryKey: true },
      'pcb_module_id': {type: type.INTEGER, primaryKey: true }
    }),

    db.createTable.bind(db, 'userVoteSchematicSymbols', {
      'user_id': {type: type.INTEGER, primaryKey: true },
      'schematic_symbol_id': {type: type.INTEGER, primaryKey: true },
      'vote': type.INTEGER
    }),

    db.createTable.bind(db, 'userVotePcbModules', {
      'user_id': {type: type.INTEGER, primaryKey: true },
      'pcb_module_id': {type: type.INTEGER, primaryKey: true },
      'vote': type.INTEGER
    })
  ], callback);
};

exports.down = function (db, callback) {
  async.series([
    db.dropTable.bind(db, 'userVotePcbModules'),
    db.dropTable.bind(db, 'userVoteSchematicSymbols'),
    db.dropTable.bind(db, 'userFavoritePcbModules'),
    db.dropTable.bind(db, 'userFavoriteSchematicSymbols'),
    db.dropTable.bind(db, 'pcbModuleComments'),
    db.dropTable.bind(db, 'pcbModules'),
    db.dropTable.bind(db, 'schematicSymbolComments'),
    db.dropTable.bind(db, 'schematicSymbols'),
    db.dropTable.bind(db, 'users')
  ], callback);
};
