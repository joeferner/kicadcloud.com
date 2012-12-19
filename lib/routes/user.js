'use strict';

var models = require('../models');
var myutil = require('../util');

module.exports = function(app) {
  app.get('/user/login', getLogin);
  app.get('/user/logout', getLogout);
  app.post('/user/login', app.withConnection(postLogin));
  app.post('/user/signUp', app.withConnection(postSignup));
  app.get('/user/signUpSuccess', getSignUpSuccess);
  app.get('/user/:id/favorites.zip', app.withConnection(getUserFavoritesZip));
  app.get('/user/:id/favorites', app.withConnection(getUserFavorites));
  app.get('/user/:id/items.zip', app.withConnection(getUserItemsZip));
  app.get('/user/:id/items', app.withConnection(getUserItems));
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

    models.User.findByUsernameOrEmail(req.conn, username, function(err, user) {
      if (err || !user || !user.verifyPassword(password)) {
        app.flash(req, 'error', 'Invalid username or password');
        return res.redirect('/user/login?source=' + source);
      }

      updateSessionUser(req, user);

      return res.redirect(source);
    });
  }

  function updateSessionUser(req, user) {
    user.gravatarUrl = user.getGravatarUrl();
    req.session.user = user;
  }

  function postSignup(req, res, next) {
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

    models.User.isUsernameOrEmailTaken(req.conn, null, req.body.username, req.body.email, function(err, taken) {
      if (err) {
        return next(err);
      }
      if (taken) {
        app.flash(req, 'error', taken + ' is already taken');
        return getLogin(req, res, next);
      }

      var user = new models.User({
        username: req.body.username,
        email: req.body.email
      });
      user.setPassword(req.body.password1);
      return user.save(req.conn, function(err) {
        if (err) {
          return next(err);
        }
        return res.redirect('/user/signUpSuccess');
      });
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
        item: user,
        activeNav: 'me'
      });
    });
  }

  function postUser(req, res, next) {
    var userId = req.params.id;

    req.assert('username', 'Username is required').notEmpty();
    req.assert('email', 'Email is required').notEmpty();

    var errors = req.validationErrors(true);
    if (errors) {
      return getUser(req, res, next);
    }

    return models.User.isUsernameOrEmailTaken(req.conn, userId, req.body.username, req.body.email, function(err, taken) {
      if (err) {
        return next(err);
      }

      if (taken) {
        app.flash(req, 'error', taken + ' is already taken.');
        return getUser(req, res, next);
      }

      return models.User.canEdit(req.conn, req.session.user, userId, function(err, canEdit) {
        if (err) {
          return next(err);
        }
        if (!canEdit) {
          return res.send('Cannot edit', 401);
        }

        var data = {};
        myutil.merge(data, req.body, ['username', 'email']);

        return models.User.update(req.conn, userId, data, function(err) {
          if (err) {
            return next(err);
          }

          if (userId == req.session.user.id) {
            return models.User.findById(req.conn, userId, function(err, user) {
              updateSessionUser(req, user);
              return flashAndRedirect();
            });
          }

          return flashAndRedirect();
        });
      });
    });

    function flashAndRedirect() {
      app.flash(req, 'info', 'User Saved');
      return res.redirect('/user/' + userId);
    }
  }

  function getUserFavoritesZip(req, res, next) {
    var userId = req.params.id;

    models.UserFavoriteEdaItem.findByUserId(req.conn, userId, function(err, favorites) {
      if (err) {
        return next(err);
      }

      res.setHeader('content-type', 'application/zip');
      res.setHeader('content-disposition', 'attachment;filename=userFavorites.zip');
      return models.EdaItem.renderZipFile(favorites, 'userFavorites', res, next);
    });
  }

  function getUserFavorites(req, res, next) {
    var userId = req.params.id;

    models.UserFavoriteEdaItem.findByUserId(req.conn, userId, function(err, favorites) {
      if (err) {
        return next(err);
      }
      return res.render('edaItem/list.ejs', {
        layout: null,
        items: favorites,
        showDownloadLinks: true,
        idPrefix: 'favorite_',
        zipFileDownloadUrl: '/user/' + userId + '/favorites.zip'
      });
    });
  }

  function getUserItemsZip(req, res, next) {
    var userId = req.params.id;

    models.EdaItem.findByUserId(req.conn, userId, function(err, items) {
      if (err) {
        return next(err);
      }
      res.setHeader('content-type', 'application/zip');
      res.setHeader('content-disposition', 'attachment;filename=userItems.zip');
      return models.EdaItem.renderZipFile(items, 'userItems', res, next);
    });
  }

  function getUserItems(req, res, next) {
    var userId = req.params.id;

    models.EdaItem.findByUserId(req.conn, userId, function(err, items) {
      if (err) {
        return next(err);
      }
      return res.render('edaItem/list.ejs', {
        layout: null,
        items: items,
        showDownloadLinks: true,
        idPrefix: 'user_items_',
        zipFileDownloadUrl: '/user/' + userId + '/items.zip'
      });
    });
  }
};
