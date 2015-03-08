'use strict';

var _ = require('lodash');

function Grid(columns, rows, options) {
  this.columns = columns;
  this.rows = rows;
  this.options = _.extend({}, Grid.DefaultOptions, options || {});

  this.width = this._width();
  this.height = this._height();
}

Grid.DefaultOptions = {
  width : 100,
  height : 100,
  hSpacing : 0,
  vSpacing : 0
};


////////////////////////////////////////////////////////////////////////////////
// Static methods

Grid.getRows = function (totalItems, columns) {
  return Math.ceil(totalItems / columns);
};


Grid.getColumns = function (totalItems, rows) {
  return Math.ceil(totalItems / rows);
};


////////////////////////////////////////////////////////////////////////////////
// Prototype


Grid.prototype._width = function () {
  return this.columns * this.options.width +
    (this.columns - 1) * this.options.hSpacing;
};

Grid.prototype._height = function () {
  return this.rows * this.options.height +
    (this.rows - 1) * this.options.vSpacing;
};

Grid.prototype.rowOffset = function (rowIndex) {
  return rowIndex * (this.options.height + this.options.vSpacing);
};

Grid.prototype.columnOffset = function (columnIndex) {
  return columnIndex * (this.options.width + this.options.hSpacing);
};

Grid.prototype.indexColumn = function (index) {
  // 0-based column index
  return (index % this.columns);
};

Grid.prototype.indexRow = function (index) {
  // 0-based row index
  return Math.floor(index / this.columns);
};

Grid.prototype.indexCoords = function (index) {
  return [this.indexColumn(index), this.indexRow(index)];
};

Grid.prototype.indexPosition = function (index) {
  var column = this.indexColumn(index);
  var row = this.indexRow(index);

  return {
    x: this.columnOffset(column),
    y: this.rowOffset(row)
  };
};


module.exports = Grid;