'use strict';

exports.kicadCodeToJs = function(data) {
  return data
    .split('\n')
    .join('\\n')
    .replace(/\r/g, '')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"');
};

exports.merge = function(to, from, fields) {
  Object.keys(from).forEach(function(k) {
    if (fields) {
      if (fields.indexOf(k) >= 0) {
        to[k] = from[k];
      }
    } else {
      to[k] = from[k];
    }
  });
};
