'use strict';

var Warning = module.exports = function(message) {
  this.message = message;
};

Warning.prototype.toString = function() {
  return this.message;
};

