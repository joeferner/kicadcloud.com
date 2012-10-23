'use strict';

var User = module.exports = function() {

};

User.validate = function(conn, username, password, callback) {
  console.log('implement me User.validate:', username, password);
  if (username === 'user' && password === 'password') {
    return callback(null, {
      id: 1,
      name: 'test user'
    })
  }
  return callback(new Error("Invalid username or password."))
};

User.add = function(conn, userData, callback) {
  console.log('implement me User.add:', userData);
  return callback();
};

User.findById = function(conn, userId, callback) {
  return callback(null, {
    id: userId,
    name: 'test user'
  });
};
