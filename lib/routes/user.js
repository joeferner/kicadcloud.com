'use strict';

var models = require('../models');
var myutil = require('../util');
var gravatar = require('gravatar');

module.exports = function(app) {
  app.get('/user/login', getLogin);
  app.get('/user/logout', getLogout);
  app.post('/user/login', app.withConnection(postLogin));
  app.post('/user/signUp', app.withConnection(postSignup));
  app.get('/user/signUpSuccess', getSignUpSuccess);
  app.get('/user/:id', app.withConnection(getUser));
  app.post('/user/:id', app.withConnection(postUser));

  function getLogin(req, res, next) {
    var userInfo = {
      username: '',
      email: ''
    };

    myutil.merge(userInfo, req.body);

    return res.render('user/login.ejs', {
      title: 'Log In',
      layout: 'layout.ejs',
      userInfo: userInfo
    });
  }

  function getLogout(req, res, next) {
    req.session.user = null;
    return res.redirect('/');
  }

  function postLogin(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var source = req.params.source || '/';

    models.User.validate(req.conn, username, password, function(err, user) {
      if (err) {
        app.flash(req, 'error', 'Invalid username or password');
        return res.redirect('/user/login?source=' + source);
      }

      user.gravatarUrl = gravatar.url(user.email || '', {
        s: 32
      });

      req.session.user = user;
      return res.redirect(source);
    });
  }

  function postSignup(req, res, next) {
    var source = req.params.source || '/';

    req.assert('username', 'Username is required').notEmpty();
    req.assert('email', 'Valid email is required').isEmail();
    if (req.body.password1 !== req.body.password2) {
      req._validationErrors = req._validationErrors || [];
      req._validationErrors.push({
        param: 'password',
        msg: 'Passwords do not match',
        value: ''
      });
    } else if (!req.body.password1) {
      req._validationErrors = req._validationErrors || [];
      req._validationErrors.push({
        param: 'password',
        msg: 'Passwords is required',
        value: ''
      });
    }

    var errors = req.validationErrors(true);
    if (errors) {
      return getLogin(req, res, next);
    }

    return models.User.add(req.conn, {
      username: req.body.username,
      password: req.body.password1,
      email: req.body.email
    }, function(err) {
      if (err) {
        return next(err);
      }
      return res.redirect('/user/signUpSuccess');
    });
  }

  function getSignUpSuccess(req, res, next) {
    return res.render('user/signUpSuccess.ejs', {
      title: 'Sign Up Success',
      layout: 'layout.ejs'
    });
  }

  function getUser(req, res, next) {
    var userId = req.params.id;

    models.User.findById(req.conn, userId, function(err, user) {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.send('Not Found', 404);
      }

      myutil.merge(user, req.body); // could be a validation failure so we want the last values

      var editable = false;
      if (req.session && req.session.user) {
        editable = user.id == req.session.user.id;
      }

      return res.render('user/view.ejs', {
        title: 'User: ' + user.username,
        layout: 'layout.ejs',
        editable: editable,
        item: user
      });
    });
  }

  function postUser(req, res, next) {
    var id = req.params.id;

    req.assert('username', 'Username is required').notEmpty();
    req.assert('email', 'Email is required').notEmpty();

    var errors = req.validationErrors(true);
    if (errors) {
      return getUser(req, res, next);
    }

    return models.User.save(req.conn, id, req.session.user, req.body, function(err, user) {
      if (err) {
        return next(err);
      }

      app.flash(req, 'info', 'User Saved');
      return res.redirect('/user/' + user.id);
    });
  }
};
