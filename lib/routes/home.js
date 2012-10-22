'use strict';

module.exports = function(app) {
  app.get('/', getHome);

  function getHome(req, res, next) {
    res.render('home/home.ejs', {
      title: 'Home',
      layout: 'layout.ejs'
    });
  }
};
