'use strict';

var SchematicSymbols = module.exports = function() {

};

var parts = [
  {id: 0, createdBy: 'Test User1', createdByUserId: 1, modifiedDate: Date.now(), isUpVote: true, isFavorite: true, upVoteCount: 4, favoriteCount: 3, keywords: '', title: 'Battery1', code: 'DEF BATTERY BT 0 0 Y Y 1 F N\nF0 "BT" 0 200 50 H V C CNN\nF1 "BATTERY" 0 -190 50 H V C CNN\nDRAW\nC 0 0 150 0 1 6 N\nP 2 0 1 0  -100 0  -150 0 N\nP 2 0 1 6  -100 90  -100 -89 N\nP 2 0 1 6  -31 50  -31 -50 N\nP 2 0 1 6  39 90  39 -89 N\nP 2 0 1 0  100 0  150 0 N\nP 2 0 1 6  100 50  100 -50 N\nX + 1 -300 0 150 R 50 50 1 1 P\nX - 2 300 0 150 L 50 50 1 1 P\nENDDRAW\nENDDEF'},
  {id: 1, createdBy: 'Test User2', createdByUserId: 2, modifiedDate: Date.now(), isDownVote: true, keywords: '', title: 'Battery2', code: 'DEF BATTERY BT 0 0 Y Y 1 F N\nF0 "BT" 0 200 50 H V C CNN\nF1 "BATTERY" 0 -190 50 H V C CNN\nDRAW\nC 0 0 150 0 1 6 N\nP 2 0 1 0  -100 0  -150 0 N\nP 2 0 1 6  -100 90  -100 -89 N\nP 2 0 1 6  -31 50  -31 -50 N\nP 2 0 1 6  39 90  39 -89 N\nP 2 0 1 0  100 0  150 0 N\nP 2 0 1 6  100 50  100 -50 N\nX + 1 -300 0 150 R 50 50 1 1 P\nX - 2 300 0 150 L 50 50 1 1 P\nENDDRAW\nENDDEF'},
  {id: 2, createdBy: 'Test User3', createdByUserId: 3, modifiedDate: Date.now(), keywords: '', title: 'Battery3', code: 'DEF BATTERY BT 0 0 Y Y 1 F N\nF0 "BT" 0 200 50 H V C CNN\nF1 "BATTERY" 0 -190 50 H V C CNN\nDRAW\nC 0 0 150 0 1 6 N\nP 2 0 1 0  -100 0  -150 0 N\nP 2 0 1 6  -100 90  -100 -89 N\nP 2 0 1 6  -31 50  -31 -50 N\nP 2 0 1 6  39 90  39 -89 N\nP 2 0 1 0  100 0  150 0 N\nP 2 0 1 6  100 50  100 -50 N\nX + 1 -300 0 150 R 50 50 1 1 P\nX - 2 300 0 150 L 50 50 1 1 P\nENDDRAW\nENDDEF'},
  {id: 3, createdBy: 'Test User4', createdByUserId: 4, modifiedDate: Date.now(), keywords: '', title: 'Battery4', code: 'DEF BATTERY BT 0 0 Y Y 1 F N\nF0 "BT" 0 200 50 H V C CNN\nF1 "BATTERY" 0 -190 50 H V C CNN\nDRAW\nC 0 0 150 0 1 6 N\nP 2 0 1 0  -100 0  -150 0 N\nP 2 0 1 6  -100 90  -100 -89 N\nP 2 0 1 6  -31 50  -31 -50 N\nP 2 0 1 6  39 90  39 -89 N\nP 2 0 1 0  100 0  150 0 N\nP 2 0 1 6  100 50  100 -50 N\nX + 1 -300 0 150 R 50 50 1 1 P\nX - 2 300 0 150 L 50 50 1 1 P\nENDDRAW\nENDDEF'},
  {id: 4, createdBy: 'Test User5', createdByUserId: 5, modifiedDate: Date.now(), keywords: '', title: 'Battery5', code: 'DEF BATTERY BT 0 0 Y Y 1 F N\nF0 "BT" 0 200 50 H V C CNN\nF1 "BATTERY" 0 -190 50 H V C CNN\nDRAW\nC 0 0 150 0 1 6 N\nP 2 0 1 0  -100 0  -150 0 N\nP 2 0 1 6  -100 90  -100 -89 N\nP 2 0 1 6  -31 50  -31 -50 N\nP 2 0 1 6  39 90  39 -89 N\nP 2 0 1 0  100 0  150 0 N\nP 2 0 1 6  100 50  100 -50 N\nX + 1 -300 0 150 R 50 50 1 1 P\nX - 2 300 0 150 L 50 50 1 1 P\nENDDRAW\nENDDEF'},
  {id: 5, createdBy: 'Test User6', createdByUserId: 6, modifiedDate: Date.now(), keywords: '', title: 'Battery6', code: 'DEF BATTERY BT 0 0 Y Y 1 F N\nF0 "BT" 0 200 50 H V C CNN\nF1 "BATTERY" 0 -190 50 H V C CNN\nDRAW\nC 0 0 150 0 1 6 N\nP 2 0 1 0  -100 0  -150 0 N\nP 2 0 1 6  -100 90  -100 -89 N\nP 2 0 1 6  -31 50  -31 -50 N\nP 2 0 1 6  39 90  39 -89 N\nP 2 0 1 0  100 0  150 0 N\nP 2 0 1 6  100 50  100 -50 N\nX + 1 -300 0 150 R 50 50 1 1 P\nX - 2 300 0 150 L 50 50 1 1 P\nENDDRAW\nENDDEF'},
  {id: 6, createdBy: 'Test User7', createdByUserId: 7, modifiedDate: Date.now(), keywords: '', title: 'Battery7', code: 'DEF BATTERY BT 0 0 Y Y 1 F N\nF0 "BT" 0 200 50 H V C CNN\nF1 "BATTERY" 0 -190 50 H V C CNN\nDRAW\nC 0 0 150 0 1 6 N\nP 2 0 1 0  -100 0  -150 0 N\nP 2 0 1 6  -100 90  -100 -89 N\nP 2 0 1 6  -31 50  -31 -50 N\nP 2 0 1 6  39 90  39 -89 N\nP 2 0 1 0  100 0  150 0 N\nP 2 0 1 6  100 50  100 -50 N\nX + 1 -300 0 150 R 50 50 1 1 P\nX - 2 300 0 150 L 50 50 1 1 P\nENDDRAW\nENDDEF'},
  {id: 7, createdBy: 'Test User8', createdByUserId: 8, modifiedDate: Date.now(), keywords: '', title: 'Battery8', code: 'DEF BATTERY BT 0 0 Y Y 1 F N\nF0 "BT" 0 200 50 H V C CNN\nF1 "BATTERY" 0 -190 50 H V C CNN\nDRAW\nC 0 0 150 0 1 6 N\nP 2 0 1 0  -100 0  -150 0 N\nP 2 0 1 6  -100 90  -100 -89 N\nP 2 0 1 6  -31 50  -31 -50 N\nP 2 0 1 6  39 90  39 -89 N\nP 2 0 1 0  100 0  150 0 N\nP 2 0 1 6  100 50  100 -50 N\nX + 1 -300 0 150 R 50 50 1 1 P\nX - 2 300 0 150 L 50 50 1 1 P\nENDDRAW\nENDDEF'},
  {id: 8, createdBy: 'Test User9', createdByUserId: 9, modifiedDate: Date.now(), keywords: '', title: 'Battery9', code: 'DEF BATTERY BT 0 0 Y Y 1 F N\nF0 "BT" 0 200 50 H V C CNN\nF1 "BATTERY" 0 -190 50 H V C CNN\nDRAW\nC 0 0 150 0 1 6 N\nP 2 0 1 0  -100 0  -150 0 N\nP 2 0 1 6  -100 90  -100 -89 N\nP 2 0 1 6  -31 50  -31 -50 N\nP 2 0 1 6  39 90  39 -89 N\nP 2 0 1 0  100 0  150 0 N\nP 2 0 1 6  100 50  100 -50 N\nX + 1 -300 0 150 R 50 50 1 1 P\nX - 2 300 0 150 L 50 50 1 1 P\nENDDRAW\nENDDEF'},
  {id: 9, createdBy: 'Test User10', createdByUserId: 10, modifiedDate: Date.now(), keywords: '', title: 'Battery10', code: 'DEF BATTERY BT 0 0 Y Y 1 F N\nF0 "BT" 0 200 50 H V C CNN\nF1 "BATTERY" 0 -190 50 H V C CNN\nDRAW\nC 0 0 150 0 1 6 N\nP 2 0 1 0  -100 0  -150 0 N\nP 2 0 1 6  -100 90  -100 -89 N\nP 2 0 1 6  -31 50  -31 -50 N\nP 2 0 1 6  39 90  39 -89 N\nP 2 0 1 0  100 0  150 0 N\nP 2 0 1 6  100 50  100 -50 N\nX + 1 -300 0 150 R 50 50 1 1 P\nX - 2 300 0 150 L 50 50 1 1 P\nENDDRAW\nENDDEF'}
];

