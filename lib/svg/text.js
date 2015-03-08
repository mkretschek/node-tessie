'use strict';

var svg = require('./');
var dom = require('../dom');

function text(content, options) {
  return svg.text(options, [dom.textNode(content)]);
}

function textArea() {
  // TODO
  throw(new Error('textArea: Not implemented'));
}

module.exports = text;

module.exports.area = textArea;

module.exports.set = function (el, content) {
  dom.clear(el);
  return dom.append(el, dom.textNode(content));
};