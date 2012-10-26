'use strict';

var persist = require('persist');
var type = persist.type;
var User = require('./user');

var UserFavoriteSchematicSymbol = module.exports = persist.define("UserFavoriteSchematicSymbol", {
  "userId": { type: type.INTEGER, primaryKey: true },
  "schematicSymbolId": { type: type.INTEGER, primaryKey: true }
});

