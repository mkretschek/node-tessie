/* jshint latedef:false */
'use strict';

var _ = require('lodash');
var Q = require('q');

var svg = require('./index');
var dom = require('../dom');

// `animate` is defined at the end of the file
module.exports = animate;

var defaultAnimationSettings = {
  attributeType : 'XML',
  dur : '500ms',
  begin : 'indefinite',
  fill : 'freeze',
  calcMode : 'paced'
};


function getAnimationSettings(el, attr, val) {
  var animation = _.extend({}, defaultAnimationSettings);

  animation.attributeName = attr;

  if (typeof val === 'object') {
    _.extend(animation, val);
  } else {
    animation.to = val;
  }

  if (!animation.from) {
    animation.from = el.getAttribute(attr);
  }

  return animation;
}


function setAnimationElement(target, element) {
  if (!dom.is(element, svg.Tag.ANIMATE)) {
    element = typeof element === 'string' ?
      dom.get(element) :
      svg.animate(element);
  }

  dom.append(target, element);

  function removeElement() {
    // Prevent the attribute value from being reset after removing the
    // animation element.
    target.setAttribute(
      element.getAttribute('attributeName'),
      element.getAttribute('to')
    );

    dom.remove(element);
  }

  element.addEventListener('endEvent', removeElement, false);

  return element;
}


function getAnimationPromise(element) {
  var deferred = Q.defer();

  function resolvePromise() {
    deferred.resolve();
  }

  element.addEventListener('endEvent', resolvePromise, false);

  return deferred.promise;
}


function animateInternal(target, animation) {
  var promises = [];
  var elements = [];
  var el;
  var len, i;

  for (i = 0, len = animation.length; i < len; i += 1) {
    el = setAnimationElement(target, animation[i]);
    elements.push(el);
    promises.push(getAnimationPromise(el));
  }

  // Loop a second time through the animation stack to fire all the
  // animations.
  for (i = 0, len = elements.length; i < len; i += 1) {
    elements[i].beginElement();
  }

  return Q.all(promises);
}

function animate(el, attr, val) {
  el = dom.get(el);

  var key;
  var animation;

  if (arguments.length === 2) {
    animation = [];

    for (key in attr) {
      if (attr.hasOwnProperty(key)) {
        animation.push(getAnimationSettings(el, key, attr[key]));
      }
    }
  } else {
    animation = [getAnimationSettings(el, attr, val)];
  }

  return animateInternal(el, animation);
}


animate.fade = function (el, from, to, duration) {
  var opts = {};

  opts.from = from;
  opts.to = to;

  if (typeof duration !== 'undefined') {
    // Default to milliseconds if no unit is provided
    opts.dur = typeof duration === 'number' ? duration + 'ms' : duration;
  }

  return animate(el, 'opacity', opts);
};


animate.fadeOut = function (el, duration) {
  var from = Number(dom.attr(el, 'opacity')) || 1;
  return animate.fade(el, from, 0, duration);
};


animate.fadeIn = function (el, duration) {
  return animate.fade(el, 0, 1, duration);
};