'use strict';

var _ = require('lodash');
var EventEmitter = require('eventemitter2').EventEmitter2;
var util = require('../');
var CallbackStack = require('../callback-stack');

var Evt = {
  LOADING: 'loading',
  LOAD: 'load',
  INSTALLING: 'installing',
  INSTALL: 'install',
  UNINSTALLING: 'uninstalling',
  UNINSTALL: 'uninstall',
  UNLOADING: 'unloading',
  UNLOAD: 'unload',
  ERROR: 'error'
};

function Asset(uri, options) {
  EventEmitter.call(this, {
    wildcard: false,
    newListener: false,
    maxListener: Asset.MAX_EVENT_LISTENERS
  });

  if (!uri || typeof uri !== 'string') {
    throw new Error('Invalid uri: ' + JSON.stringify(uri));
  }

  this.uri = uri;
  this.options = _.extend({}, Asset.DefaultOptions, options || {});

  this._callbacks = {};
}

util.inherits(Asset, EventEmitter);

Asset.MAX_EVENT_LISTENERS = 20;

Asset.DefaultOptions = {
  method: 'GET',
  type: 'json',
  timeout: 5000
};


Asset.prototype.isLoaded = util.returnFalse;
Asset.prototype.isLoading = util.returnFalse;
Asset.prototype.isUnloading = util.returnFalse;
Asset.prototype.isInstalling = util.returnFalse;
Asset.prototype.isInstalled = util.returnFalse;
Asset.prototype.isUninstalling = util.returnFalse;
Asset.prototype.isDisposed = util.returnFalse;
Asset.prototype.isDisposing = util.returnFalse;

Asset.prototype.load = function (callback) {
  if (this.isDisposed() || this.isDisposing()) {
    throw new Error('Cannot load destroyed assets');
  }

  if (!this._callbacks.load) {
    this._callbacks.load = new CallbackStack();
  }

  var self = this;

  if (this.isLoaded()) {
    // Ensure asynchronicity
    process.nextTick(function () {
      callback(null, self.result);
    });
    return;
  }

  this._callbacks.load.push(callback);

  if (this.isLoading()) {
    return;
  }

  this.isLoading = util.returnTrue;
  this.emit(Evt.LOADING);

  // Ensure asynchronicity
  process.nextTick(function () {
    self._load(function (err, result) {
      self.isLoading = util.returnFalse;

      if (err) {
        self.emit(Evt.ERROR, [err]);
        self._callbacks.load.apply(null, [err, null]);
        return;
      }

      self.isLoaded = util.returnTrue;
      self.result = result;
      self.emit(Evt.LOAD, [result]);
      self._callbacks.load.apply(null, [null, result]);
    });
  });
};


Asset.prototype.install = function (callback) {
  if (this.isDisposed() || this.isDisposing()) {
    throw new Error('Cannot install destroyed assets');
  }

  if (!this._callbacks.install) {
    this._callbacks.install = new CallbackStack();
  }

  var self = this;

  if (this.isInstalled()) {
    // Ensure asynchronicity
    process.nextTick(function () {
      callback(null, self.result);
    });
    return;
  }

  if (!this.isLoaded()) {
    return this.load(function (err) {
      if (err) {
        return callback(err, null);
      }

      self.install(callback);
    });
  }

  this._callbacks.install.push(callback);

  if (this.isInstalling()) {
    return;
  }

  this.isInstalling = util.returnTrue;
  this.emit(Evt.INSTALLING);

  // Ensure asynchronicity
  process.nextTick(function () {
    self._install(self.result, function (err, result) {
      self.isInstalling = util.returnFalse;

      if (err) {
        self.emit(Evt.ERROR, err);
        self._callbacks.install.apply(null, [err]);
        return;
      }

      self.result = result;
      self.isInstalled = util.returnTrue;
      self.emit(Evt.INSTALL, result);
      self._callbacks.install.apply(null, [null, result]);
    });
  });
};


