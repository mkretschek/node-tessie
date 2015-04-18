'use strict';


var _ = require('lodash');
var async = require('async');

var EventEmitter = require('eventemitter2').EventEmitter2;
var util = require('../');
var Asset = require('./asset');

var createAsset = require('./').create;


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
    _.forEach(asset, function (a) {
      this.add(a);
    }, this);

    return this;
  }

  if (!(asset instanceof Asset)) {
    asset = createAsset(asset);
  }

  if (this.indexOf(asset) === -1) {
    if (typeof index === 'number') {
      if (this[index]) {
        // Splice already takes care of incrementing the length
        this.splice(index, 0, asset);
      } else {
        this[index] = asset;
        this.length = index >= this.length ? index + 1 : this.length;
      }
    } else {
      index = this.length;
      this.push(asset);
    }

    this.emit('add', asset, index);

    if (this.isInstalled()) {
      asset.install();
    } else if (this.isLoaded()) {
      asset.load();
    }
  }

  return this;
};



List.prototype._load = function (callback) {
  var self = this;
  var progress = 0;
  var total = this.length;

  function updateProgress() {
    progress += 1;
    self.emit('progress.load', progress, total);
  }

  var tasks = _.map(this, function (asset) {
    asset.once('load', updateProgress);

    return function (done) {
      asset.load(done);
    };
  });

  function _callback(err) {
    if (err) {
      _.each(self, function (asset) {
        asset.off('install', updateProgress);
      });

      return callback(err);
    }

    // There's no need to store the result array passed by
    // `async.parallel()`/`async.parallelLimit()`.
    callback(null);
  }

  if (this.options.maxDownloads) {
    async.parallelLimit(tasks, this.options.maxDownloads, _callback);
  } else {
    async.parallel(tasks, _callback);
  }
};


List.prototype._install = function (result, callback) {
  var self = this;
  var progress = 0;
  var total = this.length;

  function updateProgress() {
    progress += 1;
    self.emit('progress.install', progress, total);
  }


  var tasks = _.map(this, function (asset) {
    asset.once('install', updateProgress);

    return function (done) {
      asset.install(done);
    };
  });

  async.series(tasks, function (err) {
    if (err) {
      _.each(self, function (asset) {
        asset.off('install', updateProgress);
      });

      return callback(err);
    }

    // There's no need to store the result array passed by `async.series()`
    callback(null);
  });
};


List.prototype._uninstall = function (result, callback) {
  var self = this;
  var progress = 0;
  var total = this.length;

  function updateProgress() {
    progress += 1;
    self.emit('progress.uninstall', progress, total);
  }

  var tasks = _.map(this, function (asset) {
    asset.once('uninstall', updateProgress);

    return function (done) {
      asset.uninstall(done);
    };
  });

  async.series(tasks, function (err) {
    if (err) {
      _.each(self, function (asset) {
        asset.off('uninstall', updateProgress);
      });

      callback(err);
    }

    // There's no need to store the result array passed by `async.series()`
    callback(null);
  });
};

List.prototype._unload = function (result, callback) {
  var self = this;
  var progress = 0;
  var total = this.length;

  function updateProgress() {
    progress += 1;
    self.emit('progress.unload', progress, total);
  }

  var tasks = _.map(this, function (asset) {
    asset.once('unload', updateProgress);

    return function (done) {
      asset.unload(done);
    };
  });

  async.parallel(tasks, function (err) {
    if (err) {
      _.each(self, function (asset) {
        asset.off('unload', updateProgress);
      });

      callback(err);
    }

    // There's no need to store the result array passed by `async.parallel()`
    callback(null);
  });
};


List.prototype._dispose = function () {
  // Empty the asset list (and dispose the listed assets)
  while (this.length > 0) {
    this.pop().dispose();
  }
};


module.exports = List;