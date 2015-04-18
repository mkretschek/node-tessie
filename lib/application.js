'use strict';

var _ = require('lodash');
var async = require('async');
var EventEmitter2 = require('eventemitter2').EventEmitter;
var util = require('../');
var asset = require('./asset');


function Application(name, options) {
  EventEmitter2.call(this);

  this.name = name;
  this.options = _.extend({}, Application.DefaultOptions, options || {});

  this.assets = getAssets(this.options.assets);
}

util.inherits(Application, EventEmitter2);

Application.DefaultOptions = {
  parallelDownloads: 4,
  assets: null
};


////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// Initialization methods //////////////////////////////////////////////////////


Application.prototype.load = function (callback) {
  if (this.assets) {
    this.assets.load(callback);
  } else {
    callback(null);
  }
};

Application.prototype.initialize = function (callback) {
  var self = this;
  var tasks;
  var progress = 0;
  var total = this.assets.length;

  callback = callback || util.noop;

  function updateProgress() {
    progress += 1;
    self.emit('progress.install', progress, total);
  }

  tasks = _.map(this.assets, function (asset) {
    asset.once('install', updateProgress);

    return function (done) {
      asset.install(done);
    };
  });

  async.series(
    tasks,
    function (err) {
      if (err) {
        _.each(self.assets, function (asset) {
          asset.off('install', updateProgress);
        });

        callback(err);
      }

      if (_.isFunction(self._initialize)) {
        self._initialize(callback);
      } else {
        callback(null);
      }
    });
};

Application.prototype.activate = function () {
  throw new Error('NOT IMPLEMENTED');
};

Application.prototype.deactivate = function () {};

Application.prototype.destroy = function () {};

Application.prototype.unload = function () {};



////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// Internal methods ////////////////////////////////////////////////////////////



////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// Helpers /////////////////////////////////////////////////////////////////////



function getAssets(assets) {
  if (!assets) {
    return [];
  }

  if (!_.isArray(assets)) {
    assets = [assets];
  }

  return asset.create(assets);
}



function cancelDependencyDownloads(assets) {
  var i, len;
  for (i = 0, len = assets.length; i < len; i += 1) {
    assets[i].destroy();
  }
}
