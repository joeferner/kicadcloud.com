'use strict';

var models = require('../models');
var myutil = require('../util');

module.exports = function(app) {
  app.get('/pcbModule/recent', app.withConnection(getRecent));
  app.get('/pcbModule/:id.json', app.withConnection(getPcbModuleJson));
  app.get('/pcbModule/:id', app.withConnection(getPcbModule));
  app.post('/pcbModule/:id/vote', app.withConnection(postVote));
  app.post('/pcbModule/:id/favorite', app.withConnection(postFavorite));
  app.post('/pcbModule/:id', app.withConnection(postPcbModule));

  function getRecent(req, res, next) {
    models.PcbModule.findRecent(req.conn, function(err, items) {
      if (err) {
        return next(err);
      }
      return res.json(items);
    });
  }

  function getPcbModuleJson(req, res, next) {
    var id = req.params.id;

    return models.PcbModule.findById(req.conn, req.session.user, id, function(err, schematicSymbol) {
      if (err) {
        return next(err);
      }
      if (!pcbModule) {
        return res.send('Not Found', 404);
      }

      return res.json(pcbModule);
    });
  }

  function getPcbModule(req, res, next) {
    var id = req.params.id;
    var editable = false;

    if (id === 'new') {
      editable = true;
      return render(models.PcbModule.new(req.session.user));
    }

    return models.PcbModule.findById(req.conn, req.session.user, id, function(err, pcbModule) {
      if (err) {
        return next(err);
      }
      if (!pcbModule) {
        return res.send('Not Found', 404);
      }

      myutil.merge(pcbModule, req.body); // could be a validation failure so we want the last values

      if (req.session && req.session.user && req.session.user.id === pcbModule.createdBy.id) {
        editable = true;
      }

      return render(pcbModule);
    });

    function render(pcbModule) {
      pcbModule.jsKiCadData = myutil.kicadCodeToJs(pcbModule.code);
      return res.render('pcbModule/view.ejs', {
        title: 'Schematic Symbol: ' + pcbModule.title,
        item: pcbModule,
        editable: editable,
        layout: 'layout.ejs'
      });
    }
  }

  function postPcbModule(req, res, next) {
    var id = req.params.id;

    req.assert('title', 'Title is required').notEmpty();
    req.assert('code', 'KiCad code is required').notEmpty();

    var errors = req.validationErrors(true);
    if (errors) {
      return getPcbModule(req, res, next);
    }

    return models.PcbModule.save(req.conn, id, req.session.user, req.body, function(err, pcbModule) {
      if (err) {
        return next(err);
      }

      app.flash(req, 'info', 'Schematic Symbol Saved');
      return res.redirect('/pcbModule/' + pcbModule.id);
    });
  }

  function postVote(req, res, next) {
    var id = req.params.id;
    var state = req.body.state;

    return models.PcbModule.vote(req.conn, id, req.session.user, state, function(err, result) {
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

    return models.PcbModule.favorite(req.conn, id, req.session.user, state, function(err, result) {
      if (err) {
        return next(err);
      }

      return res.json({
        favoriteCount: result
      });
    });
  }
};
