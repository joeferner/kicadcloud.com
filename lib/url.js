'use strict';

exports.parse = function(url) {
  var results = {
    url: url,
    query: {}
  };

  var queryStart = results.url.indexOf('?');
  if (queryStart) {
    var query = results.url.substr(queryStart + 1);
    results.url = results.url.substr(0, queryStart);
    query.split('&').forEach(function(part) {
      var nameValSep = part.indexOf('=');
      if (nameValSep) {
        var name = part.substr(0, nameValSep);
        var val = part.substr(nameValSep + 1);
        results.query[name] = val;
      } else {
        results.query[part] = null;
      }
    });
  }

  return results;
};

exports.build = function(parsedUrl, changes) {
  var results = '';
  results += changes.url || parsedUrl.url;

  var queryOpts = {};
  Object.keys(parsedUrl.query).forEach(function(name) {
    queryOpts[name] = parsedUrl.query[name];
  });
  if (changes.query) {
    Object.keys(changes.query).forEach(function(name) {
      queryOpts[name] = changes.query[name];
    });
  }

  if (Object.keys(queryOpts).length > 0) {
    results += '?';
    Object.keys(queryOpts).forEach(function(name, i) {
      if (i > 0) {
        results += '&';
      }
      results += name + '=' + queryOpts[name];
    });
  }

  return results;
};
