'use strict';

module.exports = function (app) {
  require('./home')(app);
  require('./user')(app);
};
