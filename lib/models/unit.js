'use strict';

var persist = require('persist');
var type = persist.type;

var Unit = module.exports = persist.define("unit", {
  "name": type.STRING
});

Unit.findOrAddByName = function(conn, name, callback) {
  return Unit
    .where('name = ?', name)
    .first(conn, function(err, unit) {
      if (err) {
        return callback(err);
      }
      if (unit) {
        return callback(null, unit);
      }
      unit = new Unit({
        name: name
      });
      return unit.save(conn, callback);
    });
};
