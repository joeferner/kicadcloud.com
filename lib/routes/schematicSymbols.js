'use strict';

var models = require('../models');

module.exports = function(app) {
  app.get('/schematicSymbol/recent', app.withConnection(getRecent));
  app.get('/schematicSymbol/:id', app.withConnection(getSchematicSymbol));

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

    models.SchematicSymbols.findById(req.conn, id, function(err, item) {
      if (err) {
        return next(err);
      }
      item.jsKiDadData = item.text.split('\n').join('\\n').replace(/'/g, "\\'");
      return res.render('schematicSymbol/view.ejs', {
        title: 'Schematic Symbol: ' + item.title,
        item: item,
        editable: false,
        layout: 'layout.ejs'
      });
    });
  }
};
