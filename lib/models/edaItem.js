'use strict';

var spawn = require('child_process').spawn;
var temp = require('temp');
var fs = require('fs');
var log = require('../log');
var async = require('async');
var sf = require('sf');
var mkdirp = require('mkdirp');
var path = require('path');
var persist = require('persist');
var kicad2svg = require('kicad2svg');
var type = persist.type;
var User = require('./user');
var Unit = require('./unit');
var UserFavoriteEdaItem = require('./userFavoriteEdaItem');
var UserVoteEdaItem = require('./userVoteEdaItem');
var search = require('../search');

var EdaItem = module.exports = persist.define("edaItem", {
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

EdaItem.types = {
  schematicSymbol: 1,
  pcbModule: 2
};

EdaItem.new = function(user) {
  return new EdaItem({
    id: 'new',
    title: '',
    code: '',
    createdByUserId: user.id,
    keywords: '',
    createdBy: user,
    description: '',
    modifiedDate: new Date(),
    createdDate: new Date(),
    favoriteCount: 0,
    has3d: true,
    codeWrl: null
  });
};

EdaItem.onSave = function(obj, conn, callback) {
  obj.createdDate = obj.createdDate || new Date();
  obj.modifiedDate = new Date();
  /* todo
   data.createdBy = user.username;
   data.createdByUserId = user.id;
   */
  return callback();
};

EdaItem.types.getHumanString = function(type) {
  switch (parseInt(type)) {
  case EdaItem.types.schematicSymbol:
    return 'Schematic Symbol';
  case EdaItem.types.pcbModule:
    return 'PCB Module';
  default:
    return 'Unknown';
  }
};

EdaItem.types.getUrlString = function(type) {
  switch (parseInt(type)) {
  case EdaItem.types.schematicSymbol:
    return 'schematicSymbol';
  case EdaItem.types.pcbModule:
    return 'pcbModule';
  default:
    return 'Unknown';
  }
};

EdaItem.findAll = function(conn, opts, callback) {
  var query = EdaItem
    .include('createdBy')
    .orderBy('title');
  if (opts.type) {
    query = query.where('type = ?', opts.type);
  }
  return query
    .limit(opts.count, opts.page * opts.count)
    .all(conn, callback);
};

EdaItem.canEdit = function(conn, user, id, callback) {
  if (id == 'new') {
    return callback(null, true);
  }

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
  if (edaItemIds.length == 0) {
    return callback(null, []);
  }
  return EdaItem
    .whereIn('id', edaItemIds)
    .include('units')
    .include('createdBy')
    .all(conn, callback);
};

EdaItem.findById = function(conn, user, id, callback) {
  var queries = {
    edaItem: EdaItem
      .where('id = ?', id)
      .include('createdBy')
      .include('unit')
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
    .include('createdBy')
    .include('units')
    .all(conn, callback);
};

EdaItem.search = function(conn, opts, callback) {
  return search.query(opts.q, opts, function(err, searchResults) {
    if (err) {
      return callback(err);
    }

    var searchResultIds = searchResults.map(function(i) { return i.id; });

    if (searchResultIds.length == 0) {
      return callback(null, []);
    }
    return EdaItem
      .whereIn('id', searchResultIds)
      .include('createdBy')
      .include('units')
      .all(conn, callback);
  });
};

EdaItem.renderZipFile = function(edaItems, name, out, next) {
  return temp.mkdir('edaItems', function(err, dirPath) {
    if (err) {
      return next(err);
    }
    log.debug('creating temp dir:', dirPath);
    var subDirPath = path.resolve(dirPath, name);

    async.auto({
      subDir: function(callback) {
        return fs.mkdir(subDirPath, callback);
      },
      modFiles: ['subDir', function(callback) {
        return EdaItem.renderModFiles(edaItems, path.resolve(subDirPath, name), callback);
      }],
      libFile: ['subDir', function(callback) {
        return EdaItem.renderLibFile(edaItems, path.resolve(subDirPath, name + '.lib'), callback);
      }]
    }, function(err) {
      if (err) {
        return next(err);
      }
      return zipDirectory();
    });

    function zipDirectory() {
      var zipFile = temp.path({suffix: '.zip'});
      log.debug('creating zip file:', subDirPath, zipFile);

      var zip = spawn('zip', ['-r', zipFile, '.'], {
        cwd: dirPath
      });
      var output = '';
      zip.stdout.on('data', function(data) {
        output += 'zip: stdout: ' + data;
      });
      zip.stderr.on('data', function(data) {
        output += 'zip: stderr: ' + data;
      });
      zip.on('exit', function(code) {
        if (code === 0) {
          return fs.createReadStream(zipFile).pipe(out);
        } else {
          return next(new Error("Could not complete zip " + code + ":\n" + output));
        }
      });
    }
  });
};

EdaItem.renderModFiles = function(edaItems, filenamePrefix, callback) {
  var units = EdaItem.getUnits(edaItems);
  async.forEach(units, function(unit) {
    var filteredEdaItems = edaItems.filter(function(edaItem) {
      return edaItem.units.name == unit && edaItem.type == EdaItem.types.pcbModule;
    });
    var fname;
    if (unit) {
      fname = filenamePrefix + '-' + unit + '.mod';
    } else {
      fname = filenamePrefix + '.mod';
    }
    if (filteredEdaItems.length == 0) {
      return callback();
    }
    return EdaItem.renderModFile(filteredEdaItems, fname, unit, callback);
  }, callback);
};

EdaItem.getUnits = function(edaItems) {
  var units = {};
  edaItems.forEach(function(edaItem) {
    units[edaItem.units.name] = true;
  });
  return Object.keys(units);
};

EdaItem.renderModFile = function(edaItems, filename, unit, callback) {
  var err = null;
  var out = fs.createWriteStream(filename);
  out.on('error', function(_err) {
    err = _err;
  });
  out.on('close', function() {
    log.debug('done writing mod file:', filename);
    return callback(err);
  });

  return EdaItem.renderModFileToStream(edaItems, unit, filename, out);
};

EdaItem.renderModFileToStream = function(edaItems, unit, filename, out) {
  var header = sf('PCBNEW-LibModule-V1  {0:MM/dd/yyyy HH:mm:ss}\n', new Date());
  header += '#encoding utf-8\n';
  if (unit) {
    header += 'Units ' + unit + '\n';
  }
  header += '$INDEX\n';
  edaItems.forEach(function(edaItem) {
    if (edaItem.type != EdaItem.types.pcbModule) {
      return;
    }
    header += edaItem.title + '\n';
  });
  header += '$EndINDEX\n';
  out.write(header);

  async.forEach(edaItems, function(edaItem, callback) {
    if (edaItem.type != EdaItem.types.pcbModule) {
      return callback();
    }
    var mod = kicad2svg.modParser.parseModule(edaItem.code);
    if (filename && edaItem.codeWrl && mod.shape3d && mod.shape3d.fileName) {
      return EdaItem.writeWrlFile(edaItem.codeWrl, path.resolve(path.dirname(filename), mod.shape3d.fileName), function(err) {
        if (err) {
          return callback(err);
        }
        return writeCode();
      });
    } else {
      return writeCode();
    }

    function writeCode() {
      var code = '#\n';
      code += '# URL: http://kicadcloud.com/pcbModule/' + edaItem.id + '\n';
      code += '#\n';
      code += edaItem.code + '\n';
      out.write(code);
      return callback();
    }
  }, function(err) {
    if (err) {
      return callback(err);
    }
    return out.end('$EndLIBRARY\n');
  });
};

EdaItem.writeWrlFile = function(wrlCode, filename, callback) {
  filename = filename.replace(/\\/g, '/');
  mkdirp(path.dirname(filename), function(err) {
    if (err) {
      return callback(err);
    }
    return fs.writeFile(filename, wrlCode, callback);
  });
};

EdaItem.renderLibFile = function(edaItems, filename, callback) {
  var err = null;
  var out = fs.createWriteStream(filename);
  out.on('error', function(_err) {
    err = _err;
  });
  out.on('close', function() {
    log.debug('done writing lib file:', filename);
    return callback(err);
  });

  return EdaItem.renderLibFileToStream(edaItems, out);
};

EdaItem.renderLibFileToStream = function(edaItems, out) {
  var header = sf('EESchema-LIBRARY Version 2.3  Date: {0:ddd d MMM yyyy hh:mm:ss tt} GMT\n', new Date());
  header += '#encoding utf-8\n';
  out.write(header);

  edaItems.forEach(function(edaItem) {
    if (edaItem.type != EdaItem.types.schematicSymbol) {
      return;
    }
    var code = '#\n';
    code += '# ' + edaItem.title + '\n';
    code += '# URL: http://kicadcloud.com/schematicSymbol/' + edaItem.id + '\n';
    code += '#\n';
    code += edaItem.code + '\n';
    out.write(code);
  });
  out.end('#\n#End Library\n');
};

EdaItem.toPublic = function(edaItems) {
  if (edaItems instanceof Array) {
    return edaItems.map(function(edaItem) {
      return EdaItem.toPublic(edaItem);
    });
  } else {
    var edaItem = edaItems;
    if (edaItem.createdBy) {
      edaItem.createdBy = User.toPublic(edaItem.createdBy);
    }
    if (edaItem.modifiedBy) {
      edaItem.modifiedBy = User.toPublic(edaItem.modifiedBy);
    }
    Object.keys(edaItem).forEach(function(key) {
      if (key[0] == '_') {
        delete edaItem[key];
      }
    });
    return edaItem;
  }
};
