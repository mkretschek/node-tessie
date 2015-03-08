'use strict';



exports.milliseconds = function (val) {
  return new Interval(val, Unit.Millisecond);
};

exports.seconds = function (val) {
  return new Interval(val, Unit.Second);
};

exports.minutes = function (val) {
  return new Interval(val, Unit.Minute);
};

exports.hours = function (val) {
  return new Interval(val, Unit.Hour);
};

exports.days = function (val) {
  return new Interval(val, Unit.Day);
};

exports.weeks = function (val) {
  return new Interval(val, Unit.Week);
};

exports.years = function (val) {
  return new Interval(val, Unit.Year);
};



function Unit(name, ratio) {
  this.name = name;
  this.ratio = ratio;
}

Unit.prototype.valueOf = function () {
  return this.ratio;
};

Unit.Millisecond =  new Unit('millisecond', 0.001);     // Second / 1000
Unit.Second =       new Unit('second',      1);
Unit.Minute =       new Unit('minute',      60);        // Second * 60
Unit.Hour =         new Unit('hour',        3600);      // Minute * 60
Unit.Day =          new Unit('day',         86400);     // Hour * 24
Unit.Week =         new Unit('week',        604800);    // Day * 7
Unit.Year =         new Unit('year',        31556952);  // Day * 365.2425



function Interval(val, unit) {
  unit = unit || Unit.Second;
  this.val = val * unit.ratio;
  this.unit = unit;
}

Interval.prototype.toMilliseconds = function () {
  return this.val * Unit.Millisecond.ratio;
};

Interval.prototype.toSeconds = function () {
  return this.val * Unit.Second.ratio;
};

Interval.prototype.toMinutes = function () {
  return this.val * Unit.Minute.ratio;
};

Interval.prototype.toHours = function () {
  return this.val * Unit.Hour.ratio;
};

Interval.prototype.toDays = function () {
  return this.val * Unit.Day.ratio;
};

Interval.prototype.toWeeks = function () {
  return this.val * Unit.Week.ratio;
};

Interval.prototype.toYears = function () {
  return this.val * Unit.Year.ratio;
};

exports.Unit = Unit;
exports.Interval = Interval;