'use strict';

var global = require('./').global;

exports.IE = (function () {
  var ua = global && global.navigator && global.navigator.userAgent || false;

  return ua && (
    ua.indexOf('MSIE ') > 0 ||        // IE lte 10
    ua.indexOf('Trident/') > 0 ||     // IE 11
    ua.indexOf('Edge/') > 0           // IE 12
  );
}());