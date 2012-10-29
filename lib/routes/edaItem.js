'use strict';

var async = require('async');
var models = require('../models');
var myutil = require('../util');

module.exports = function(app) {
  app.get('/schematicSymbol/recent', app.withConnection(getRecent.bind(null, models.EdaItem.types.schematicSymbol)));
  app.get('/schematicSymbol/:id.json', app.withConnection(getJsonById));
  app.get('/schematicSymbol/:id', app.withConnection(getById));
  app.post('/schematicSymbol/:id/vote', app.withConnection(postVote));
  app.post('/schematicSymbol/:id/favorite', app.withConnection(postFavorite));
  app.post('/schematicSymbol/:id', app.withConnection(postSave.bind(null, models.EdaItem.types.schematicSymbol)));

  app.get('/pcbModule/recent', app.withConnection(getRecent.bind(null, models.EdaItem.types.pcbModule)));
  app.get('/pcbModule/:id.json', app.withConnection(getJsonById));
  app.get('/pcbModule/:id', app.withConnection(getById));
  app.post('/pcbModule/:id/vote', app.withConnection(postVote));
  app.post('/pcbModule/:id/favorite', app.withConnection(postFavorite));
  app.post('/pcbModule/:id', app.withConnection(postSave.bind(null, models.EdaItem.types.pcbModule)));

  app.get('/edaItem/upload', getEdaItemUpload);
  app.post('/edaItem/upload', app.withConnection(postEdaItemUpload));

  function getRecent(edaItemType, req, res, next) {
    models.EdaItem.findRecent(req.conn, edaItemType, function(err, items) {
      if (err) {
        return next(err);
      }
      return res.json(items);
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

  function getById(req, res, next) {
    var id = req.params.id;
    var editable = false;

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

      return render(edaItem);
    });

    function render(edaItem) {
      edaItem.jsKiCadData = myutil.kicadCodeToJs(edaItem.code);
      return res.render('edaItem/view.ejs', {
        title: 'Schematic Symbol: ' + edaItem.title,
        item: edaItem,
        editable: editable,
        layout: 'layout.ejs'
      });
    }
  }

  function postSave(edaItemType, req, res, next) {
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

      var data = {};
      myutil.merge(data, req.body, ['title', 'description', 'keywords', 'code']);

      return models.EdaItem.update(req.conn, id, data, function(err) {
        if (err) {
          return next(err);
        }

        app.flash(req, 'info', models.EdaItem.types.getHumanString(edaItemType) + ' Saved');
        return res.redirect('/' + models.EdaItem.types.getUrlString(edaItemType) + '/' + id);
      });
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

  function getEdaItemUpload(req, res, next) {
    return res.render('edaItem/upload.ejs', {
      title: 'Upload',
      layout: 'layout.ejs',
      activeNav: 'upload'
    });
  }

  function postEdaItemUpload(req, res, next) {
    if (!req.session.user) {
      return next(new Error("You must be logged in to upload items"));
    }
    if (!req.body.fileType) {
      return next(new Error("Invalid file type."));
    }

    return async.forEachSeries(req.body.itemList, function(itemKey, callback) {
      var item = new models.EdaItem({
        type: req.body.fileType,
        title: req.body['title_' + itemKey],
        description: req.body['description_' + itemKey],
        keywords: req.body['keywords_' + itemKey],
        code: req.body['code_' + itemKey]
      });
      item.save(req.conn, callback);
    }, function(err) {
      if (err) {
        return next(err);
      }

      app.flash(req, 'info', 'Items saved');
      if (req.body.ajax) {
        return res.send('OK', 200);
      } else {
        return res.redirect('/');
      }
    });
  }
};
