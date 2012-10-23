'use strict';

var models = require('../models');
var myutil = require('../util');

module.exports = function(app) {
  app.get('/schematicSymbol/recent', app.withConnection(getRecent));
  app.get('/schematicSymbol/:id', app.withConnection(getSchematicSymbol));
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

    models.SchematicSymbols.findById(req.conn, id, function(err, item) {
      if (err) {
        return next(err);
      }

      if (req.session.user && req.session.user.id === item.createdByUserId) {
        editable = true;
      }

      item.jsKiCadData = myutil.toJsKiCadData(item.text);
      return res.render('schematicSymbol/view.ejs', {
        title: 'Schematic Symbol: ' + item.title,
        item: item,
        editable: editable,
        layout: 'layout.ejs'
      });
    });
  }

  function postSchematicSymbol(req, res, next) {
    var id = req.params.id;

    models.SchematicSymbols.save(req.conn, id, req.body, function(err) {
      if (err) {
        return next(err);
      }

      app.flash(req, 'info', 'Schematic Symbol Saved');
      return res.redirect('/schematicSymbol/' + id);
    });
  }
};
