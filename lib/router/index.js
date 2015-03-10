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
};


Router.prototype.set = function (path, action) {
  var route = new Route(path, action);
  this._routes.push(route);

  if (route.isAsync()) {
    this.isAsync = util.returnTrue;
  }

  return route;
};




module.exports = Router;