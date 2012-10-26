'use strict';

var persist = require('persist');
var models = require('../lib/models');

persist.connect(function(err, conn) {
  if (err) {
    throw err;
  }

  var user1 = new models.User();
  user1.username = 'joeferner';
  user1.setPassword("test");
  user1.email = 'joe@fernsroth.com';
  user1.verified = true;

  conn.save([user1], function(err) {
    if (err) {
      throw err;
    }

    conn.close();
  });
});
