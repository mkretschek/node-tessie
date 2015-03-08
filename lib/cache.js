'use strict';

/**
 * Defines classes and methods for caching values.
 * @module core/cache
 */


/**
 * Handles data caching with optional expiration. This caching mechanism
 * keeps data in memory only. It will **not** store it in `localStorage`,
 * for example.
 *
 * @returns {Cache}
 * @constructor
 */
function Cache() {
  this._data = {};
  this._expiration = {};
}


/**
 * Sets a value in the cache.
 * @param key {string} Identifies the data being stored;
 * @param value {*} Value being cached
 * @param ttl {number} How long should the data be cached (in milliseconds)
 */
Cache.prototype.set = function (key, value, ttl) {
  ttl = ttl || 0;

  this._data[key] = value;

  if (ttl) {
    this._expiration[key] = Date.now() + ttl;
  }
};

/**
 * Removes the data for the given key from the cache.
 * @param key {string} Key that should be removed.
 */
Cache.prototype.unset = function (key) {
  delete this._data[key];
  delete this._expiration[key];
};

/**
 * Retrieves the data cached for the given key.
 * @param key {string}
 * @returns {*}
 */
Cache.prototype.get = function (key) {
  var val = this._data[key];
  return val && !this.expired(key) ? val : null;
};

/**
 * Checks if the data associated with the given key has expired.
 * @param key {string}
 * @returns {boolean}
 */
Cache.prototype.expired = function (key) {
  var expiration = this._expiration[key];

  if (expiration && expiration < Date.now()) {
    this.unset(key);
    return true;
  }

  return false;
};

/**
 * Clears the cache.
 */
Cache.prototype.clear = function () {
  this._data = {};
  this._expiration = {};
};



module.exports = new Cache();

/** @class */
module.exports.Cache = Cache;

/**
 * Creates a new cache instance.
 * @returns {Cache}
 */
module.exports.create = function () {
  return new Cache();
};
