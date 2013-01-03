'use strict';

var persist = require('persist');
var type = persist.type;
var EdaItem = require('./edaItem');
var User = require('./user');

var EdaItemComment = module.exports = persist.define("edaItemComment", {
  "body": type.STRING,
  "createdBy": type.INTEGER,
  "createdDate": type.DATETIME
})
  .hasOne(EdaItem, { name: 'edaItem', foreignKey: 'eda_item_id', createHasMany: false })
  .hasOne(User, { name: 'createdBy', foreignKey: 'created_by', createHasMany: false })

EdaItemComment.onSave = function(obj, conn, callback) {
  obj.createdDate = obj.createdDate || new Date();
  return callback();
};

EdaItemComment.findByEdaItemId = function(conn, edaItemId, callback) {
  return EdaItemComment
    .where('eda_item_id = ?', edaItemId)
    .include('createdBy')
    .all(conn, callback);
};
