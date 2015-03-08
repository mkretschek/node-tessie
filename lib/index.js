'use strict';


/**
 * A no-op function.
 */
exports.noop = function () {};


/**
 * The global object.
 * @type {object}
 */
exports.global = (Function || exports.noop.constructor)('return this')();


/**
 * Makes `Cls` a subclass of `Super`.
 * @param Cls {Function} The subclass constructor
 * @param Super {Function} The superclass constructor
 */
exports.inherits = function (Cls, Super) {
  Cls.prototype = Object.create(Super.prototype);
  Cls.prototype.constructor = Cls;
  Cls.super = Super;
};

/**
 * A function that always returns `true`.
 * @returns {boolean}
 */
exports.returnTrue = function () {
  return true;
};

/**
 * A function that always returns `false`.
 * @returns {boolean}
 */
exports.returnFalse = function () {
  return false;
};