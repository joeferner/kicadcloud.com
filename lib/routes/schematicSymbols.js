'use strict';

var models = require('../models');
var myutil = require('../util');

module.exports = function(app) {
  app.get('/schematicSymbol/recent', app.withConnection(getRecent));
  app.get('/schematicSymbol/:id', app.withConnection(getSchematicSymbol));
  app.post('/schematicSymbol/:id/vote', app.withConnection(postVote));
  app.post('/schematicSymbol/:id/favorite', app.withConnection(postFavorite));
  app.post('/schematicSymbol/:id', app.withConnection(postSchematicSymbol));

  function getRecent(req, res, next) {
    models.SchematicSymbols.findRecent(req.conn, function(err, items) {
      if (err) {
        return next(err);
      }
      return res.json(items);
    });
  }

  function getSchematicSymbol(req, res, next) {
    var id = req.params.id;
    var editable = false;

    if (id === 'new') {
      editable = true;
      return render(models.SchematicSymbols.new(req.session.user));
    }

    return models.SchematicSymbols.findById(req.conn, id, function(err, schematicSymbol) {
      if (err) {
        return next(err);
      }
      if (!schematicSymbol) {
        return res.send('Not Found', 404);
      }

      if (req.session && req.session.user && req.session.user.id === schematicSymbol.createdByUserId) {
        editable = true;
      }

      return render(schematicSymbol);
    });

    function render(schematicSymbol) {
      schematicSymbol.jsKiCadData = myutil.toJsKiCadData(schematicSymbol.text);
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
    req.assert('text', 'KiCad code is required').notEmpty();

    var errors = req.validationErrors(true);
    if (errors) {
      app.flashValidationErrors(req, res, errors);
      req.session.previousValues = req.body;
      return res.redirect('/schematicSymbol/' + id);
    }

    return models.SchematicSymbols.save(req.conn, id, req.session.user, req.body, function(err, schematicSymbol) {
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

    return models.SchematicSymbols.vote(req.conn, id, req.session.user, state, function(err, result) {
      if (err) {
        return next(err);
      }

      return res.json(result);
    });
  }

  function postFavorite(req, res, next) {
    var id = req.params.id;
    var state = req.body.state;

    return models.SchematicSymbols.favorite(req.conn, id, req.session.user, state, function(err, result) {
      if (err) {
        return next(err);
      }

      return res.json(result);
    });
  }
};
