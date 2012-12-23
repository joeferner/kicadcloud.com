'use strict';

var fs = require('fs');
var log = require('./log');

module.fileName = '/var/log/kicadcloud/access.log';

module.exports = function() {
  return function logger(req, res, next) {
    req._startTime = Date.now();

    var end = res.end;
    res.end = function(chunk, encoding) {
      res.end = end;
      var result = res.end(chunk, encoding);
      res._endTime = Date.now();
      writeLog(req, res);
      return result;
    };

    next();
  };
};

function writeLog(req, res) {
  var line = format(req, res);
  return fs.appendFile(module.fileName, line, function(err) {
    if (err) {
      log.error('could not log to access log', err);
    }
  });
}

function format(req, res) {
  var line =
    getRemoteAddr(req)
      + ' - - ['
      + getDate()
      + '] "'
      + getMethod(req)
      + ' '
      + getUrl(req)
      + ' HTTP/'
      + getHttpVersion(req)
      + '" '
      + getStatus(req, res)
      + ' '
      + getContentLength(req, res)
      + ' "'
      + getReferer(req)
      + '" "'
      + getUserAgent(req)
      + '"\n';
  return line;
}

function getRemoteAddr(req) {
  if (req.ip) {
    return req.ip;
  }
  var sock = req.socket;
  if (sock.socket) {
    return sock.socket.remoteAddress;
  }
  return sock.remoteAddress;
}

function getDate() {
  return new Date().toUTCString();
}

function getMethod(req) {
  return req.method;
}

function getUrl(req) {
  return req.originalUrl || req.url;
}

function getHttpVersion(req) {
  return req.httpVersionMajor + '.' + req.httpVersionMinor;
}

function getStatus(req, res) {
  return res.statusCode;
}

function getContentLength(req, res) {
  return (res._headers || {})['content-length'] || '?';
}

function getReferer(req) {
  return req.headers['referer'] || req.headers['referrer'] || '';
}

function getUserAgent(req) {
  return req.headers['user-agent'];
}