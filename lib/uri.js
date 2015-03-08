'use strict';

var _ = require('lodash');


/**
 * Methods for build URIs for accessing remote data.
 * @module util/uri
 */

/**
 * Converts the given uri into a function. Useful when the uri contains
 * params, for example. This works with both placeholders and querystrings.
 *
 *     var URI = require('./util/uri');
 *
 *     // Simple URIs
 *     var baz = URI.toFunction('http://foo.bar/baz');
 *     baz({q: 'woo'});
 *     => http://foo.bar/baz?q=woo
 *
 *     // URIs with placeholders
 *     var user = URI.toFunction('http://some.api/user/{userName}');
 *     user('foobar', {q: 'someval'});
 *     => http://some.api/user/foobar?q=someval
 *
 * @param path {string} Path to be converted into a method.
 *
 * @returns {Function} A method that generates a complete URI using
 *  the instance's base.
 *
 * @private
 */
exports.toFunction = function (uri) {
  var split = uri.split(/\{[a-z0-9\-_]+}/gi);

  // Path without placeholders
  if (split.length === 1) {
    /**
     * If the path doesn't contain placeholders, a simplified URI
     * generator is returned. This simplified generator just appends
     * a querystring to the end, if provided.
     *
     * @param {(string|object)?} query A string or object that will be converted
     *  into the querystring portion of the generated URI.
     *
     * @returns {string} A complete URI.
     */
    return function (query) {
      if (query) {
        query = exports.querystring(query);
        return uri + '?' + query;
      }

      return uri;
    };
  }

  // Path with placeholders
  /**
   * An URI generator that:
   *
   *  * replaces placeholders with the given arguments;
   *  * prepends the base uri;
   *  * appends the querystring;
   *
   * @param {...(string|number)} placeholder Values to replace the
   *  placeholders with. They'll be used in the same order they appear
   *  in the path string.
   *
   * @return {string} The complete URI.
   */
  return function () {
    var args = Array.prototype.slice.call(arguments, 0, split.length - 1);
    var query = arguments[split.length - 1];

    var len, i;

    var url = '';

    for (i = 0, len = split.length; i < len; i += 1) {
      if (args[i] === 0) {
        args[i] = '' + 0;
      }

      url += split[i] + (args[i] || '');
    }

    return url + (query && ('?' + exports.querystring(query)) || '');
  };
};


/**
 * Creates a query string.
 *
 * @param query {(string|object)} Object containing the values that should be
 *  in the querystring. If the value is an array, the key will be repeated once
 *  for each value.
 *
 *      var URI = require('./util/uri');
 *      URI.querystring({
 *        foo: ['bar', 'baz'],
 *        woo: 'hoo'
 *      });
 *      => foo=bar&foo=baz&woo=hoo
 *
 * @returns {string}
 */
exports.querystring = function (query) {
  if (typeof query === 'string') {
    return query[0] === '?' ? query.slice(1) : query;
  }

  var key, val, len, i;
  var partial = [];

  for (key in query) {
    if (query.hasOwnProperty(key)) {
      val = query[key];
      if (typeof val === 'string' || typeof val === 'number') {
        partial.push(key + '=' + val);
      } else if (_.isArray(val)) {
        for (i = 0, len = val.length; i < len; i += 1) {
          partial.push(key + '=' + val[i]);
        }
      }
    }
  }

  return partial.join('&');
};


/**
 * Applies common normalization steps to the given path.
 * @param path {string}
 * @returns {string} Normalized path
 */
exports.normalizePath = function (path) {
  // Prepend a slash to the path if needed
  if (
    path.indexOf('/') !== 0 &&
    path.indexOf('./') !== 0 &&
    path.indexOf('../') !== 0
  ) {
    path = '/' + path;
  }

  return path;
};




