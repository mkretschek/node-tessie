'use strict';

exports.IE = (function () {
  var ua = window && window.navigator && window.navigator.userAgent || false;

  return ua && (
    ua.indexOf('MSIE ') > 0 ||        // IE lte 10
    ua.indexOf('Trident/') > 0 ||     // IE 11
    ua.indexOf('Edge/') > 0           // IE 12
  );
}());