'use strict';

var persist = require('persist');
var type = persist.type;
var User = require('./user');

var UserVoteSchematicSymbol = module.exports = persist.define("UserVoteSchematicSymbol", {
  "userId": { type: type.INTEGER, primaryKey: true },
  "schematicSymbolId": { type: type.INTEGER, primaryKey: true },
  "vote": { type: type.INTEGER }
});