SchematicSymbols.findRecent = function(conn, callback) {
  console.log('implement me SchematicSymbols.findRecent');
  return callback(null, parts);
};

SchematicSymbols.findById = function(conn, id, callback) {
  return callback(null, parts[id]);
};

SchematicSymbols.save = function(conn, id, user, data, callback) {
  data.createdBy = user.name;
  data.createdByUserId = user.id;
  data.modifiedDate = Date.now();
  console.log("Implement me, save: " + data);
  if (id === 'new') {
    data.id = parts.length;
    parts.push(data);
    return callback(null, data);
  }
  Object.keys(data).forEach(function(k) {
    parts[id][k] = data[k];
  });
  return callback(null, parts[id]);
};

SchematicSymbols.new = function(user) {
  return {
    id: 'new',
    title: 'New',
    code: '',
    createdByUserId: user.id,
    keywords: '',
    createdBy: '',
    description: '',
    modifiedDate: Date.now(),
    favoriteCount: 0
  };
};

SchematicSymbols.vote = function(conn, id, user, state, callback) {
  if (state === 'up') {
    parts[id].upVoteCount++;
  } else if (state === 'down') {
    parts[id].upVoteCount--;
  }
  return callback(null, parts[id]);
};

SchematicSymbols.favorite = function(conn, id, user, state, callback) {
  if (typeof(state) === 'string') {
    state = state === 'true';
  }

  if (state) {
    parts[id].favoriteCount++;
  } else {
    parts[id].favoriteCount--;
  }
  return callback(null, parts[id]);
};
