'use strict';

var express = require('express');
var browserify = require('browserify');
var path = require('path');
var connectRedis = require('connect-redis');
var partials = require('express-partials');
var expressValidator = require('express-validator');
var lessMiddleware = require('less-middleware');
var sf = require('sf');
var fs = require('fs');
var ejs = require('ejs');
var persist = require('persist');

var partialEjs = {

};

module.exports = function(opts) {
  loadPartials(function(err) {
    if (err) {
      console.error("Could not load partials");
      return process.exit(-1);
    }

    var app = express();
    var RedisStore = connectRedis(express);

    app.flash = function(req, level, message) {
      req.session.messages = req.session.messages || [];
      req.session.messages.push({
        level: level,
        message: message
      });
    };

    app.connectionCount = 0;
    app.getConnection = function(callback) {
      app.connectionCount++;
      return persist.connect(callback);
    };

    app.withConnection = function(fn) {
      return function(req, res, next) {
        res.on('finish', function() {
          app.closeConnection(req);
        });
        app.getConnection(function(err, conn) {
          if (err) {
            return next(err);
          }
          req.conn = conn;
          return fn(req, res, next);
        });
      }
    };

    app.closeConnection = function(req) {
      app.connectionCount--;
      if (req.conn) {
        req.conn.close();
        delete req.conn;
      }
    };

    app.set('views', path.join(__dirname, '../web/views'));
    app.set('view engine', 'ejs');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.query());
    app.use(express.cookieParser(opts.sessionSecret));
    app.use(express.session({store: new RedisStore() }));
    app.use(function(req, res, next) {
      res.locals.sf = sf;
      res.locals.session = req.session;
      res.locals.outputFlashes = outputFlashes.bind(null, req, res);
      res.locals.activeNav = 'home';

      res.locals.getValidationError = function(name) {
        var validationErrors = req.validationErrors(true) || {};
        var error = validationErrors[name];
        if (!error) {
          return '';
        }
        return '<span class="help-inline">' + error.msg + '</span>';
      };

      res.locals.getValidationErrorClass = function(name) {
        var validationErrors = req.validationErrors(true) || {};
        var error = validationErrors[name];
        if (!error) {
          return '';
        }
        return 'error';
      };

      return next();
    });
    app.use(partials());
    app.use(expressValidator);
    app.use(app.router);
    app.use(browserify(path.join(__dirname, '../web/public/scripts/browserifyEntry.js')));
    app.use(lessMiddleware({
      src: path.join(__dirname, '../web/public'),
      compress: false
    }));
    app.use(express.static(path.join(__dirname, '../web/public')));
    require('./routes')(app);
    app.listen(opts.port);

    return console.log("worker " + process.pid + " listening on " + opts.port);
  });
};

function loadPartials(callback) {
  fs.readFile(path.join(__dirname, "../web/views/partials/flash.ejs"), 'utf8', function(err, data) {
    if (err) {
      return callback(err);
    }

    partialEjs.flash = ejs.compile(data);
    return callback();
  });
}

function outputFlashes(req, res) {
  var flashes = req.session.messages || [];
  req.session.messages = null;
  req.session.errors = null;
  var result = "";
  flashes.forEach(function(flash) {
    result += partialEjs.flash(flash);
  });

  var validationErrors = req.validationErrors(true);
  if (validationErrors && Object.keys(validationErrors).length > 0) {
    var msg = 'Validation Errors:<ul>';
    Object.keys(validationErrors).forEach(function(k) {
      msg += '<li>' + validationErrors[k].msg + '</li>';
    });
    msg += '</ul>';
    result += partialEjs.flash({
      level: "error",
      message: msg
    });
  }

  return result;
}