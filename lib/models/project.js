'use strict';

var persist = require('persist');
var type = persist.type;

var Project = module.exports = persist.define("Project", {
  "title": type.STRING,
  "userId": type.INTEGER
});

Project.findByUserId = function(conn, userId, callback) {
  return Project
    .where("userId = ?", userId)
    .all(conn, callback);
};
