'use strict';

var persist = require('persist');
var type = persist.type;
var User = require('./user');

var SchematicSymbols = module.exports = persist.define("SchematicSymbol", {
  "title": type.STRING,
  "description": type.STRING,
  "keywords": type.STRING,
  "code": type.BLOB,
  "createdBy": type.INTEGER,
  "createdDate": type.DATETIME,
  "modifiedBy": type.INTEGER,
  "modifiedDate": type.DATETIME
})
  .hasOne(User, { name: 'createdBy', foreignKey: 'created_by', createHasMany: false })
  .hasOne(User, { name: 'modifiedBy', foreignKey: 'modified_by', createHasMany: false });

SchematicSymbols.findRecent = function(conn, callback) {
  return SchematicSymbols
    .limit(12)
    .orderBy('modifiedDate')
    .include('createdBy')
    .all(conn, callback);
};

SchematicSymbols.findById = function(conn, id, callback) {
  return SchematicSymbols
    .where('id = ?', id)
    .include('createdBy')
    .first(conn, callback);
};

SchematicSymbols.save = function(conn, id, user, data, callback) {
  data.createdBy = user.username;
  data.createdByUserId = user.id;
  data.modifiedDate = Date.now();
  console.log("Implement me, save: " + data);
  if (id === 'new') {
    data.id = parts.length;
    parts.push(data);
    return callback(null, data);
  }
  Object.keys(data).forEach(function(k) {
    parts[id][k] = data[k];
  });
  return callback(null, parts[id]);
};

SchematicSymbols.new = function(user) {
  return {
    id: 'new',
    title: 'New',
    code: '',
    createdByUserId: user.id,
    keywords: '',
    createdBy: '',
    description: '',
    modifiedDate: Date.now(),
    favoriteCount: 0
  };
};

SchematicSymbols.vote = function(conn, id, user, state, callback) {
  if (state === 'up') {
    parts[id].upVoteCount++;
  } else if (state === 'down') {
    parts[id].upVoteCount--;
  }
  return callback(null, parts[id]);
};

SchematicSymbols.favorite = function(conn, id, user, state, callback) {
  if (typeof(state) === 'string') {
    state = state === 'true';
  }

  if (state) {
    parts[id].favoriteCount++;
  } else {
    parts[id].favoriteCount--;
  }
  return callback(null, parts[id]);
};
