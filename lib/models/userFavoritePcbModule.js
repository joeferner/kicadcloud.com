'use strict';

var persist = require('persist');
var type = persist.type;
var User = require('./user');

var UserFavoritePcbModule = module.exports = persist.define("UserFavoritePcbModule", {
  "userId": { type: type.INTEGER, primaryKey: true },
  "pcbModuleId": { type: type.INTEGER, primaryKey: true }
});

