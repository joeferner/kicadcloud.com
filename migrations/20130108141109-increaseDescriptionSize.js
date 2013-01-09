var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  return db.changeColumn('edaItems', 'description', {type: type.STRING, length: 60000 }, callback);
};

exports.down = function(db, callback) {
  return callback();
};
