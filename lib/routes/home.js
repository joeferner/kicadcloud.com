'use strict';

var models = require('../models');
var myutil = require('../util');

module.exports = function(app) {
  app.get('/', getHome);
  app.get('/search', app.withConnection(getSearch));

  function getHome(req, res, next) {
    res.render('home/home.ejs', {
      title: 'Home',
      layout: 'layout.ejs'
    });
  }

  function getSearch(req, res, next) {
    var opts = req.body;
    myutil.merge(opts, req.query);

    models.EdaItem.search(req.conn, opts, function(err, items) {
      if (err) {
        return next(err);
      }

      return res.render('home/search.ejs', {
        title: 'Search Results',
        layout: 'layout.ejs',
        items: items,
        searchOpts: opts,
        showDownloadLinks: false,
        idPrefix: 'search_'
      });
    });
  }
};
