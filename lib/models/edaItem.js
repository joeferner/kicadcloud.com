'use strict';

var sf = require('sf');
var persist = require('persist');
var type = persist.type;
var User = require('./user');
var Unit = require('./unit');
var UserFavoriteEdaItem = require('./userFavoriteEdaItem');
var UserVoteEdaItem = require('./userVoteEdaItem');
var search = require('../search');

var EdaItem = module.exports = persist.define("EdaItem", {
  "type": type.INTEGER,
  "unitId": type.INTEGER,
  "title": type.STRING,
  "description": type.STRING,
  "keywords": type.STRING,
  "code": type.BLOB,
  "codeWrl": type.BLOB,
  "createdBy": type.INTEGER,
  "createdDate": type.DATETIME,
  "modifiedBy": type.INTEGER,
  "modifiedDate": type.DATETIME
})
  .hasOne(Unit, { name: 'unit', foreignKey: 'unit_id', createHasMany: false })
  .hasOne(User, { name: 'createdBy', foreignKey: 'created_by', createHasMany: false })
  .hasOne(User, { name: 'modifiedBy', foreignKey: 'modified_by', createHasMany: false });

EdaItem.onSave = function(obj, conn, callback) {
  obj.createdDate = obj.createdDate || new Date();
  obj.modifiedDate = new Date();
  /* todo
   data.createdBy = user.username;
   data.createdByUserId = user.id;
   */
  return callback();
};

EdaItem.types = {
  schematicSymbol: 1,
  pcbModule: 2
};

EdaItem.types.getHumanString = function(type) {
  switch (type) {
  case EdaItem.types.schematicSymbol:
    return 'Schematic Symbol';
  case EdaItem.types.pcbModule:
    return 'PCB Module';
  default:
    return 'Unknown';
  }
};

EdaItem.types.getUrlString = function(type) {
  switch (type) {
  case EdaItem.types.schematicSymbol:
    return 'schematicSymbol';
  case EdaItem.types.pcbModule:
    return 'pcbModule';
  default:
    return 'Unknown';
  }
};

EdaItem.canEdit = function(conn, user, id, callback) {
  return EdaItem
    .where('id = ? AND createdBy = ?', id, user.id)
    .first(conn, function(err, result) {
      if (err) {
        return callback(err);
      }
      return callback(null, result ? true : false);
    });
};

EdaItem.findRecent = function(conn, type, callback) {
  return EdaItem
    .limit(12)
    .where('type = ?', type)
    .orderBy('modifiedDate', persist.Descending)
    .include('createdBy')
    .all(conn, callback);
};

EdaItem.findAllWithIds = function(conn, edaItemIds, callback) {
  return EdaItem
    .whereIn('id', edaItemIds)
    .include('createdBy')
    .all(conn, callback);
};

EdaItem.findById = function(conn, user, id, callback) {
  var queries = {
    edaItem: EdaItem
      .where('id = ?', id)
      .include('createdBy')
      .first,
    favoriteCount: UserFavoriteEdaItem
      .where('edaItemId = ?', id)
      .count,
    voteCount: UserVoteEdaItem
      .where('edaItemId = ?', id)
      .sum('vote')
  };

  if (user) {
    queries.isFavorite = UserFavoriteEdaItem
      .where('edaItemId = ? AND userId = ?', id, user.id)
      .first;

    queries.vote = UserVoteEdaItem
      .where('edaItemId = ? AND userId = ?', id, user.id)
      .first;
  }

  conn.chain(queries, function(err, results) {
    if (err) {
      return callback(err);
    }
    if (!results.edaItem) {
      return callback(null, null);
    }

    var isFavorite = false;
    if (results.isFavorite) {
      isFavorite = true;
    }

    var vote = 0;
    if (results.vote) {
      vote = results.vote.vote;
    }

    results.edaItem.voteCount = results.voteCount;
    results.edaItem.favoriteCount = results.favoriteCount;
    results.edaItem.isFavorite = isFavorite;
    results.edaItem.vote = vote;
    results.edaItem.createdBy = results.edaItem.createdBy || {};
    return callback(null, results.edaItem);
  });
};

