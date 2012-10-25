'use strict';

var persist = require('persist');
var crypto = require('crypto');
var sf = require('sf');
var type = persist.type;

var User = module.exports = persist.define("User", {
  "username": type.STRING,
  "password": type.STRING,
  "email": type.STRING,
  "verified": type.INTEGER
});

User.prototype.setPassword = function(password) {
  var md5 = crypto.createHash('md5');
  md5.update(password);
  this.password = md5.digest('hex');
};

User.prototype.verifyPassword = function(password) {
  var md5 = crypto.createHash('md5');
  md5.update(password);
  var hex = md5.digest('hex');
  return this.password === hex;
};

User.validate = function(conn, username, password, callback) {
  console.log('implement me User.validate:', username, password);
  for (var i = 0; i < users.length; i++) {
    if (users[i].username === username && users[i].password === password) {
      return callback(null, users[i])
    }
  }
  return callback(new Error("Invalid username or password."))
};

User.add = function(conn, userData, callback) {
  console.log('implement me User.add:', userData);
  return callback();
};

User.findById = function(conn, userId, callback) {
  return User.getById(conn, userId, callback);
};

User.save = function(conn, id, user, data, callback) {
  console.log("Implement me, save: " + data);
  Object.keys(data).forEach(function(k) {
    users[id][k] = data[k];
  });
  return callback(null, users[id]);
};
