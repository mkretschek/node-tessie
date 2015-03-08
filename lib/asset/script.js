'use strict';

var _ = require('lodash');
var Asset = require('./asset');
var util = require('../');
var xhr = require('xhr');

var http = require('../http');


// FIXME define a way to pass the `.destroy()` method to the constructor
function Script() {
  Asset.apply(this, arguments);
}

util.inherits(Script, Asset);

Script.prototype._load = function (callback) {
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

    if (!err && http.isSuccessCode(resp.statusCode)) {
      delete self._xhr;
      return callback(null, body);
    }

    if (!err) {
      err = new Error('Unexpected response');
      err.status = resp.statusCode;
    }

    callback(err);
  });
};

Script.prototype._install = function (content, callback) {
  var script = document.createElement('script');
  script.innerHTML = content;
  document.body.appendChild(script);
  callback(null, script);
};

Script.prototype._uninstall = function (script, callback) {
  if (this.destroy) {
    // If defined, `.destroy()` should clear all objects created by this
    // script, leaving the environment as close as possible to the state it
    // would be had the script not been loaded.
    this.destroy();
  }

  // Return the script's content, allowing to reinstall it without
  // loading it again
  callback(null, (script && script.innerHTML || null));
};

Script.prototype._dispose = function () {
  if (this._xhr) {
    this._xhr.abort && this._xhr.abort();
    this._xhr = null;
  }
};

module.exports = Script;