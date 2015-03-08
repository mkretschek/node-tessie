'use strict';

var _ = require('lodash');
var xhr = require('xhr');

var Asset = require('./asset');
var util = require('../');
var http = require('../http');

function Data() {
  Asset.apply(this, arguments);
}

util.inherits(Data, Asset);

Data.prototype._load = function (callback) {
  var self = this;

  // Allows the user to use any of `xhr`'s options
  var options = _.extend({}, this.options, {
    uri: this.uri
  });

  if (options.json === undefined) {
    options.json = true;
  }

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


Data.prototype._install = function (data, callback) {
  callback(null, data);
};


Data.prototype._uninstall = function (data, callback) {
  callback(null, data)
};



Data.prototype._unload = function (data, callback) {
  callback(null);
};


Data.prototype._dispose = function () {
  if (this._xhr) {
    this._xhr.abort && this._xhr.abort();
    this._xhr = null;
  }
};


module.exports = Data;