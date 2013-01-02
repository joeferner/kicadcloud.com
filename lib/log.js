'use strict';

var bunyan = require('bunyan');
var email = require('email');

var log = module.exports = bunyan.createLogger({
  name: "kicadcloud", streams: [
    {
      level: "debug",
      stream: process.stdout
    },
    {
      level: "info",
      path: "/var/log/kicadcloud/error.log"
    }
  ]});

log._error = log.error;
log.error = function() {
  log.sendLogEmail('error', arguments);
  return log._error.apply(log, arguments);
};

log.sendLogEmail = function(level, args, callback) {
  callback = callback || function(err) {
    if (err) {
      log._error('Could not send log email', err);
    }
  };
  args = Array.prototype.slice.call(args);

  log.info('sending error email to: ' + log.email);
  var myMsg = new email.Email({
    from: "support@kicadcloud.com",
    to: log.email,
    subject: "KiCadCloud: Log",
    body: "Log Event: " + level + '\n' + args.join(', '),
    bodyType: 'html'
  });
  return myMsg.send(callback);
};