EdaItem.new = function(user) {
  return {
    id: 'new',
    title: 'New',
    code: '',
    createdByUserId: user.id,
    keywords: '',
    createdBy: '',
    description: '',
    modifiedDate: new Date(),
    createdDate: new Date(),
    favoriteCount: 0
  };
};

EdaItem.vote = function(conn, id, user, state, callback) {
  var vote;
  if (state === 'up') {
    vote = 1;
  } else if (state === 'down') {
    vote = -1;
  } else {
    vote = 0;
  }

  return UserVoteEdaItem
    .where('edaItemId = ? AND userId = ?', id, user.id)
    .deleteAll(conn, applyNewVote);

  function applyNewVote() {
    if (vote === 0) {
      return getNewVoteCount();
    }

    return new UserVoteEdaItem({
      userId: user.id,
      edaItemId: id,
      vote: vote
    }).save(conn, getNewVoteCount);
  }

  function getNewVoteCount() {
    return UserVoteEdaItem
      .where('edaItemId = ?', id)
      .sum(conn, 'vote', callback);
  }
};

EdaItem.favorite = function(conn, id, user, state, callback) {
  if (typeof(state) === 'string') {
    state = state === 'true';
  }

  if (state) {
    return new UserFavoriteEdaItem({
      userId: user.id,
      edaItemId: id
    }).save(conn, getNewFavoriteCount);
  } else {
    return UserFavoriteEdaItem
      .where('edaItemId = ? AND userId = ?', id, user.id)
      .deleteAll(conn, getNewFavoriteCount);
  }

  function getNewFavoriteCount() {
    return UserFavoriteEdaItem
      .where('edaItemId = ?', id)
      .count(conn, callback);
  }
};

EdaItem.findByUserId = function(conn, userId, callback) {
  return EdaItem
    .where("createdBy = ?", userId)
    .all(conn, callback);
};

EdaItem.search = function(conn, opts, callback) {
  return search.query(opts.q, opts, function(err, searchResults) {
    if (err) {
      return callback(err);
    }

    var searchResultIds = searchResults.map(function(i) { return i.id; });

    return EdaItem
      .whereIn('id', searchResultIds)
      .include('createdBy')
      .all(conn, callback);
  });
};

EdaItem.renderModFile = function(edaItems, fileName, res, next) {
  res.setHeader('content-type', 'application/octet-stream');
  res.setHeader('content-disposition', 'attachment;filename=' + fileName);

  var header = sf('PCBNEW-LibModule-V1  {0:MM/dd/yyyy HH:mm:ss}\n', new Date());
  header += '# encoding utf-8\n';
  header += '$INDEX\n';
  edaItems.forEach(function(edaItem) {
    if (edaItem.type != EdaItem.types.pcbModule) {
      return;
    }
    header += edaItem.title + '\n';
  });
  header += '$EndINDEX\n';
  res.write(header);

  edaItems.forEach(function(edaItem) {
    if (edaItem.type != EdaItem.types.pcbModule) {
      return;
    }
    var code = '#\n';
    code += '# URL: http://schematicdepot.com/pcbModule/' + edaItem.id + '\n';
    code += '#\n';
    code += edaItem.code + '\n';
    res.write(code);
  });
  res.end('$EndLIBRARY\n');
};

EdaItem.renderLibFile = function(edaItems, fileName, res, next) {
  res.setHeader('content-type', 'application/octet-stream');
  res.setHeader('content-disposition', 'attachment;filename=' + fileName);

  var header = sf('EESchema-LIBRARY Version 2.3  Date: {0:MM/dd/yyyy HH:mm:ss}\n', new Date());
  header += '# encoding utf-8\n';
  res.write(header);

  edaItems.forEach(function(edaItem) {
    if (edaItem.type != EdaItem.types.schematicSymbol) {
      return;
    }
    var code = '#\n';
    code += '# URL: http://schematicdepot.com/schematicSymbol/' + edaItem.id + '\n';
    code += '#\n';
    code += edaItem.code + '\n';
    res.write(code);
  });
  res.end('#\n#End Library\n');
};
