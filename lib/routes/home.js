'use strict';

module.exports = function(app) {
  app.get('/', function(req, res, next) {
    res.render('home/home.ejs', {
      title: 'Home',
      layout: 'layout.ejs'
    });
  });
};
