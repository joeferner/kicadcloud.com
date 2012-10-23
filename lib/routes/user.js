'use strict';

var models = require('../models');

module.exports = function(app) {
  app.get('/user/login', getLogin);
  app.post('/user/login', app.withConnection(postLogin));
  app.post('/user/signUp', app.withConnection(postSignup));
  app.get('/user/signUpSuccess', getSignUpSuccess);
  app.get('/user/:id', app.withConnection(getUser));

  function getLogin(req, res, next) {
    res.render('user/login.ejs', {
      title: 'Log In',
      layout: 'layout.ejs'
    });
  }

  function postLogin(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var source = req.params.source || '/';
    req.session.username = username;

    models.User.validate(req.conn, username, password, function(err, user) {
      if (err) {
        app.flash(req, 'error', 'Invalid username or password');
        return res.redirect('/user/login?source=' + source);
      }

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
      app.flashValidationErrors(req, res, errors);
      req.session.previousValues = req.body;
      return res.redirect('/user/login?source=' + source);
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

      return res.render('user/view.ejs', {
        title: 'User: ' + user.name,
        layout: 'layout.ejs',
        editable: false,
        item: user
      });
    });
  }
};
