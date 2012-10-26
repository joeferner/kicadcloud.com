'use strict';

var persist = require('persist');
var type = persist.type;
var User = require('./user');

var UserFavoriteEdaItem = module.exports = persist.define("UserFavoriteEdaItem", {
  "userId": { type: type.INTEGER, primaryKey: true },
  "edaItemId": { type: type.INTEGER, primaryKey: true }
});

