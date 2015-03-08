'use strict';

var _ = require('lodash');

var methods = {
  call: function () {
    var args = Array.prototype.slice.call(arguments);
    var context = args.shift();
    this.apply(context, args);
  },

  apply: function (context, args) {
    var callback, len, i;
    for (i = 0, len = this.length; i < len; i += 1) {
      callback = this[i];
      if (typeof callback === 'function') {
        callback.apply(context, args);
      }
    }

    // Reset the callback stack
    this.clear();
  },

  clear: function () {
    this.length = 0;
  }
};

module.exports = function () {
  var callbacks = [];
  _.extend(callbacks, methods);
  return callbacks;
};
