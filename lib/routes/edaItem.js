'use strict';

var path = require('path');
var fs = require('fs');
var async = require('async');
var temp = require('temp');
var spawn = require('child_process').spawn;
var models = require('../models');
var myutil = require('../util');
var search = require('../search');

module.exports = function(app) {
  app.get('/schematicSymbol/recent', app.withConnection(getRecent.bind(null, models.EdaItem.types.schematicSymbol)));
  app.get('/schematicSymbol/:id.json', app.withConnection(getJsonById));
  app.get('/schematicSymbol/:id', app.withConnection(getById));
  app.post('/schematicSymbol/:id/vote', app.withConnection(postVote));
  app.post('/schematicSymbol/:id/favorite', app.withConnection(postFavorite));

  app.get('/pcbModule/recent', app.withConnection(getRecent.bind(null, models.EdaItem.types.pcbModule)));
  app.get('/pcbModule/:id.wrl', app.withConnection(getVrmlById));
  app.get('/pcbModule/:id.webgl.js', app.withConnection(getWebGlJsById));
  app.get('/pcbModule/:id.json', app.withConnection(getJsonById));
  app.get('/pcbModule/:id', app.withConnection(getById));
  app.post('/pcbModule/:id/vote', app.withConnection(postVote));
  app.post('/pcbModule/:id/favorite', app.withConnection(postFavorite));

  app.get('/edaItem/new', getEdaItemNew);
  app.get('/edaItem/:id/download', app.withConnection(getDownload));
  app.get('/edaItem/:id', app.withConnection(getById));
  app.post('/edaItem/:id/addComment', app.withConnection(postAddComment));
  app.post('/edaItem/:id', app.withConnection(postSave));

  function getRecent(edaItemType, req, res, next) {
    models.EdaItem.findRecent(req.conn, edaItemType, function(err, items) {
      if (err) {
        return next(err);
      }
      return res.json(items);
    });
  }

  function getWebGlJsById(req, res, next) {
    var id = req.params.id;

    return models.EdaItem.findById(req.conn, req.session.user, id, function(err, edaItem) {
      if (err) {
        return next(err);
      }
      if (!edaItem || !edaItem.codeWrl) {
        return res.send('Not Found', 404);
      }

      var codeWrl = edaItem.codeWrl;
      var tempWrlName = temp.path({ suffix: '.wrl' });
      var tempObjName = temp.path({ suffix: '' });
      var tempWebGlJsName = temp.path({ suffix: '.webgl.js' });
      return fs.writeFile(tempWrlName, codeWrl, function(err) {
        if (err) {
          return next(err);
        }
        return runMeshConv(tempWrlName, tempObjName, function(err) {
          if (err) {
            return next(err);
          }
          return runObjToThreeJs(tempObjName + '.obj', tempWebGlJsName, function(err) {
            if (err) {
              return next(err);
            }

            //log.debug('createReadStream', tempWebGlJsName);
            var readStream = fs.createReadStream(tempWebGlJsName);
            readStream.on('close', function() {
              fs.unlink(tempWrlName);
              fs.unlink(tempObjName);
              fs.unlink(tempWebGlJsName);
            });
            return readStream.pipe(res);
          });
        });
      });
    });
  }

  function getVrmlById(req, res, next) {
    var id = req.params.id;

    return models.EdaItem.findById(req.conn, req.session.user, id, function(err, edaItem) {
      if (err) {
        return next(err);
      }
      if (!edaItem || !edaItem.codeWrl) {
        return res.send('Not Found', 404);
      }

      return res.end(edaItem.codeWrl);
    });
  }

  function getJsonById(req, res, next) {
    var id = req.params.id;

    return models.EdaItem.findById(req.conn, req.session.user, id, function(err, edaItem) {
      if (err) {
        return next(err);
      }
      if (!edaItem) {
        return res.send('Not Found', 404);
      }

      return res.json(edaItem);
    });
  }

  function getDownload(req, res, next) {
    var id = req.params.id;

    return models.EdaItem.findById(req.conn, null, id, function(err, edaItem) {
      if (err) {
        return next(err);
      }

      if (edaItem.type == models.EdaItem.types.schematicSymbol) {
        res.setHeader('content-type', 'application/octet-stream');
        res.setHeader('content-disposition', 'attachment;filename=' + edaItem.title + '.lib');
        return models.EdaItem.renderLibFileToStream([edaItem], res);
      } else {
        res.setHeader('content-type', 'application/octet-stream');
        res.setHeader('content-disposition', 'attachment;filename=' + edaItem.title + '.mod');
        return models.EdaItem.renderModFileToStream([edaItem], edaItem.unit ? edaItem.unit.name : null, null, res);
      }
    });
  }

  function getById(req, res, next) {
    var id = req.params.id;
    var editable = false;
    var comments = [];

    if (id === 'new') {
      editable = true;
      return render(models.EdaItem.new(req.session.user));
    }

    return models.EdaItem.findById(req.conn, req.session.user, id, function(err, edaItem) {
      if (err) {
        return next(err);
      }
      if (!edaItem) {
        return res.send('Not Found', 404);
      }

      myutil.merge(edaItem, req.body); // could be a validation failure so we want the last values

      if (req.session && req.session.user && req.session.user.id === edaItem.createdBy.id) {
        editable = true;
      }

      return models.EdaItemComment.findByEdaItemId(req.conn, id, function(err, _comments) {
        if (err) {
          return next(err);
        }
        comments = _comments;
        return render(edaItem);
      });
    });

    function render(edaItem) {
      edaItem.has3d = edaItem.codeWrl ? true : false;
      edaItem.jsKiCadData = myutil.kicadCodeToJs(edaItem.code);
      return res.render('edaItem/view.ejs', {
        title: 'Schematic Symbol: ' + edaItem.title,
        item: edaItem,
        editable: editable,
        layout: 'layout.ejs',
        comments: comments
      });
    }
  }

  function postAddComment(req, res, next) {
    var id = parseInt(req.params.id);

    req.assert('body', 'Body is required').notEmpty();

    var errors = req.validationErrors(true);
    if (errors) {
      return getById(req, res, next);
    }

    var comment = new models.EdaItemComment();
    myutil.merge(comment, req.body, ['body']);
    console.log(comment);
    comment.edaItemId = id;
    comment.createdBy = req.session.user.id;
    return comment.save(req.conn, function(err) {
      if (err) {
        return next(err);
      }
      app.flash(req, 'info', 'Comment added.');
      return res.redirect('/edaItem/' + id);
    });
  }

  function postSave(req, res, next) {
    var id = req.params.id;

    req.assert('title', 'Title is required').notEmpty();
    req.assert('code', 'KiCad code is required').notEmpty();

    var errors = req.validationErrors(true);
    if (errors) {
      return getById(req, res, next);
    }

    return models.EdaItem.canEdit(req.conn, req.session.user, id, function(err, canEdit) {
      if (err) {
        return next(err);
      }
      if (!canEdit) {
        return res.send('Cannot edit', 401);
      }

      var data = id == 'new' ? models.EdaItem.new(req.session.user) : {};
      if (req.body.codeWrl == 'null') {
        req.body.codeWrl = null;
      }
      myutil.merge(data, req.body, ['title', 'description', 'keywords', 'code', 'codeWrl']);

      return models.Unit.findOrAddByName(req.conn, req.body.unit, function(err, unit) {
        if (err) {
          return next(err);
        }
        data.unitId = unit.id;
        return saveEdaItem();
      });

      function saveEdaItem() {
        if (id == 'new') {
          data.createdBy = req.session.user.id;
          data.modifiedBy = req.session.user.id;
          data.type = req.body.type;
          return data.save(req.conn, function(err, edaItem) {
            if (err) {
              return next(err);
            }
            return redirect(edaItem);
          });
        } else {
          return models.EdaItem.update(req.conn, id, data, function(err) {
            if (err) {
              return next(err);
            }
            data.id = id;
            return redirect(data);
          });
        }
      }

      function redirect(edaItem) {
        search.indexEdaItem(edaItem, function(err) {
          if (err) {
            return log.error('could not index edaItem: ' + data.id);
          }
          return log.debug('indexed edaItem: ' + data.id);
        });

        app.flash(req, 'info', models.EdaItem.types.getHumanString(req.body.type) + ' Saved');
        return res.redirect('/' + models.EdaItem.types.getUrlString(req.body.type) + '/' + edaItem.id);
      }
    });
  }

  function postVote(req, res, next) {
    var id = req.params.id;
    var state = req.body.state;

    return models.EdaItem.vote(req.conn, id, req.session.user, state, function(err, result) {
      if (err) {
        return next(err);
      }

      return res.json({
        voteCount: result
      });
    });
  }

  function postFavorite(req, res, next) {
    var id = req.params.id;
    var state = req.body.state;

    return models.EdaItem.favorite(req.conn, id, req.session.user, state, function(err, result) {
      if (err) {
        return next(err);
      }

      return res.json({
        favoriteCount: result
      });
    });
  }

  function getEdaItemNew(req, res, next) {
    var edaItem = models.EdaItem.new(req.session.user);
    return res.render('edaItem/view.ejs', {
      title: 'Schematic Symbol: New',
      item: edaItem,
      editable: true,
      layout: 'layout.ejs',
      activeNav: 'new'
    });
  }
};

