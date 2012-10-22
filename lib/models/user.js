'use strict';

var User = module.exports = function() {

};

User.validate = function(conn, username, password, callback) {
  console.log('implement me User.validate:', username, password);
  return callback(new Error("Invalid username or password."))
};

User.add = function(conn, userData, callback) {
  console.log('implement me User.add:', userData);
  return callback();
};
