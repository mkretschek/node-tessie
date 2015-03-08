'use strict';

var EventEmitter2 = require('eventemitter2');
var _ = require('lodash');

var util = require('../');


function Message(message, description, priority, options) {
  if (!message) {
    throw(new Error('Missing message text'));
  }

  EventEmitter2.call(this);

  this.message = message;
  this.description = description || null;
  this.priority = priority || 0;
  this.options = _.extend({}, Message.DefaultOptions, options || {});

  if (this.options.wait) {
    this._startDeprecationTimeout();
  }
}

util.inherit(Message, EventEmitter2);


Message.DefaultOptions = {
  /**
   * How long can the message wait in queue before being read (in
   * milliseconds). After the given time, if the message has not been read,
   * it will be deprecated. Setting this to `0` disables the automatic
   * deprecation.
   * @type {number}
   */
  wait: 0,

  /**
   * Once the message is read, how long (in milliseconds) does it stay active
   * until being deprecated, in other words, how long the a user have to read
   * the message. Setting this to `0` disables the automatic deprecation.
   * @type {number}
   */
  timeToRead: 0
};


Message.Event = {
  /**
   * A componente started reading the message.
   */
  READING: 'reading',

  /**
   * A component (probably a `MessageBox`) has finished reading/using the
   * message.
   */
  READ: 'read',

  /** The message has been canceled before being read. */
  CANCEL: 'cancel',

  /** The message has been deprecated */
  DEPRECATE: 'deprecate',

  /** The message was destroyed */
  DESTROY: 'destroy',

  /** The message has been deactivated (either READ, CANCELED or DEPRECATED). */
  DEACTIVATE: 'deactivate'
};


Message.prototype.isReading = util.returnFalse;
Message.prototype.isRead = util.returnFalse;
Message.prototype.isDeprecated = util.returnFalse;
Message.prototype.isCanceled = util.returnFalse;
Message.prototype.isDestroyed = util.returnFalse;
Message.prototype.isActive = util.returnTrue;

Message.prototype.reading = function () {
  if (this.isActive() && !this.isReading()) {
    this._clearDeprecationTimeout();
    this.isReading = util.returnTrue;
    this.emit(Message.Event.READING, this.options.timeToRead);
    this._startReadingTimeout();
  }
};

Message.prototype.read = function () {
  if (this.isActive()) {
    this._clearReadingTimeout();
    this.isRead = util.returnTrue;
    this.isActive = util.returnFalse;
    this.emit(Message.Event.READ);
    this.emit(Message.Event.DEACTIVATE);
  }
};

Message.prototype.deprecate = function () {
  if (this.isActive()) {
    this._clearDeprecationTimeout();
    this.isDeprecated = util.returnTrue;
    this.isActive = util.returnFalse;
    this.emit(Message.Event.DEPRECATE);
    this.emit(Message.Event.DEACTIVATE);
  }
};

Message.prototype.cancel = function () {
  if (this.isActive()) {
    this._clearDeprecationTimeout();
    this._clearReadingTimeout();
    this.isCanceled = util.returnTrue;
    this.isActive = util.returnFalse;
    this.emit(Message.Event.CANCEL);
    this.emit(Message.Event.DEACTIVATE);
  }
};

Message.prototype.destroy = function () {
  if (!this.isDestroyed()) {
    if (this.isActive()) {
      this.cancel();
    }

    this.isDestroyed = util.returnTrue;
    this.emit(Message.Event.DESTROY);

    this.removeAllListeners();
    delete this.options;
    delete this.priority;
    delete this.message;
    delete this.description;
  }
};


Message.prototype._clearDeprecationTimeout = function () {
  if (this._deprecationTimeout) {
    clearTimeout(this._deprecationTimeout);
    delete this._deprecationTimeout;
  }
};

Message.prototype._startDeprecationTimeout = function () {
  var self = this;

  this._clearDeprecationTimeout();

  if (this.options.wait) {
    this._deprecationTimeout = setTimeout(function () {
      self.deprecate();
    }, this.options.wait);
  }
};

Message.prototype._clearReadingTimeout = function () {
  if (this._readingTimeout) {
    clearTimeout(this._readingTimeout);
    delete this._readingTimeout;
  }
};


Message.prototype._startReadingTimeout = function () {
  var self = this;

  this._clearReadingTimeout();

  if (this.options.timeToRead) {
    this._readingTimeout = setTimeout(function () {
      self.read();
    }, this.options.timeToRead);
  }
};



module.exports = Message;