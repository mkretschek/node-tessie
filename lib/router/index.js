'use strict';

var async = require('async');

var _ = require('lodash');
var Route = require('./route');

var util = require('../');


function Router(options) {
  this._routes = [];
  this.options = _.extend({}, Router.DefaultOptions, options || {});
}

Router.DefaultOptions = {
  stopAtFirstMatch: true
};

Router.prototype.isAsync = util.returnFalse;

Router.prototype.process = function (path, cb) {

  var cbCount = 0;
  var matchedRequests = [];

  function _cb(err, result) {
    if (err) {
      matchedRequests.length = 0;
      matchedRequests = null;

      cb(err, null);
    } else if (matchedRequests) {
      matchedRequests.push(req);

      if (matchedRequests.length === cbCount) {
        cb(null, matchedRequests);
      }
    }
  }

  var routes = _.filter(this._routes, function (route) {
    var r = route.process(path, function () {

    });

    if (r) {
      if (route.isAsync()) {
        tasks.push(function (done) {
          route.process(path, done);
        });
      } else {
        tasks.push(function (done) {

        })
      }
      route.isAsync() ?
        tasks.push(function ())
    }
  });
    return route.isAsync() ?

  });

  async.series(tasks, cb);
};


Router.prototype.set = function (path, action) {
  var route = new Route(path, action);
  this._routes.push(route);

  if (route.isAsync()) {
    this.isAsync = util.returnTrue;
  }

  return route;
};



function RouteResult()


module.exports = Router;