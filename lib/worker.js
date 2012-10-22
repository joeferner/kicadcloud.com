'use strict';

var express = require('express');
var browserify = require('browserify');
var path = require('path');
var connectRedis = require('connect-redis');

module.exports = function(opts) {
  var app = express();
  var RedisStore = connectRedis(express);

  app.getConnection = function(callback) {
    return callback(null, {}); // TODO: change this
  };

  app.set('views', path.join(__dirname, '../web/views'));
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.query());
  app.use(express.cookieParser());
  app.use(express.session({secret: opts.sessionSecret, store: new RedisStore() }));
  app.use(app.router);
  app.use(browserify(path.join(__dirname, '../web/public/scripts/browserifyEntry.js')));
  app.use(express.static(path.join(__dirname, '../web/public')));
  require('./routes')(app);
  app.listen(opts.port);

  console.log("worker " + process.pid + " listening on " + opts.port);
};
