var async = require('async');
var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  async.series([
    db.runSql.bind(db, 'ALTER TABLE edaItems ADD CONSTRAINT fk_edaItems_units FOREIGN KEY (unit_id) REFERENCES units(id)'),
    db.runSql.bind(db, 'ALTER TABLE edaItems ADD CONSTRAINT fk_edaItems_createdBy FOREIGN KEY (created_by) REFERENCES users(id)'),
    db.runSql.bind(db, 'ALTER TABLE edaItems ADD CONSTRAINT fk_edaItems_modifiedBy FOREIGN KEY (modified_by) REFERENCES users(id)'),
    db.runSql.bind(db, 'ALTER TABLE edaItemComments ADD CONSTRAINT fk_edaItemComments_createdBy FOREIGN KEY (created_by) REFERENCES users(id)'),
    db.runSql.bind(db, 'ALTER TABLE edaItemComments ADD CONSTRAINT fk_edaItemComments_edaItemId FOREIGN KEY (eda_item_id) REFERENCES edaItems(id)'),
    db.runSql.bind(db, 'ALTER TABLE userFavoriteEdaItems ADD CONSTRAINT fk_userFavoriteEdaItems_userId FOREIGN KEY (user_id) REFERENCES users(id)'),
    db.runSql.bind(db, 'ALTER TABLE userFavoriteEdaItems ADD CONSTRAINT fk_userFavoriteEdaItems_edaItemId FOREIGN KEY (eda_item_id) REFERENCES edaItems(id)'),
    db.runSql.bind(db, 'ALTER TABLE userVoteEdaItems ADD CONSTRAINT fk_userVoteEdaItems_userId FOREIGN KEY (user_id) REFERENCES users(id)'),
    db.runSql.bind(db, 'ALTER TABLE userVoteEdaItems ADD CONSTRAINT fk_userVoteEdaItems_edaItemId FOREIGN KEY (eda_item_id) REFERENCES edaItems(id)')
  ], callback);
};

exports.down = function(db, callback) {
  async.series([
    db.runSql.bind(db, 'ALTER TABLE edaItems DROP FOREIGN KEY fk_edaItems_units'),
    db.runSql.bind(db, 'ALTER TABLE edaItems DROP FOREIGN KEY fk_edaItems_createdBy'),
    db.runSql.bind(db, 'ALTER TABLE edaItems DROP FOREIGN KEY fk_edaItems_modifiedBy'),
    db.runSql.bind(db, 'ALTER TABLE edaItemComments DROP FOREIGN KEY fk_edaItemComments_createdBy'),
    db.runSql.bind(db, 'ALTER TABLE edaItemComments DROP FOREIGN KEY fk_edaItemComments_edaItemId'),
    db.runSql.bind(db, 'ALTER TABLE userFavoriteEdaItems DROP FOREIGN KEY fk_userFavoriteEdaItems_userId'),
    db.runSql.bind(db, 'ALTER TABLE userFavoriteEdaItems DROP FOREIGN KEY fk_userFavoriteEdaItems_edaItemId'),
    db.runSql.bind(db, 'ALTER TABLE userVoteEdaItems DROP FOREIGN KEY fk_userVoteEdaItems_userId'),
    db.runSql.bind(db, 'ALTER TABLE userVoteEdaItems DROP FOREIGN KEY fk_userVoteEdaItems_edaItemId')
  ], callback);
};
