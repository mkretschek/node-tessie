'use strict';

var _ = require('lodash');
var xml = require('../xml');
var dom = require('../dom');

// Register the svg and xlink namespaces
xml.ns.add('svg', 'http://www.w3.org/2000/svg');
xml.ns.add('xlink', 'http://www.w3.org/1999/xlink');

var parser = new DOMParser();

// Avoid fetching the namespace every time we create an element
var SVG_NAMESPACE = xml.ns.get('svg');

exports.parse = function (str) {
  var wrappedStr = '<g xmlns="' + SVG_NAMESPACE + '">' + str + '</g>';
  var doc = parser.parseFromString(wrappedStr, 'image/svg+xml');
  return doc.documentElement.childNodes;
};

exports.append = function (parent, content) {
  parent = dom.get(parent);
  content = typeof content === 'string' ? this.parse(content) : content;
  dom.append(parent, content);
};



exports.createElement = function (tag, attrs, children) {
  return dom.createElement([SVG_NAMESPACE, tag], attrs, children);
};

exports.element = exports.createElement;

exports.getViewBoxString = function (args) {
  args = _.isArray(args) ? args : Array.prototype.slice.call(arguments);

  // If only 2 arguments are given, assume they are the viewbox's width and
  // height and make its origin 0, 0
  if (args.length === 2) {
    args.splice(0, 0, 0, 0);
  }

  return args.join(' ');
};


