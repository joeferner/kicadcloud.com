'use strict';

var models = require('../models');
var myutil = require('../util');
var Warning = require('../warning');

module.exports = function(app) {
  app.get('/search', app.withConnection(getSearch));
  app.get('/search.json', app.withConnection(getSearchJson));

  function getSearchJson(req, res, next) {
    var opts = req.body;
    myutil.merge(opts, req.query);

    models.EdaItem.search(req.conn, opts, function(err, items) {
      var results = {
        items: items
      };
      if (err) {
        if (err instanceof Warning) {
          results.warning = 'Invalid search query: ' + err;
        } else {
          return next(err);
        }
      }

      results.items = models.EdaItem.toPublic(results.items);

      return res.json(results);
    });
  }

  function getSearch(req, res, next) {
    var opts = req.body;
    myutil.merge(opts, req.query);

    models.EdaItem.search(req.conn, opts, function(err, items) {
      if (err) {
        if (err instanceof Warning) {
          app.flash(req, 'info', 'Invalid search query: ' + err);
          items = [];
        } else {
          return next(err);
        }
      }

      return res.render('home/search.ejs', {
        title: 'Search Results',
        layout: 'layout.ejs',
        items: items,
        searchOpts: opts,
        showDownloadLinks: false,
        idPrefix: 'search_',
        searchString: opts.q
      });
    });
  }
};
