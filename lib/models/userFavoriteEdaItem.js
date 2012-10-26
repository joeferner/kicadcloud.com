'use strict';

var persist = require('persist');
var type = persist.type;

var UserFavoriteEdaItem = module.exports = persist.define("UserFavoriteEdaItem", {
  "userId": { type: type.INTEGER, primaryKey: true },
  "edaItemId": { type: type.INTEGER, primaryKey: true }
});

UserFavoriteEdaItem.findByUserId = function(conn, userId, callback) {
  var EdaItem = require('./edaItem');

  UserFavoriteEdaItem.where('userId = ?', userId).all(conn, function(err, favorites) {
    if (err) {
      return callback(err);
    }

    var edaItemIds = favorites.map(function(f) { return f.edaItemId; });
    return EdaItem.findAllWithIds(conn, edaItemIds, callback);
  });
};
