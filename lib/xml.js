'use strict';

var log = require('./log');

var namespaces = {};

exports.ns = {};

exports.ns.add = function (ns, url) {
  if (namespaces[ns] && namespaces[ns] !== url) {
    log('Overriding XML namespace: ' + ns);
  }

  namespaces[ns] = url;
};

exports.ns.get = function (ns) {
  return namespaces[ns] || null;
};

exports.ns.split = function (name) {
  var split;

  if (name && ~name.indexOf(':')) {
    split = name.split(':');
    split[0] = this.get(split[0]);
  } else {
    split = [null, name];
  }

  return split;
};
