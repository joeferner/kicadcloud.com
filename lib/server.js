'use strict';

var cluster = require('cluster');
var path = require('path');
var os = require('os');

module.exports = function(opts) {
  opts = opts || {};
  opts.port = opts.port || 8888;

  if (cluster.isMaster) {
    runMaster(opts);
  } else {
    require('./worker')(opts);
  }
};

function runMaster(args) {
  var numCPUs = args.workers || os.cpus().length;
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('death', function(worker) {
    if (!worker.suicide) {
      console.error('worker ' + worker.pid + ' died. Forking a new one.');
      cluster.fork();
    }
  });
}
