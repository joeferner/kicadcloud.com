'use strict';

module.exports = function (app) {
  require('./home')(app);
  require('./user')(app);
  require('./edaItem')(app);
  require('./search')(app);
};
