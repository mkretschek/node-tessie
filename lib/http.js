'use strict';


var TIMEOUT_CODES = [
  0,      // Common timeout status used by many libraries (non-standard)
  408,    // REQUEST TIMEOUT
  419,    // AUTHENTICATION TIMEOUT (non-standard)
  440,    // LOGIN TIMEOUT (Microsoft)
  504,    // GATEWAY TIMEOUT
  598     // NETWORK READ TIMEOUT ERROR (non-standard)
];

exports.isTimeoutCode = function (code) {
  code = Number(code);
  return TIMEOUT_CODES.indexOf(code) !== -1;
};


exports.isSuccessCode = function (code) {
  code = Number(code);
  return code >= 200 && code < 300;
};

exports.isRedirectCode = function (code) {
  code = Number(code);
  return code >= 300 && code < 400;
};

exports.isErrorCode = function (code) {
  code = Number(code);
  return code >= 400;
};