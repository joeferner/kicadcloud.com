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

    db.createTable.bind(db, 'edaItems', {
      'id': {type: type.INTEGER, primaryKey: true, autoIncrement: true },
      'type': type.INTEGER,
      'title': type.STRING,
      'description': type.STRING,
      'keywords': type.STRING,
      'code': type.TEXT,
      'created_by': type.INTEGER,
      'created_date': type.DATE_TIME,
      'modified_by': type.INTEGER,
      'modified_date': type.DATE_TIME
    }),

    db.createTable.bind(db, 'edaItemComments', {
      'id': {type: type.INTEGER, primaryKey: true, autoIncrement: true },
      'eda_item_id': type.INTEGER,
      'body': type.TEXT,
      'created_by': type.INTEGER,
      'created_date': type.DATE_TIME
    }),

    db.createTable.bind(db, 'userFavoriteEdaItems', {
      'user_id': {type: type.INTEGER, primaryKey: true },
      'eda_item_id': {type: type.INTEGER, primaryKey: true }
    }),

    db.createTable.bind(db, 'userVoteEdaItems', {
      'user_id': {type: type.INTEGER, primaryKey: true },
      'eda_item_id': {type: type.INTEGER, primaryKey: true },
      'vote': type.INTEGER
    }),

    db.createTable.bind(db, 'projects', {
      'id': {type: type.INTEGER, primaryKey: true, autoIncrement: true },
      'user_id': type.INTEGER,
      'title': type.STRING
    })
  ], callback);
};

exports.down = function (db, callback) {
  async.series([
    db.dropTable.bind(db, 'projects'),
    db.dropTable.bind(db, 'userVoteEdaItems'),
    db.dropTable.bind(db, 'userFavoriteEdaItems'),
    db.dropTable.bind(db, 'edaItemComments'),
    db.dropTable.bind(db, 'edaItems'),
    db.dropTable.bind(db, 'users')
  ], callback);
};
