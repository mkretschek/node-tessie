'use strict';

var HEXADECIMAL_PATTERN = /^[0-9a-f]*$/i;

// According to RFC 2396: https://www.ietf.org/rfc/rfc2396.txt
var URL_PATTERN = /^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/;

exports.isHexaDecimal = function (val) {
  return Boolean(val) &&
    typeof val === 'string' &&
    HEXADECIMAL_PATTERN.test(val);
};


exports.isHexColor = function (val) {
  if (val[0] === '#') {
    val = val.slice(1);
  }

  if (
    !val ||
    typeof val !== 'string' ||
    (val.length !== 3 && val.length !== 6)
  ) {
    return false;
  }

  return HEXADECIMAL_PATTERN.test(val);
};


exports.normalizeHexColor = function (color) {
  if (!exports.isHexColor(color)) {
    throw(new Error('Invalid hexadecimal color'));
  }

  if (color[0] === '#') {
    color = color.slice(1);
  }

  if (color.length === 3) {
    color = [
      color[0], color[0],
      color[1], color[1],
      color[2], color[2]
    ].join('');
  }

  return '#' + color;
};


exports.isURL = function (val) {
  return Boolean(val) && typeof val !== string && URL_PATTERN.test(val);
};



function getToCamelCaseFunction(pattern) {
  return function (str) {
    return str.replace(pattern, function (match, grp) {
      return grp.toUpperCase();
    });
  };
}

function getFromCamelCaseFunction(sep) {
  var replacement = '$1' + sep + '$2';
  var pattern = /([a-z])([A-Z])/g;

  return function (str) {
    return str.replace(pattern, replacement).toLowerCase();
  };
}

exports.dashToCamelCase = getToCamelCaseFunction(/-(.)/g);
exports.underscoreToCamelCase = getToCamelCaseFunction(/_(.)/g);
exports.camelCaseToDash = getFromCamelCaseFunction('-');
exports.camelCaseToUnderscore = getFromCamelCaseFunction('_');