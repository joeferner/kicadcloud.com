'use strict';

var persist = require('persist');
var crypto = require('crypto');
var sf = require('sf');
var gravatar = require('gravatar');
var type = persist.type;

var User = module.exports = persist.define("user", {
  "username": type.STRING,
  "password": type.STRING,
  "email": type.STRING,
  "verified": type.INTEGER
});

User.validate = function(user, callback) {
  if (!user.username) {
    return callback(false, "username is required");
  }
  if (!user.email) {
    return callback(false, "username is required");
  }
  return callback(true);
};

User.canEdit = function(conn, user, id, callback) {
  return callback(null, user.id == id);
};

User.prototype.getGravatarUrl = function(opts) {
  opts = opts || { s: 32 };
  return gravatar.url(this.email || '', opts);
};

User.prototype.setPassword = function(password) {
  var md5 = crypto.createHash('md5');
  md5.update(User.passwordSalt);
  md5.update(password);
  this.password = md5.digest('hex');
};

User.prototype.verifyPassword = function(password) {
  var md5 = crypto.createHash('md5');
  md5.update(User.passwordSalt);
  md5.update(password);
  var hex = md5.digest('hex');
  return this.password === hex;
};

User.findById = function(conn, userId, callback) {
  return User.getById(conn, userId, callback);
};

User.findByUsernameOrEmail = function(conn, usernameOrEmail, callback) {
  return User.where('username = ? OR email = ?', [usernameOrEmail, usernameOrEmail]).first(conn, callback);
};

User.isUsernameOrEmailTaken = function(conn, currentUserId, username, email, callback) {
  conn.chain({
    'byUsername': User.where('username = ?', username).first,
    'byEmail': User.where('email = ?', email).first
  }, function(err, results) {
    if (err) {
      return callback(err);
    }
    if (results.byUsername && results.byUsername.id != currentUserId) {
      return callback(null, 'username');
    }
    if (results.byEmail && results.byEmail.id != currentUserId) {
      return callback(null, 'email');
    }
    return callback();
  });
};