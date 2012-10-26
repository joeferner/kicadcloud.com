'use strict';

var persist = require('persist');
var type = persist.type;
var User = require('./user');

var UserVoteEdaItem = module.exports = persist.define("UserVoteEdaItem", {
  "userId": { type: type.INTEGER, primaryKey: true },
  "edaItemId": { type: type.INTEGER, primaryKey: true },
  "vote": { type: type.INTEGER }
});

