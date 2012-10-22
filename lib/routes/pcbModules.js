'use strict';

var models = require('../models');

module.exports = function(app) {
  app.get('/pcbModules/recent', app.withConnection(getRecent));

  function getRecent(req, res, next) {
    models.PcbModules.findRecent(req.conn, function(err, items) {
      if (err) {
        return next(err);
      }
      return res.json(items);
    });
  }
};
