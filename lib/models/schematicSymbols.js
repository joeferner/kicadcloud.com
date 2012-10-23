'use strict';

var SchematicSymbols = module.exports = function() {

};

SchematicSymbols.findRecent = function(conn, callback) {
  console.log('implement me SchematicSymbols.findRecent');
  return callback(null, [
    {id: 1, createdBy: 'Test User', modifiedDate: Date.now(), title: 'Battery', text: 'DEF BATTERY BT 0 0 Y Y 1 F N\nF0 "BT" 0 200 50 H V C CNN\nF1 "BATTERY" 0 -190 50 H V C CNN\nDRAW\nC 0 0 150 0 1 6 N\nP 2 0 1 0  -100 0  -150 0 N\nP 2 0 1 6  -100 90  -100 -89 N\nP 2 0 1 6  -31 50  -31 -50 N\nP 2 0 1 6  39 90  39 -89 N\nP 2 0 1 0  100 0  150 0 N\nP 2 0 1 6  100 50  100 -50 N\nX + 1 -300 0 150 R 50 50 1 1 P\nX - 2 300 0 150 L 50 50 1 1 P\nENDDRAW\nENDDEF'},
    {id: 2, createdBy: 'Test User', modifiedDate: Date.now(), title: 'Battery', text: 'DEF BATTERY BT 0 0 Y Y 1 F N\nF0 "BT" 0 200 50 H V C CNN\nF1 "BATTERY" 0 -190 50 H V C CNN\nDRAW\nC 0 0 150 0 1 6 N\nP 2 0 1 0  -100 0  -150 0 N\nP 2 0 1 6  -100 90  -100 -89 N\nP 2 0 1 6  -31 50  -31 -50 N\nP 2 0 1 6  39 90  39 -89 N\nP 2 0 1 0  100 0  150 0 N\nP 2 0 1 6  100 50  100 -50 N\nX + 1 -300 0 150 R 50 50 1 1 P\nX - 2 300 0 150 L 50 50 1 1 P\nENDDRAW\nENDDEF'},
    {id: 3, createdBy: 'Test User', modifiedDate: Date.now(), title: 'Battery', text: 'DEF BATTERY BT 0 0 Y Y 1 F N\nF0 "BT" 0 200 50 H V C CNN\nF1 "BATTERY" 0 -190 50 H V C CNN\nDRAW\nC 0 0 150 0 1 6 N\nP 2 0 1 0  -100 0  -150 0 N\nP 2 0 1 6  -100 90  -100 -89 N\nP 2 0 1 6  -31 50  -31 -50 N\nP 2 0 1 6  39 90  39 -89 N\nP 2 0 1 0  100 0  150 0 N\nP 2 0 1 6  100 50  100 -50 N\nX + 1 -300 0 150 R 50 50 1 1 P\nX - 2 300 0 150 L 50 50 1 1 P\nENDDRAW\nENDDEF'},
    {id: 4, createdBy: 'Test User', modifiedDate: Date.now(), title: 'Battery', text: 'DEF BATTERY BT 0 0 Y Y 1 F N\nF0 "BT" 0 200 50 H V C CNN\nF1 "BATTERY" 0 -190 50 H V C CNN\nDRAW\nC 0 0 150 0 1 6 N\nP 2 0 1 0  -100 0  -150 0 N\nP 2 0 1 6  -100 90  -100 -89 N\nP 2 0 1 6  -31 50  -31 -50 N\nP 2 0 1 6  39 90  39 -89 N\nP 2 0 1 0  100 0  150 0 N\nP 2 0 1 6  100 50  100 -50 N\nX + 1 -300 0 150 R 50 50 1 1 P\nX - 2 300 0 150 L 50 50 1 1 P\nENDDRAW\nENDDEF'},
    {id: 5, createdBy: 'Test User', modifiedDate: Date.now(), title: 'Battery', text: 'DEF BATTERY BT 0 0 Y Y 1 F N\nF0 "BT" 0 200 50 H V C CNN\nF1 "BATTERY" 0 -190 50 H V C CNN\nDRAW\nC 0 0 150 0 1 6 N\nP 2 0 1 0  -100 0  -150 0 N\nP 2 0 1 6  -100 90  -100 -89 N\nP 2 0 1 6  -31 50  -31 -50 N\nP 2 0 1 6  39 90  39 -89 N\nP 2 0 1 0  100 0  150 0 N\nP 2 0 1 6  100 50  100 -50 N\nX + 1 -300 0 150 R 50 50 1 1 P\nX - 2 300 0 150 L 50 50 1 1 P\nENDDRAW\nENDDEF'},
    {id: 6, createdBy: 'Test User', modifiedDate: Date.now(), title: 'Battery', text: 'DEF BATTERY BT 0 0 Y Y 1 F N\nF0 "BT" 0 200 50 H V C CNN\nF1 "BATTERY" 0 -190 50 H V C CNN\nDRAW\nC 0 0 150 0 1 6 N\nP 2 0 1 0  -100 0  -150 0 N\nP 2 0 1 6  -100 90  -100 -89 N\nP 2 0 1 6  -31 50  -31 -50 N\nP 2 0 1 6  39 90  39 -89 N\nP 2 0 1 0  100 0  150 0 N\nP 2 0 1 6  100 50  100 -50 N\nX + 1 -300 0 150 R 50 50 1 1 P\nX - 2 300 0 150 L 50 50 1 1 P\nENDDRAW\nENDDEF'},
    {id: 7, createdBy: 'Test User', modifiedDate: Date.now(), title: 'Battery', text: 'DEF BATTERY BT 0 0 Y Y 1 F N\nF0 "BT" 0 200 50 H V C CNN\nF1 "BATTERY" 0 -190 50 H V C CNN\nDRAW\nC 0 0 150 0 1 6 N\nP 2 0 1 0  -100 0  -150 0 N\nP 2 0 1 6  -100 90  -100 -89 N\nP 2 0 1 6  -31 50  -31 -50 N\nP 2 0 1 6  39 90  39 -89 N\nP 2 0 1 0  100 0  150 0 N\nP 2 0 1 6  100 50  100 -50 N\nX + 1 -300 0 150 R 50 50 1 1 P\nX - 2 300 0 150 L 50 50 1 1 P\nENDDRAW\nENDDEF'},
    {id: 8, createdBy: 'Test User', modifiedDate: Date.now(), title: 'Battery', text: 'DEF BATTERY BT 0 0 Y Y 1 F N\nF0 "BT" 0 200 50 H V C CNN\nF1 "BATTERY" 0 -190 50 H V C CNN\nDRAW\nC 0 0 150 0 1 6 N\nP 2 0 1 0  -100 0  -150 0 N\nP 2 0 1 6  -100 90  -100 -89 N\nP 2 0 1 6  -31 50  -31 -50 N\nP 2 0 1 6  39 90  39 -89 N\nP 2 0 1 0  100 0  150 0 N\nP 2 0 1 6  100 50  100 -50 N\nX + 1 -300 0 150 R 50 50 1 1 P\nX - 2 300 0 150 L 50 50 1 1 P\nENDDRAW\nENDDEF'},
    {id: 9, createdBy: 'Test User', modifiedDate: Date.now(), title: 'Battery', text: 'DEF BATTERY BT 0 0 Y Y 1 F N\nF0 "BT" 0 200 50 H V C CNN\nF1 "BATTERY" 0 -190 50 H V C CNN\nDRAW\nC 0 0 150 0 1 6 N\nP 2 0 1 0  -100 0  -150 0 N\nP 2 0 1 6  -100 90  -100 -89 N\nP 2 0 1 6  -31 50  -31 -50 N\nP 2 0 1 6  39 90  39 -89 N\nP 2 0 1 0  100 0  150 0 N\nP 2 0 1 6  100 50  100 -50 N\nX + 1 -300 0 150 R 50 50 1 1 P\nX - 2 300 0 150 L 50 50 1 1 P\nENDDRAW\nENDDEF'},
    {id: 10, createdBy: 'Test User', modifiedDate: Date.now(), title: 'Battery', text: 'DEF BATTERY BT 0 0 Y Y 1 F N\nF0 "BT" 0 200 50 H V C CNN\nF1 "BATTERY" 0 -190 50 H V C CNN\nDRAW\nC 0 0 150 0 1 6 N\nP 2 0 1 0  -100 0  -150 0 N\nP 2 0 1 6  -100 90  -100 -89 N\nP 2 0 1 6  -31 50  -31 -50 N\nP 2 0 1 6  39 90  39 -89 N\nP 2 0 1 0  100 0  150 0 N\nP 2 0 1 6  100 50  100 -50 N\nX + 1 -300 0 150 R 50 50 1 1 P\nX - 2 300 0 150 L 50 50 1 1 P\nENDDRAW\nENDDEF'}
  ]);
};

SchematicSymbols.findById = function(conn, id, callback) {
  return callback(null, {
    id: 1,
    createdBy: 'Test User',
    modifiedDate: Date.now(),
    title: 'Battery',
    description: 'This is a description that may be multiple lines\nWith more data.',
    text: 'DEF BATTERY BT 0 0 Y Y 1 F N\nF0 "BT" 0 200 50 H V C CNN\nF1 "BATTERY" 0 -190 50 H V C CNN\nDRAW\nC 0 0 150 0 1 6 N\nP 2 0 1 0  -100 0  -150 0 N\nP 2 0 1 6  -100 90  -100 -89 N\nP 2 0 1 6  -31 50  -31 -50 N\nP 2 0 1 6  39 90  39 -89 N\nP 2 0 1 0  100 0  150 0 N\nP 2 0 1 6  100 50  100 -50 N\nX + 1 -300 0 150 R 50 50 1 1 P\nX - 2 300 0 150 L 50 50 1 1 P\nENDDRAW\nENDDEF'
  });
};

