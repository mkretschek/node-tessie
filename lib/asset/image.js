'use strict';

var Asset = require('./asset');
var util = require('../');

function Image() {
  Asset.apply(this, arguments);
}

util.inherits(Image, Asset);

Image.prototype._load = function (callback) {
  var _loadTimeout;

  function clearLoadTimeout() {
    if (_loadTimeout) {
      clearTimeout(_loadTimeout);
      _loadTimeout = null;
    }
  }

  var uri = this.uri;
  var img = new window.Image();

  function clearHandlers() {
    img.onload = null;
    img.onerror = null;
  }

  img.onload = function () {
    clearLoadTimeout();
    clearHandlers();
    callback(null, img);
  };

  img.onerror = function (e) {
    clearLoadTimeout();
    clearHandlers();
    callback(e);
  };

  img.src = uri;

  _loadTimeout = setTimeout(function () {
    clearLoadTimeout();

    var err = new Error('Image timeout');
    err.uri = uri;
    err.code = 'TIMEOUT';

    callback(err);
  }, this.options.timeout);
};

Image.prototype._install = function (image, callback) {
  // There's nothing to do to install an image
  callback(null, image);
};

Image.prototype._uninstall = function (image, callback) {
  // Nothing to do here...
  callback(null, image);
};

Image.prototype._unload = function (image, callback) {
  // Set the image's src attribute to a tiny image to improve
  // memory saving (**DO NOT** set it to an empty string).
  // @see http://www.nczonline.net/blog/2009/11/30/empty-image-src-can-destroy-your-site/
  // @see http://engineering.linkedin.com/linkedin-ipad-5-techniques-smooth-infinite-scrolling-html5
  image.src = Image.TRANSPARENT_GIF;
  callback(null);
};


/**
 * A tiny transparent GIF.
 * @type {string}
 */
Image.TRANSPARENT_GIF = '../test/blank.gif';

module.exports = Image;