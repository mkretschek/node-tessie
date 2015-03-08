'use strict';

var _ = require('lodash');
var EventEmitter = require('eventemitter2').EventEmitter2;
var util = require('./index');
var array = require('./array');

function Menu(items, options) {
  EventEmitter.call(this);

  this.items = items || [];
  this.selected = null;
  this.index = null;

  this.options = _.extend({}, Menu.DefaultOptions, options || {});

  if (this.items.length) {
    this.selectIndex(this.options.selectedIndex);
  }
}

util.inherit(Menu, EventEmitter);


Menu.DefaultOptions = {
  selectedIndex : 0
};


Menu.prototype.selectIndex = function (index) {
  index = array.getValidIndex(this.items, index);

  var old = this.selectedIndex;

  if (index !== null) {
    this.selectedIndex = index;
    this.selected = this.items[index];
  }

  this.emit('select', index, this.selected, old);

  return this.selected;
};


Menu.prototype.select = function (item) {
  var index = this.items.indexOf(item);

  if (~index) {
    return this.selectIndex(index);
  }

  return null;
};


Menu.prototype.selectNext = function () {
  return this.selectIndex(this.index + 1);
};


Menu.prototype.selectPrev = function () {
  return this.selectIndex(this.index - 1);
};


Menu.prototype.setItems = function (items) {
  if (!_.isArray(items)) {
    return;
  }

  // Reset the selected item data
  this.selected = null;
  this.selectedIndex = null;

  this.items = items;
  this.emit('set', items);

  this.selectIndex(0);
};



module.exports = Menu;