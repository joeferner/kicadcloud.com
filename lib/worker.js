'use strict';

var express = require('express');
var browserify = require('browserify');
var path = require('path');
var connectRedis = require('connect-redis');
var partials = require('express-partials')
var sf = require('sf');
var fs = require('fs');
var ejs = require('ejs');

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

    app.getConnection = function(callback) {
      return callback(null, {}); // TODO: change this
    };

    app.set('views', path.join(__dirname, '../web/views'));
    app.set('view engine', 'ejs');
    app.use(function(req, res, next) {
      res.locals.sf = function(req, res) {
        return sf;
      };
      res.locals.session = getSession;
      res.locals.outputFlashes = outputFlashes;
      return next();
    });
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.query());
    app.use(express.cookieParser());
    app.use(express.session({secret: opts.sessionSecret, store: new RedisStore() }));
    app.use(partials());
    app.use(app.router);
    app.use(browserify(path.join(__dirname, '../web/public/scripts/browserifyEntry.js')));
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

function getSession(req, res) {
  return req.session;
}

function outputFlashes(req, res) {
  var flashes = req.flash();
  var result = "";
  flashes.forEach(function(type) {
    var flashesByType = flashes[type];
    flashesByType.forEach(function(flash) {
      result += partialEjs.flash({
        type: type,
        message: flash
      });
    });
  });
  return result;
}
