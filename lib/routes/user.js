'use strict';

var models = require('../models');

module.exports = function(app) {
  app.get('/user/login', getLogin);
  app.post('/user/login', app.withConnection(postLogin));

  function getLogin(req, res, next) {
    res.render('user/login.ejs', {
      title: 'Home',
      layout: 'layout.ejs'
    });
  }

  function postLogin(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;

    models.User.validate(req.conn, username, password, function(err, user) {
      if (err) {
        app.flash(req, 'error', 'Invalid username or password');
        return res.redirect('/user/login');
      }

      req.session.user = user;
      return res.redirect('/');
    });
  }
};
