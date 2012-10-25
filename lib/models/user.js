'use strict';

var User = module.exports = function() {

};

var users = [
  {
    id: 0,
    username: 'user',
    password: 'password',
    email: 'joe@fernsroth.com',
    gravatarUrl: '/images/voteDownOff.png'
  }
];

User.validate = function(conn, username, password, callback) {
  console.log('implement me User.validate:', username, password);
  for(var i=0; i<users.length; i++){
    if(users[i].username === username && users[i].password === password) {
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
  return callback(null, users[userId]);
};

User.save = function(conn, id, user, data, callback) {
  console.log("Implement me, save: " + data);
  Object.keys(data).forEach(function(k) {
    users[id][k] = data[k];
  });
  return callback(null, users[id]);
};
