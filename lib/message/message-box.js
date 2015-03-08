'use strict';

var _ = require('lodash');
var EventEmitter2 = require('eventemitter2');

var util = require('../');
var Message = require('./message');


function MessageBox(options) {
  EventEmitter2.call(this);
  this.options = _.extend({}, MessageBox.DefaultOptions, options || {});

  this.current = null;
  this.messages = [];
  this.unique = {};
}

util.inherit(MessageBox, EventEmitter2);


MessageBox.prototype.next = function () {
  var next;

  if (this.current) {
    this.current.deprecate();
    delete this.current;
  }

  if (this.messages.length) {
    next = this.messages.shift();

    if (!next.isActive()) {
      return this.next();
    }

    this.current = next;
    this.emit(MessageBox.Event.MESSAGE, next);
  }

  return next;
};


MessageBox.prototype.add = function (message, description, priority, options) {
  var id;

  if (description instanceof Message) {
    id = message;
    message = description;
    return this.addUnique(id, message);
  }

  if (!(message instanceof Message)) {
    message = new Message(message, description, priority, options);
  }

  this.messages.push(message);
  this.emit(MessageBox.Event.ADD, message);
};


MessageBox.prototype.addUnique = function (id, message, description, priority,
                                           options) {

  var self = this;

  message = this.add(message, description, priority, options);

  function _removeUnique() {
    if (self.unique[id]) {
      delete self.unique[id];
    }
  }

  message.on(Message.Event.CANCEL, _removeUnique);
  message.on(Message.Event.DEPRECATE, _removeUnique);

  return message;
};


MessageBox.prototype.remove = function () {};
MessageBox.prototype.removeUnique = function () {};
MessageBox.prototype.empty = function () {};

MessageBox.prototype.destroy = function () {
  this.empty();

  delete this.messages;
  delete this.unique;
  delete this.current;

  this.removeAllListeners();
};

MessageBox.Event = {
  ADD: 'addmessage',
  ADD_UNIQUE: 'adduniquemessage',
  REMOVE: 'removemessage',
  REMOVE_UNIQUE: 'removeuniquemessage',
  EMPTY: 'empty',
  MESSAGE: 'messagechange'
};



module.exports = MessageBox;