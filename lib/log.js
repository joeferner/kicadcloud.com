'use strict';

var bunyan = require('bunyan');

var log = module.exports = bunyan.createLogger({
  name: "kicadcloud", streams: [
    {
      level: "debug",
      stream: process.stdout
    },
    {
      level: "info",
      path: "/var/log/kicadcloud.log"
    }
  ]});
