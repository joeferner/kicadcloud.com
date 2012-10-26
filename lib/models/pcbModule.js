'use strict';

var persist = require('persist');
var type = persist.type;
var User = require('./user');
var UserFavoritePcbModule = require('./userFavoritePcbModule');
var UserVotePcbModule = require('./userVotePcbModule');

var PcbModule = module.exports = persist.define("PcbModule", {
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

PcbModule.findRecent = function(conn, callback) {
  return PcbModule
    .limit(12)
    .orderBy('modifiedDate')
    .include('createdBy')
    .all(conn, callback);
};

PcbModule.findById = function(conn, user, id, callback) {
  var queries = {
    pcbModule: PcbModule
      .where('id = ?', id)
      .include('createdBy')
      .first,
    favoriteCount: UserFavoritePcbModule
      .where('pcbModuleId = ?', id)
      .count,
    voteCount: UserVotePcbModule
      .where('pcbModuleId = ?', id)
      .sum('vote')
  };

  if (user) {
    queries.isFavorite = UserFavoritePcbModule
      .where('pcbModuleId = ? AND userId = ?', id, user.id)
      .first;

    queries.vote = UserVotePcbModule
      .where('pcbModuleId = ? AND userId = ?', id, user.id)
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

    results.pcbModule.voteCount = results.voteCount;
    results.pcbModule.favoriteCount = results.favoriteCount;
    results.pcbModule.isFavorite = isFavorite;
    results.pcbModule.vote = vote;
    return callback(null, results.pcbModule);
  });
};

PcbModule.save = function(conn, id, user, data, callback) {
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

PcbModule.new = function(user) {
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

PcbModule.vote = function(conn, id, user, state, callback) {
  var vote;
  if (state === 'up') {
    vote = 1;
  } else if (state === 'down') {
    vote = -1;
  } else {
    vote = 0;
  }

  return UserVotePcbModule
    .where('pcbModuleId = ? AND userId = ?', id, user.id)
    .deleteAll(conn, applyNewVote);

  function applyNewVote() {
    if (vote === 0) {
      return getNewVoteCount();
    }

    return new UserVotePcbModule({
      userId: user.id,
      pcbModuleId: id,
      vote: vote
    }).save(conn, getNewVoteCount);
  }

  function getNewVoteCount() {
    return UserVotePcbModule
      .where('pcbModuleId = ?', id)
      .sum(conn, 'vote', callback);
  }
};

PcbModule.favorite = function(conn, id, user, state, callback) {
  if (typeof(state) === 'string') {
    state = state === 'true';
  }

  if (state) {
    return new UserFavoritePcbModule({
      userId: user.id,
      pcbModuleId: id
    }).save(conn, getNewFavoriteCount);
  } else {
    return UserFavoritePcbModule
      .where('pcbModuleId = ? AND userId = ?', id, user.id)
      .deleteAll(conn, getNewFavoriteCount);
  }

  function getNewFavoriteCount() {
    return UserFavoritePcbModule
      .where('pcbModuleId = ?', id)
      .count(conn, callback);
  }
};
