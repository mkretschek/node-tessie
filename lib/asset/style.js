'use strict';

var _ = require('lodash');
var xhr = require('xhr');
var Asset = require('./asset');
var browser = require('../browser');

var util = require('../index');
var http = require('../http');
var html = require('../html');

function Style() {
  Asset.apply(this, arguments);
}

util.inherits(Style, Asset);


Style.prototype._load = function (callback) {
  var self = this;

  // Allows the user to use any of `xhr`'s options
  var options = _.extend({}, this.options, {
    uri: this.uri
  });

  options.xhr = options.xhr || new XMLHttpRequest();

  function progressListener(e) {
    self.emit('progress', e.total, e.loaded);
  }

  options.xhr.addEventListener('progress', progressListener);

  this._xhr = xhr(options, function (err, resp, body) {
    options.xhr.removeEventListener('progress', progressListener);

    if (!err) {
      if (http.isSuccessCode(resp.statusCode)) {
        delete self._xhr;
        return callback(null, body);
      } else {
        err = new Error('Unexpected response');
        err.response = resp;
      }
    }

    callback(err);
  });
};

// From Closure Library: http://bit.ly/18xti1s#line1345
Style.prototype._install = function (content, callback) {
  var style = Style.create();

  if (browser.IE && style.cssText) {
    style.cssText = content;
  } else {
    style.innerHTML = content;
  }

  html.getHead().appendChild(style);

  callback(null, style);
};

Style.prototype._uninstall = function (style, callback) {
  // Store the style content, allowing to reinstall without reloading
  var content = style && browser.IE && style.cssText ?
    style.cssText :
    style.innerHTML;

  style.parentNode.removeChild(style);

  callback(null, content || null);
};


Style.prototype._dispose = function () {
  if (this._xhr) {
    if (this._xhr.abort) {
      this._xhr.abort();
    }
    this._xhr = null;
  }
};



////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// Static Methods //////////////////////////////////////////////////////////////

Style.create = function () {
  // IE < 11 requires `document.createStyleSheet()`
  return document.createStyleSheet ?
    document.createStyleSheet() :
    document.createElement('style');
};


module.exports = Style;