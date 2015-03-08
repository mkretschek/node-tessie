'use strict';

var _ = require('lodash');
var xml = require('./xml');

exports.createElement = function (tag, attrs, children) {
  var split;
  var ns;

  split = _.isArray(tag) ? tag : xml.ns.split(tag);
  ns = split[0];
  tag = split[1];

  var el = ns ? document.createElementNS(ns, tag) : document.createElement(tag);
  var len, i;

  if (attrs) {
    exports.attr(el, attrs);
  }

  if (children) {
    if (!_.isArray(children)) {
      children = [children];
    }

    for (i = 0, len = children.length; i < len; i += 1) {
      exports.append(el, children[i]);
    }
  }

  return el;
};

exports.is = function (el, tag) {
  return typeof tag === 'function' ?
    el instanceof tag :
    el && el.tagName && el.tagName.toLowerCase() === tag.toLowerCase();
};

exports.get = function (id) {
  // TODO(mkretschek) check if _.isElement() works with SVG elements
  if (_.isElement(id)) {
    return id;
  }

  return document.getElementById(id);
};

exports.getRootElement = function () {
  return document.documentElement;
};


exports.append = function (parent, children) {
  var len, i;

  if (typeof parent === 'string') {
    parent = exports.get(parent);
  }

  if (!parent) {
    throw('Missing parent element');
  }

  if (children) {
    if (this.isNodeList(children)) {
      // Avoid appending nodes to its own parent (would cause an infinite loop)
      if (parent.children !== children) {
        // NodeLists are live objects, therefore every time we append one of
        // its children to another element, the list itself is updated.
        // This is why we keep accessing the first element until the list
        // gets empty.
        while (children.length) {
          parent.appendChild(children[0]);
        }
      }
    } else {
      if (!_.isArray(children)) {
        children = [children];
      }

      for (i = 0, len = children.length; i < len; i += 1) {
        parent.appendChild(children[i]);
      }
    }
  }

  return parent;
};

exports.prepend = function (parent, children) {
  var len, i, firstChild;

  if (typeof parent === 'string') {
    parent = exports.get(parent);
  }

  if (!parent) {
    throw('Missing parent element');
  }

  if (children) {
    firstChild = parent.firstChild;

    if (exports.isNodeList(children)) {
      // Avoid appending nodes to its own parent (would cause an infinite loop)
      if (parent.children !== children) {
        // NodeLists are live objects, therefore every time we append one of
        // its children to another element, the list itself is updated.
        // This is why we keep accessing the first element until the list
        // gets empty.
        while (children.length) {
          parent.insertBefore(children[0], firstChild);
        }
      }
    } else {
      if (!_.isArray(children)) {
        children = [children];
      }

      for (i = 0, len = children.length; i < len; i += 1) {
        parent.insertBefore(children[i], firstChild);
      }
    }
  }

  return parent;
};


exports.attr = function (el, attr, value) {
  if (typeof attr === 'object') {
    var k;

    for (k in attr) {
      if (attr.hasOwnProperty(k)) {
        exports.attr(el, k, attr[k]);
      }
    }
  } else {
    attr = xml.ns.split(attr);

    if (arguments.length === 3) {
      if (value === null) {
        el.removeAttributeNS(attr[0], attr[1]);
      } else {
        el.setAttributeNS(attr[0], attr[1], value);
      }
    } else {
      return el.getAttributeNS(attr[0], attr[1]);
    }
  }

  return el;
};


exports.show = function (el) {
  exports.attr(el, 'display', 'inline');
  return el;
};


exports.hide = function (el) {
  exports.attr(el, 'display', 'none');
  return el;
};


exports.textNode = function (content) {
  return document.createTextNode(content);
};


exports.clear = function (el) {
  while (el.hasChildNodes()) {
    el.removeChild(el.lastChild);
  }
};


exports.remove = function (el) {
  if (_.isArray(el)) {
    return _.map(el, exports.remove);
  }

  if (typeof el === 'string') {
    el = exports.get(el);
  }

  if (el.parentNode) {
    el.parentNode.removeChild(el);
  }

  return el;
};



exports.isNodeList = function (list) {
  var str = Object.prototype.toString.call(list);
  return str === '[object HTMLCollection]' ||
      str === '[object NodeList]';
};