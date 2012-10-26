'use strict';

var persist = require('persist');
var type = persist.type;
var User = require('./user');
var UserFavoriteSchematicSymbol = require('./userFavoriteSchematicSymbol');
var UserVoteSchematicSymbol = require('./userVoteSchematicSymbol');

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

SchematicSymbols.findById = function(conn, user, id, callback) {
  var queries = {
    schematicSymbol: SchematicSymbols
      .where('id = ?', id)
      .include('createdBy')
      .first,
    favoriteCount: UserFavoriteSchematicSymbol
      .where('schematicSymbolId = ?', id)
      .count,
    voteCount: UserVoteSchematicSymbol
      .where('schematicSymbolId = ?', id)
      .sum('vote')
  };

  if (user) {
    queries.isFavorite = UserFavoriteSchematicSymbol
      .where('schematicSymbolId = ? AND userId = ?', id, user.id)
      .first;

    queries.vote = UserVoteSchematicSymbol
      .where('schematicSymbolId = ? AND userId = ?', id, user.id)
      .first;
  }

  conn.chain(queries, function(err, results) {
    if (err) {
      return callback(err);
    }

    var isFavorite = false;
    if(results.isFavorite) {
      isFavorite = true;
    }

    var vote = 0;
    if(results.vote) {
      vote = results.vote.vote;
    }

    results.schematicSymbol.voteCount = results.voteCount;
    results.schematicSymbol.favoriteCount = results.favoriteCount;
    results.schematicSymbol.isFavorite = isFavorite;
    results.schematicSymbol.vote = vote;
    console.log(results.schematicSymbol.vote);
    return callback(null, results.schematicSymbol);
  });
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
  var vote;
  if (state === 'up') {
    vote = 1;
  } else if (state === 'down') {
    vote = -1;
  } else {
    vote = 0;
  }

  return UserVoteSchematicSymbol
    .where('schematicSymbolId = ? AND userId = ?', id, user.id)
    .deleteAll(conn, applyNewVote);

  function applyNewVote() {
    if (vote === 0) {
      return getNewVoteCount();
    }

    return new UserVoteSchematicSymbol({
      userId: user.id,
      schematicSymbolId: id,
      vote: vote
    }).save(conn, getNewVoteCount);
  }

  function getNewVoteCount() {
    return UserVoteSchematicSymbol
      .where('schematicSymbolId = ?', id)
      .sum(conn, 'vote', callback);
  }
};

SchematicSymbols.favorite = function(conn, id, user, state, callback) {
  if (typeof(state) === 'string') {
    state = state === 'true';
  }

  if (state) {
    return new UserFavoriteSchematicSymbol({
      userId: user.id,
      schematicSymbolId: id
    }).save(conn, getNewFavoriteCount);
  } else {
    return UserFavoriteSchematicSymbol
      .where('schematicSymbolId = ? AND userId = ?', id, user.id)
      .deleteAll(conn, getNewFavoriteCount);
  }

  function getNewFavoriteCount() {
    return UserFavoriteSchematicSymbol
      .where('schematicSymbolId = ?', id)
      .count(conn, callback);
  }
};
