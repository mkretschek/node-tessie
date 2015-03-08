'use strict';

var _ = require('lodash');

/** @module util/error */

var DEFAULT_ERROR_CODE = 'ERROR';

/**
 * Creates an Error object with the given message and code and
 * extends it with any params set in `etc`.
 *
 * @type {Function}
 *
 * @param msg {string} Error message;
 * @param code {(string|number)?} Error code;
 * @param etc {object=} Properties that should be set in the error;
 *
 * @returns {Error}
 */
module.exports = function (msg, code, etc) {
  var err = new Error(msg);
  err.code = code || DEFAULT_ERROR_CODE;

  if (etc) {
    _.extend(err, etc);
  }

  return err;
};