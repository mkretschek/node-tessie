'use strict';

exports.getValidIndex = function (array, index) {
  var len = array.length;

  if (len === 0) {
    return null;
  }

  while (index >= len) {
    index = index - len;
  }

  while (index < 0) {
    index = index + len;
  }

  return index;
};