'use strict';

var models = require('../models');

module.exports = function(app) {
  app.get('/schematicSymbols/recent', app.withConnection(getRecent));

  function getRecent(req, res, next) {
    models.SchematicSymbols.findRecent(req.conn, function(err, items) {
      if (err) {
        return next(err);
      }
      return res.json(items);
    });
  }
};
