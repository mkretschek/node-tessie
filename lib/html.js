'use strict';

var _ = require('lodash');


function createHead() {
  var body = exports.getBody();
  var head = document.createElement('head');
  body.parentNode.insertBefore(head, body);
  return head;
}


exports.getTitle = function () {
  return document.title || '';
};


exports.getMeta = function (key) {
  var elements = document.getElementsByTagName('meta');
  var len, i, meta;

  for (i = 0, len = elements.length; i < len; i += 1) {
    meta = elements[i];
    if (meta.getAttribute('name') === key) {
      return meta.getAttribute('content') || null;
    }
  }

  return null;
};

exports.getBody = function () {
  return document.body;
};

exports.getHead = function () {
  var head = document.getElementsByTagName('head')[0];

  if (!head) {
    head = createHead();
  }

  return head;
};


exports.parse = function (str) {
  if (_.isElement(str)) {
    return str;
  }

  var wrapper = document.createElement('div');
  wrapper.innerHTML = str;

  return wrapper.children || null;
};