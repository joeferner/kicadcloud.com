'use strict';

var persist = require('persist');
var type = persist.type;

var Unit = module.exports = persist.define("Unit", {
  "name": type.STRING
});
