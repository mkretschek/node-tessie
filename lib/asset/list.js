'use strict';


var _ = require('lodash');
var async = require('async');

var EventEmitter = require('eventemitter2').EventEmitter2;
var util = require('../');
var Asset = require('./asset');


function List(options) {
  EventEmitter.call(this, {
    wildcard: false,
    newListener: false,
    maxListener: Asset.MAX_EVENT_LISTENERS
  });

  this.options = _.extend({}, List.DefaultOptions, options || {});
  this.length = 0;

  this._callbacks = {};
}

util.inherits(List, EventEmitter);

List.DefaultOptions = {
  /**
   * How many assets should be simultaneously loaded.
   */
  maxDownloads: 5
};

List.prototype.push = Array.prototype.push;
List.prototype.slice = Array.prototype.slice;
List.prototype.splice = Array.prototype.splice;
List.prototype.pop = Array.prototype.pop;
List.prototype.indexOf = Array.prototype.indexOf;

List.prototype.isInstalled = Asset.prototype.isInstalled;
List.prototype.isInstalling = Asset.prototype.isInstalling;
List.prototype.isUninstalling = Asset.prototype.isUninstalling;
List.prototype.isLoaded = Asset.prototype.isLoaded;
List.prototype.isLoading = Asset.prototype.isLoading;
List.prototype.isUnloading = Asset.prototype.isUnloading;
List.prototype.isDisposed = Asset.prototype.isDisposed;
List.prototype.isDisposing = Asset.prototype.isDisposing;
List.prototype.load = Asset.prototype.load;
List.prototype.install = Asset.prototype.install;
List.prototype.uninstall = Asset.prototype.uninstall;
List.prototype.unload = Asset.prototype.unload;
List.prototype.dispose = Asset.prototype.dispose;

List.prototype.add = function (asset, index) {
  if (_.isArray(asset)) {
    for (var i = 0, len = asset.length; i < len; i += 1) {
      this.add(asset[i]);
    }
    return;
  }

  if (this.indexOf(asset) === -1) {
    if (typeof index === 'number') {
      this[index] = asset;
      this.length = index >= this.length ? index + 1 : this.length;
    } else {
      index = this.length;
      this.push(asset);
    }

    this.emit('add', asset, index);

    if (this.isInstalled()) {
      asset.install();
    }

    if (this.isLoaded()) {
      asset.load();
    }
  }
};



List.prototype._load = function (callback) {
  var tasks = _.map(this, function (asset) {
    return function (done) {
      asset.load(done);
    };
  });

  function _callback(err) {
    // There's no need to store the result array passed by
    // `async.parallel()`/`async.parallelLimit()`.
    callback(err, null);
  }

  if (this.options.maxDownloads) {
    async.parallelLimit(tasks, this.options.maxDownloads, _callback);
  } else {
    async.parallel(tasks, _callback);
  }
};


List.prototype._install = function (result, callback) {
  var tasks = _.map(this, function (asset) {
    return function (done) {
      asset.install(done);
    };
  });

  async.series(tasks, function (err) {
    // There's no need to store the result array passed by
    // `async.parallel()`/`async.parallelLimit()`.
    callback(err, null);
  });
};


List.prototype._uninstall = function (result, callback) {
  var tasks = _.map(this, function (asset) {
    return function (done) {
      asset.uninstall(done);
    };
  });

  async.series(tasks, function (err) {
    // There's no need to store the result array passed by
    // `async.parallel()`/`async.parallelLimit()`.
    callback(err, null);
  });
};

List.prototype._unload = function (result, callback) {
  var tasks = _.map(this, function (asset) {
    return function (done) {
      asset.unload(done);
    };
  });

  async.parallel(tasks, function (err) {
    // There's no need to store the result array passed by
    // `async.parallel()`/`async.parallelLimit()`.
    callback(err);
  });
};


List.prototype._dispose = function () {
  // Empty the asset list (and dispose the listed assets)
  while (this.length > 0) {
    this.pop().dispose();
  }
};


module.exports = List;