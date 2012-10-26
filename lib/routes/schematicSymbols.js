'use strict';

var models = require('../models');
var myutil = require('../util');

module.exports = function(app) {
  app.get('/schematicSymbol/recent', app.withConnection(getRecent));
  app.get('/schematicSymbol/:id.json', app.withConnection(getSchematicSymbolJson));
  app.get('/schematicSymbol/:id', app.withConnection(getSchematicSymbol));
  app.post('/schematicSymbol/:id/vote', app.withConnection(postVote));
  app.post('/schematicSymbol/:id/favorite', app.withConnection(postFavorite));
  app.post('/schematicSymbol/:id', app.withConnection(postSchematicSymbol));

  function getRecent(req, res, next) {
    models.SchematicSymbol.findRecent(req.conn, function(err, items) {
      if (err) {
        return next(err);
      }
      return res.json(items);
    });
  }

  function getSchematicSymbolJson(req, res, next) {
    var id = req.params.id;

    return models.SchematicSymbol.findById(req.conn, req.session.user, id, function(err, schematicSymbol) {
      if (err) {
        return next(err);
      }
      if (!schematicSymbol) {
        return res.send('Not Found', 404);
      }

      return res.json(schematicSymbol);
    });
  }

  function getSchematicSymbol(req, res, next) {
    var id = req.params.id;
    var editable = false;

    if (id === 'new') {
      editable = true;
      return render(models.SchematicSymbol.new(req.session.user));
    }

    return models.SchematicSymbol.findById(req.conn, req.session.user, id, function(err, schematicSymbol) {
      if (err) {
        return next(err);
      }
      if (!schematicSymbol) {
        return res.send('Not Found', 404);
      }

      myutil.merge(schematicSymbol, req.body); // could be a validation failure so we want the last values

      if (req.session && req.session.user && req.session.user.id === schematicSymbol.createdBy.id) {
        editable = true;
      }

      return render(schematicSymbol);
    });

    function render(schematicSymbol) {
      schematicSymbol.jsKiCadData = myutil.kicadCodeToJs(schematicSymbol.code);
      return res.render('schematicSymbol/view.ejs', {
        title: 'Schematic Symbol: ' + schematicSymbol.title,
        item: schematicSymbol,
        editable: editable,
        layout: 'layout.ejs'
      });
    }
  }

  function postSchematicSymbol(req, res, next) {
    var id = req.params.id;

    req.assert('title', 'Title is required').notEmpty();
    req.assert('code', 'KiCad code is required').notEmpty();

    var errors = req.validationErrors(true);
    if (errors) {
      return getSchematicSymbol(req, res, next);
    }

    return models.SchematicSymbol.save(req.conn, id, req.session.user, req.body, function(err, schematicSymbol) {
      if (err) {
        return next(err);
      }

      app.flash(req, 'info', 'Schematic Symbol Saved');
      return res.redirect('/schematicSymbol/' + schematicSymbol.id);
    });
  }

  function postVote(req, res, next) {
    var id = req.params.id;
    var state = req.body.state;

    return models.SchematicSymbol.vote(req.conn, id, req.session.user, state, function(err, result) {
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

    return models.SchematicSymbol.favorite(req.conn, id, req.session.user, state, function(err, result) {
      if (err) {
        return next(err);
      }

      return res.json({
        favoriteCount: result
      });
    });
  }
};
