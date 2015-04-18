'use strict';

var _ = require('lodash');

var Asset = require('./asset');
var Data = require('./data');
var Img = require('./image');
var Script = require('./script');
var Style = require('./style');
var List = require('./list');

exports.create = function (src, options) {
  /* jshint maxcomplexity: 12 */

  if (src instanceof Asset) {
    return src;
  }

  if (_.isArray(src)) {
    var list = new List(options);
    _.forEach(src, function (s) {
      list.add(s);
    });
    return list;
  }

  if (!_.isString(src)) {
    throw new Error('Invalid asset source: ' + src);
  }

  var ext = src.substr(src.lastIndexOf('.') + 1);

  switch (ext) {
    case 'jpg':
    case 'png':
    case 'gif':
    case 'bmp':
    case 'jpeg':
    case 'tiff':
      return new Img(src, options);

    case 'js':
      return new Script(src, options);

    case 'css':
      return new Style(src, options);

    default:
      return new Data(src, options);
  }
};