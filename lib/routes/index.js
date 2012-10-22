'use strict';

module.exports = function (app) {
  require('./home')(app);
  require('./user')(app);
  require('./schematicSymbols')(app);
  require('./pcbModules')(app);
};