Asset.prototype.uninstall = function (callback) {
  if (this.isDisposed()) {
    throw new Error('Cannot uninstall destroyed asset');
  }

  if (!this.isInstalled()) {
    // Ensure asynchronicity
    process.nextTick(function () {
      callback(null);
    });
    return;
  }

  if (!this._callbacks.uninstall) {
    this._callbacks.uninstall = new CallbackStack();
  }

  this._callbacks.uninstall.push(callback);

  if (this.isUninstalling()) {
    return;
  }

  this.isUninstalling = util.returnTrue;
  this.emit(Evt.UNINSTALLING);

  var self = this;

  // Ensure asynchronicity
  process.nextTick(function () {
    self._uninstall(self.result, function (err, content) {
      self.isUninstalling = util.returnFalse;

      if (err) {
        self.emit(Evt.ERROR, err);
        self._callbacks.uninstall.call(null, err);
        return;
      }

      // Store the content, allowing to reinstall it
      self.result = content;
      self.isInstalled = util.returnFalse;
      self.emit(Evt.UNINSTALL);
      self._callbacks.uninstall.call(null);
    });
  });

};

Asset.prototype.unload = function (callback) {
  if (this.isDisposed()) {
    throw new Error('Cannot unload destroyed asset');
  }

  if (!this.isLoaded()) {
    // Ensure asynchronicity
    process.nextTick(function () {
      callback(null);
    });
    return;
  }

  var self = this;

  if (this.isInstalled()) {
    return this.uninstall(function (err) {
      if (err) {
        return callback(err);
      }

      self.unload(callback);
    });
  }

  if (!this._callbacks.unload) {
    this._callbacks.unload = new CallbackStack();
  }

  this._callbacks.unload.push(callback);

  if (this.isUnloading()) {
    return;
  }

  this.isUnloading = util.returnTrue;
  this.emit(Evt.UNLOADING);

  process.nextTick(function () {
    self._unload(self.result, function (err) {
      self.isUnloading = util.returnFalse;

      if (err) {
        self.emit(Evt.ERROR, err);
        self._callbacks.unload.call(null, err);
        return;
      }

      self.result = null;
      self.isLoaded = util.returnFalse;
      self.emit(Evt.UNLOAD);
      self._callbacks.unload.call(null);
    });
  });
};


Asset.prototype.dispose = function () {
  var self = this;

  if (this.isDisposed() || this.isDisposing()) {
    return;
  }

  this.isDisposing = util.returnTrue;

  this.unload(function () {
    var callbacks = self._callbacks;

    // Clear properties
    self.uri = null;
    self.result = null;
    self.options = null;

    // Clear callbacks
    if (callbacks) {
      self._callbacks = null;

      if (callbacks.load) {
        callbacks.load.clear();
      }

      if (callbacks.install) {
        callbacks.install.clear();
      }

      if (callbacks.uninstall) {
        callbacks.uninstall.clear();
      }

      if (callbacks.unload) {
        callbacks.unload.clear();
      }
    }

    // Call internal disposal method if available
    if (self._dispose) {
      self._dispose();
    }

    self.isDisposing = util.returnFalse;
    self.isDisposed = util.returnTrue;
    self.emit('dispose');

    // Clear all event listeners
    self.removeAllListeners();
  });
};

/**
 * @abstract
 * @private
 */
Asset.prototype._load = function () {
  throw new Error('Not implemented');
};

/**
 * @abstract
 * @private
 */
Asset.prototype._install = function () {
  throw new Error('Not implemented');
};

/**
 * @abstract
 * @private
 */
Asset.prototype._uninstall = function () {
  throw new Error('Not implemented');
};

/**
 * By default, no special action is required when unloading an asset.
 * @private
 */
Asset.prototype._unload = function (result, callback) {
  callback(null);
};


module.exports = Asset;