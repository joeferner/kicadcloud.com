'use strict';

var User = module.exports = function() {

};

User.validate = function(conn, username, password, callback) {
  return callback(new Error("Invalid username or password."))
};

