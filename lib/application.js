'use strict';

var _ = require('lodash');
var async = require('async');
var EventEmitter2 = require('eventemitter2').EventEmitter;
var util = require('../');


function Application(name, options) {
  EventEmitter2.call(this);

  this.name = name;
  this.options = _.extend({}, Application.DefaultOptions, options || {});
}

util.inherits(Application, EventEmitter2);

Application.DefaultOptions = {
  parallelDownloads: 4
};


////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// Initialization methods //////////////////////////////////////////////////////


Application.prototype.load = function (callback) {
  var dependencies = this.options.dependencies;
  var tasks, task, len, i;

  if (dependencies && !Array.isArray(dependencies)) {
    throw(new Error(
      'Dependencies must be an array ' +
      '(got ' + typeof dependencies + ')'
    ));
  }

  callback = callback || util.noop;

  tasks = createLoadDependencyTasks(dependencies);

  async.parallelLimit(
    tasks,
    this.options.parallelDownloads,
    function (err, results) {
      if (err) {
        callback(err);
      }

      callback(null, results);
    });
};

Application.prototype.initialize = function (callback) {};

Application.prototype.activate = function (callback) {};

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


function createLoadDependencyTasks(dependencies) {
  dependencies = dependencies || [];

  var tasks = [];
  var len, i, asset;

  for (i = 0, len = dependencies.length; i < len; i += 1) {
    asset = dependencies[i];

    if (!asset) {
      continue;
    }

    if (typeof asset === 'string') {
      asset = Asset.create(asset);
    }



    // TODO create an event listener that triggers a progress event

    tasks.push(asset.load.bind(asset));
  }

  return tasks;
}

function cancelDependencyDownloads(dependencies) {
  var i, len;
  for (i = 0, len = dependencies.length; i < len; i += 1) {
    dependencies[i].destroy();
  }
}
