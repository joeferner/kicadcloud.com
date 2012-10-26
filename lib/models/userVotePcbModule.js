'use strict';

var persist = require('persist');
var type = persist.type;
var User = require('./user');

var UserVotePcbModule = module.exports = persist.define("UserVotePcbModule", {
  "userId": { type: type.INTEGER, primaryKey: true },
  "pcbModuleId": { type: type.INTEGER, primaryKey: true },
  "vote": { type: type.INTEGER }
});

