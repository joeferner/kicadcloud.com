'use strict';

exports.kicadCodeToJs = function(data) {
  return data
    .split('\n')
    .join('\\n')
    .replace(/\r/g, '')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"');
};

exports.merge = function(to, from) {
  Object.keys(from).forEach(function(k) {
    to[k] = from[k];
  });
};
