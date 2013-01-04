'use strict';

var models = require('../models');
var myutil = require('../util');
var Warning = require('../warning');

module.exports = function(app) {
  app.get('/', getHome);
  app.get('/errorPage', getErrorPage);

  function getHome(req, res, next) {
    res.render('home/home.ejs', {
      title: 'Home',
      layout: 'layout.ejs',
      activeNav: 'home'
    });
  }

  function getErrorPage(req, res, next) {
    return next(new Error("Test error message"));
  }
};
