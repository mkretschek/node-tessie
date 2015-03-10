'use strict';

var _ = require('lodash');

var Call = require('./call');
var URI = require('../uri');
var HttpMethod = require('../enum/http-method');
var error = require('../error');

/** @module core/api */


function normalizeBase(base) {
  if (typeof base !== 'string') {
    return '';
  }

  var lastCharIndex = base.length - 1;

  if (base[lastCharIndex] === '/') {
    return base.slice(0, lastCharIndex);
  }

  return base;
}



function API(base, options) {
  this.base = normalizeBase(base);
  this.endpoints = {};

  this.options = _.extend({}, API.DefaultOptions, options || {});
}


API.DefaultOptions = {
  timeout: 10000
};


API.prototype.get = function (endpoint) {
  var params = Array.prototype.slice.call(arguments, 1);
  return this._call(HttpMethod.GET, endpoint, params);
};

API.prototype.post = function (endpoint) {
  var params = Array.prototype.slice.call(arguments, 1);
  return this._call(HttpMethod.POST, endpoint, params);
};

API.prototype.delete = function (endpoint) {
  var params = Array.prototype.slice.call(arguments, 1);
  return this._call(HttpMethod.DELETE, endpoint, params);
};

API.prototype.head = function (endpoint) {
  var params = Array.prototype.slice.call(arguments, 1);
  return this._call(HttpMethod.HEAD, endpoint, params);
};

API.prototype.put = function (endpoint) {
  var params = Array.prototype.slice.call(arguments, 1);
  return this._call(HttpMethod.PUT, endpoint, params);
};


API.prototype.create = API.prototype.post;
API.prototype.update = API.prototype.put;


API.prototype.buildUri = function (path) {
  path = URI.normalizePath(path);
  return this.base + path;
};


API.prototype.endpoint = function (name, path) {
  var exists = !!this.endpoints[name];
  var uri = this.buildUri(path);

  if (exists) {
    console.warn('Overriding endpoint: ' + name);
  }

  this.endpoints[name] = URI.toFunction(uri);

  return this;
};


API.prototype._call = function (method, endpoint, params) {
  var uri = this.endpoints[endpoint];

  if (!uri) {
    throw error('Endpoint not found', 'NOT_FOUND');
  }

  return new Call(method, uri.apply(null, params), {
    timeout: this.options.timeout
  });
};


module.exports = API;
