'use strict';

exports.kicadCodeToJs = function(data) {
  return data
    .split('\n')
    .join('\\n')
    .replace(/\r/g, '')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"');
};

