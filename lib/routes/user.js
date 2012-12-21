'use strict';

var fs = require('fs');
var path = require('path');
var ejs = require('ejs');
var email = require('email');
var log = require('../log');
var models = require('../models');
var myutil = require('../util');

module.exports = function(app) {
  var verificationEmailTemplateFileName = path.resolve(__dirname, '../../templates/verificationEmail.ejs');
  var verificationEmailTemplateStr = fs.readFileSync(verificationEmailTemplateFileName, 'utf8');
  var verificationEmailTemplate = ejs.compile(verificationEmailTemplateStr, {});

  var forgotPasswordTemplateFileName = path.resolve(__dirname, '../../templates/forgotPassword.ejs');
  var forgotPasswordTemplateStr = fs.readFileSync(forgotPasswordTemplateFileName, 'utf8');
  var forgotPasswordTemplate = ejs.compile(forgotPasswordTemplateStr, {});

  app.get('/user/login', getLogin);
  app.get('/user/logout', getLogout);
  app.post('/user/login', app.withConnection(postLogin));
  app.post('/user/signUp', app.withConnection(postSignup));
  app.get('/user/:id/notVerified', app.withConnection(getUserNotVerified));
  app.get('/user/:id/verify', app.withConnection(getVerifiy));
  app.post('/user/:id/resendVerification', app.withConnection(postResendVerification));
  app.get('/user/forgotPassword', getForgotPassword);
  app.post('/user/forgotPassword', app.withConnection(postForgotPassword));
  app.get('/user/:id/resetPassword', app.withConnection(getResetPassword));
  app.post('/user/:id/resetPassword', app.withConnection(postResetPassword));
  app.get('/user/signUpSuccess', getSignUpSuccess);
  app.get('/user/emailResent', getEmailResent);
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
        log.warn('Invalid username or password attempt: ' + username);
        app.flash(req, 'error', 'Invalid username or password. <a href="/user/forgotPassword">Click Here</a> to reset password.');
        return res.redirect('/user/login?source=' + source);
      }

      if (!user.verified) {
        app.flash(req, 'error', 'You have not been verified yet.');
        return res.redirect('/user/' + user.id + '/notVerified');
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
        email: req.body.email,
        verified: false
      });
      user.setPassword(req.body.password1);
      return user.save(req.conn, function(err) {
        if (err) {
          return next(err);
        }

        return sendVerificationEmail(user, function(err) {
          if (err) {
            return next(err);
          }
          return res.redirect('/user/signUpSuccess');
        });
      });
    });
  }

  function getForgotPassword(req, res, next) {
    return res.render('user/forgotPassword.ejs', {
      title: 'Forgot Password',
      layout: 'layout.ejs'
    });
  }

  function postForgotPassword(req, res, next) {
    var email = req.body.email;

    return models.User.findByUsernameOrEmail(req.conn, email, function(err, user) {
      if (err) {
        return next(err);
      }
      if (!user) {
        app.flash(req, 'error', 'Could not find user.');
        return res.redirect('/user/forgotPassword');
      }

      return sendForgotPasswordEmail(user, function(err) {
        if (err) {
          return next(err);
        }
        app.flash(req, 'info', 'Reminder email has been sent.');
        return res.redirect('/user/login');
      });
    });
  }

  function getResetPassword(req, res, next) {
    var userId = req.params.id;
    var verificationToken = req.query.verificationToken;

    return models.User.findById(req.conn, userId, function(err, user) {
      if (err) {
        return next(err);
      }
      if (user.password != verificationToken) {
        app.flash(req, 'error', 'Invalid verification token.');
        return res.redirect('/user/forgotPassword');
      }

      return res.render('user/resetPassword.ejs', {
        title: 'Reset Password',
        layout: 'layout.ejs',
        userId: userId,
        verificationToken: verificationToken
      });
    });
  }

  function postResetPassword(req, res, next) {
    var userId = req.params.id;
    var verificationToken = req.body.verificationToken;
    var newPassword = req.body.newPassword;
    var newPasswordVerify = req.body.newPasswordVerify;

    console.log(userId, verificationToken, newPassword, newPasswordVerify);

    return models.User.findById(req.conn, userId, function(err, user) {
      if (err) {
        return next(err);
      }
      if (user.password != verificationToken) {
        app.flash(req, 'error', 'Invalid verification token.');
        return res.redirect('/user/forgotPassword');
      }

      if (newPassword != newPasswordVerify) {
        app.flash(req, 'error', 'Passwords do not match.');
        return res.render('user/resetPassword.ejs', {
          title: 'Reset Password',
          layout: 'layout.ejs',
          userId: userId,
          verificationToken: verificationToken
        });
      }

      user.setPassword(newPassword);
      return models.User.update(req.conn, userId, {password: user.password}, function(err) {
        if (err) {
          return next(err);
        }
        app.flash(req, 'info', 'Password reset.');
        return res.redirect('/user/login');
      });
    });
  }

  function getEmailResent(req, res, next) {
    return res.render('user/emailResent.ejs', {
      title: 'Email Resent',
      layout: 'layout.ejs'
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

    if (req.body.currentPassword) {
      if (!req.body.newPassword) {
        req._validationErrors = req._validationErrors || [];
        req._validationErrors.push({
          param: 'newPassword',
          msg: 'You must specify a new password',
          value: ''
        });
      }
      else if (req.body.newPassword !== req.body.newPasswordVerify) {
        req._validationErrors = req._validationErrors || [];
        req._validationErrors.push({
          param: 'newPassword',
          msg: 'New passwords do not match',
          value: ''
        });
      }
    }

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

        return models.User.findById(req.conn, userId, function(err, user) {
          if (err) {
            return next(err);
          }

          if (req.body.currentPassword && !user.verifyPassword(req.body.currentPassword)) {
            req._validationErrors = req._validationErrors || [];
            req._validationErrors.push({
              param: 'currentPassword',
              msg: 'Current password does not match.',
              value: ''
            });
            var errors = req.validationErrors(true);
            return getUser(req, res, next);
          }

          user.username = req.body.username;
          user.email = req.body.email;
          if (req.body.currentPassword) {
            user.setPassword(req.body.newPassword);
          }

          return user.save(req.conn, function(err) {
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
    });

    function flashAndRedirect() {
      app.flash(req, 'info', 'User Saved');
      return res.redirect('/user/' + userId);
    }
  }

  function getVerifiy(req, res, next) {
    var userId = req.params.id;

    models.User.findById(req.conn, userId, function(err, user) {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.send('Not Found', 404);
      }

      log.info('verifying user: ' + user.username);
      return models.User.update(req.conn, user.id, {verified: true}, function(err) {
        if (err) {
          return next(err);
        }
        app.flash(req, 'info', 'User Verified. You may now login.');
        return res.redirect('/user/login');
      });
    });
  }

  function getUserNotVerified(req, res, next) {
    var userId = req.params.id;

    models.User.findById(req.conn, userId, function(err, user) {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.send('Not Found', 404);
      }

      return res.render('user/notVerified.ejs', {
        title: 'User Not Verified: ' + user.username,
        layout: 'layout.ejs',
        user: user,
        activeNav: null
      });
    });
  }

  function postResendVerification(req, res, next) {
    var userId = req.params.id;

    models.User.findById(req.conn, userId, function(err, user) {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.send('Not Found', 404);
      }

      return sendVerificationEmail(user, function(err) {
        if (err) {
          return next(err);
        }
        return res.redirect('user/emailResent');
      });
    });
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

  function sendForgotPasswordEmail(user, callback) {
    // todo: send email
    log.info('sending forgotPassword email to: ' + user.username);
    var emailBody = forgotPasswordTemplate({
      user: user
    });
    var myMsg = new email.Email({
      from: "support@kicadcloud.com",
      to: user.email,
      subject: "KiCadCloud: Password Reset",
      body: emailBody,
      bodyType: 'html'
    });
    return myMsg.send(callback);
  }

  function sendVerificationEmail(user, callback) {
    // todo: send email
    log.info('sending verification email to: ' + user.username);
    var emailBody = verificationEmailTemplate({
      user: user
    });
    var myMsg = new email.Email({
      from: "support@kicadcloud.com",
      to: user.email,
      subject: "KiCadCloud: Verification Email",
      body: emailBody,
      bodyType: 'html'
    });
    return myMsg.send(callback);
  }
};
