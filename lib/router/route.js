'use strict';

var util = require('../');


function Route(path, action) {
  this.path = path;
  this.action = action;

  if (this.action && this.action.length >= 2) {
    this.isAsync = util.returnTrue;
  }
}

Route.prototype.isAsync = util.returnFalse;

Route.prototype.match = function (path) {
  path = path || '';
  var args;

  if (typeof this.path === 'string') {
    if (path.indexOf(this.path) === 0) {
      args = [path, this.path];
    }
  } else {
    // Expect `this.path` to be a RegExp
    args = path.match(this.path);

    if (args) {
      // Insert the full path at the beginning
      args.unshift(path);
    }
  }

  return args || null;
};


Route.prototype.run = function (args, cb) {
  var req = {};
  var path = req.path = args[0];
  var match = req.match = args[1];

  req.notMatched = path.indexOf(match) === 0 ? path.slice(match.length) : path;
  req.args = args.slice(2);
  req.route = this;

  if (this.isAsync()) {
    this.action(req, function (err) {
      // Ensure asynchronicity
      process.nextTick(function () {
        cb(err, err ? null : req);
      });
    });
  } else {
    this.action(req);
    return req;
  }
};


Route.prototype.process = function (path, cb) {
  path = path || '';
  cb = cb || util.noop;

  var match = this.match(path);
  if (match) {
    // Runs the matched action with the following arguments:
    //    0: full path
    //    1: matched part of the path
    //    2: first matched group
    //    ...
    //    n: nth matched group
    //
    // #run() ensures the asynchronicity of the callback's execution
    this.run(match, cb);
    return this;
  }

  // Ensure asynchronicity
  process.nextTick(function () {
    cb(null, null);
  });

  return null;
};


module.exports = Route;