function runMeshConv(srcFileName, destFileName, callback) {
  var meshConvFileName = path.resolve(__dirname, '../../tools/meshconv');
  var meshConv = spawn(meshConvFileName, [srcFileName, '-c', 'obj', '-o', destFileName]);
  var output = '';
  meshConv.stdout.on('data', function(data) {
    output += 'meshConv: stdout: ' + data;
  });

  meshConv.stderr.on('data', function(data) {
    output += 'meshConv: stderr: ' + data;
  });

  meshConv.on('exit', function(code) {
    if (code === 0) {
      return callback();
    } else {
      return callback(new Error("Could not complete meshConv " + code + ":\n" + output));
    }
  });
}

function runObjToThreeJs(srcFileName, destFileName, callback) {
  var convertObjThreeJsFileName = path.resolve(__dirname, '../../tools/convert_obj_three.py');
  var convertObjThreeJs = spawn('python', [convertObjThreeJsFileName, '-b', '-i', srcFileName, '-o', destFileName]);
  var output = '';
  convertObjThreeJs.stdout.on('data', function(data) {
    output += 'convertObjThreeJs: stdout: ' + data;
  });

  convertObjThreeJs.stderr.on('data', function(data) {
    output += 'convertObjThreeJs: stderr: ' + data;
  });

  convertObjThreeJs.on('exit', function(code) {
    if (code === 0) {
      return callback();
    } else {
      return callback(new Error("Could not complete convert_obj_three.py " + code + ":\n" + output));
    }
  });
}
