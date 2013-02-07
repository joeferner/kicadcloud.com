var async = require('async');
var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  async.series([
    db.changeColumn.bind(db, 'edaItems', 'code', {type: type.TEXT, length: 100000 }),
    db.changeColumn.bind(db, 'edaItems', 'code_wrl', {type: type.TEXT, length: 100000 })
  ], callback);
};

exports.down = function(db, callback) {
  return callback();
};
