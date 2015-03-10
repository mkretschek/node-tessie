'use strict';

var _ = require('lodash');
var xhr = require('xhr');

var time = require('../time');
var util = require('../index');
var HttpMethod = require('../enum/http-method');


/** @module core/api */


/**
 * Representation of a call to an API.
 *
 * @param method {httpMethod} HTTP method;
 * @param uri {string} URI called;
 * @param options {object?}
 *
 * @constructor
 */
function Call(method, uri, options) {
  if (!(this instanceof Call)) {
    return new Call(method, uri, options);
  }

  this.uri = uri;
  this.method = method || HttpMethod.GET;
  this._headers = {};
  this._data = null;
  this._xhr = null;

  this.options = _.extend({}, Call.DefaultOptions, options);
}

/** Default options for a Call instance */
Call.DefaultOptions = {
  /**
   * How long should it wait for a response before timing out (in milliseconds).
   * @type {number}
   */
  timeout: time.seconds(10).toMilliseconds()
};

/**
 * Call's response status.
 * @type {(null|number)}
 */
Call.prototype.status = null;

/**
 * Response text retrieved from the server. If a JSON response is sent
 * by the server, this will be the parsed object.
 * @type {(null|string|object)}
 */
Call.prototype.response = null;


/**
 * Sets a header in the request.
 *
 * @param {(string|object)} Header's name
 * @param {(string|number)} value Header's value
 *
 * @returns {Call} The call object itself (allows chaining)
 */
Call.prototype.header = function (name, value) {
  if (typeof name === 'object') {
    // If an object is passed, extend the headers object
    _.extend(this._headers, name);
  } else {
    this._headers[name] = value;
  }

  return this;
};

/**
 * Sets the data that will be sent with the request.
 * @param {(string|object)=} data
 */
Call.prototype.data = function (data) {
  this._data = data;
  return this;
};

/** @alias Call.data */
Call.prototype.json = Call.prototype.data;

/**
 * Sends the request.
 * @param {(string|object)?} data Data that should be sent to the endpoint.
 *  If this is an object, the data will be sent as JSON and the content-type
 *  header will be set accordingly.
 * @param {Function} callback Callback function.
 * @returns {Call} The Call instance itself (allows chaining).
 */
Call.prototype.send = function (data, callback) {
  if (typeof data === 'function') {
    callback = data;
    data = null;
  } else if (arguments.length) {
    this.data(data);
  }

  callback = callback || util.noop;

  var self = this;

  function internalCallback(err, resp, body) {
    delete self._xhr;

    self.status = resp.statusCode;
    self.response = body;

    callback(err, resp, body);
  }

  this._xhr = xhr(this._getXhrOptions(), internalCallback);

  return this._xhr;
};

/**
 * Aborts the ongoing call.
 */
Call.prototype.abort = function () {
  if (this._xhr && this._xhr.abort) {
    this._xhr.abort();
  }
};

/**
 * Builds the XHR options object.
 *
 * @returns {object} XHR options.
 * @private
 *
 * @see https://github.com/Raynos/xhr
 */
Call.prototype._getXhrOptions = function () {
  var xhrOptions = {
    method: this.method,
    uri: this.uri,
    headers: this._headers,
    timeout: this.options.timeout
  };

  if (this._data && typeof this._data === 'object') {
    xhrOptions.json = this._data;
  } else {
    xhrOptions.body = this._data;
  }

  return xhrOptions;
};


module.exports = Call;