'use strict';

// lighten- and darken-related functions are based on
// http://stackoverflow.com/a/13542669/1422306


var HEX_COLOR_PATTERN = /^#[0-f]{3}(?:[0-f]{3})?$/i;


function _normalize(c) {
  c = c.replace('#', '');

  if (c.length === 3) {
    c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  }

  return c;
}


exports.isColor = function (color) {
  if (typeof color !== 'string') {
    return false;
  }

  return HEX_COLOR_PATTERN.test(color);
};

/**
 * Converts the given hexadecimal color into a number.
 * @param {string} hex Hexadecimal color
 * @returns {Number}
 */
exports.toInt = function (hex) {
  return parseInt(_normalize(hex), 16);
};


/**
 * Blends two hexadecimal colors by the given amount.
 *
 * @param {string} color1 Hexadecimal color
 * @param {string} color2 Hexadecimal color
 * @param {number} amount Strength of the blend, ranging from 0 (0%, equals
 *  color1) to 1 (100%, equals color2).
 *
 * @returns {string} Hexadecimal color
 */
exports.blend = function (color1, color2, amount) {
  amount = amount || 0;

  var
    c1 = this.toInt(color1),
    r1 = c1 >> 16,
    g1 = c1 >> 8 & 0x00FF,
    b1 = c1 & 0x0000FF,

    c2 = this.toInt(color2),
    r2 = c2 >> 16,
    g2 = c2 >> 8 & 0x00FF,
    b2 = c2 & 0x0000FF,

    blend = 0x1000000 +
      (Math.round((r2 - r1) * amount) + r1) * 0x10000 +
      (Math.round((g2 - g1) * amount) + g1) * 0x100 +
      (Math.round((b2 - b1) * amount) + b1);

  return '#' + blend.toString(16).slice(1);
};


/**
 * Lightens the given color.
 *
 * @param {string} color Hexadecimal color
 * @param {number} amount A number from 0 to 1 indicating how much the given
 *  color should be lightened. 0 (0%) returns the original color and 1 (100%)
 *  returns white.
 *
 * @returns {string} Hexadecimal color
 */
exports.lighten = function (color, amount) {
  amount = amount || 0;

  var
    c = this.toInt(color),
    t = amount < 0 ? 0 : 255,
    l = amount < 0 ? -amount : amount,
    r = c >> 16,
    g = c >> 8 & 0x00FF,
    b = c & 0x0000FF,

    blend = 0x1000000 +
      (Math.round((t - r) * l) + r) * 0x10000 +
      (Math.round((t - g) * l) + g) * 0x100 +
      (Math.round((t - b) * l) + b);

  return '#' + blend.toString(16).slice(1);
};

/**
 * Darkens the given color.
 *
 * @param {string} color Hexadecimal color
 * @param {number} amount A number from 0 to 1 indicating how much the given
 *  color should be darkened. 0 (0%) returns the original color and 1 (100%)
 *  returns black.
 *
 * @returns {string} Hexadecimal color
 */
exports.darken = function (color, amount) {
  return this.lighten(color, amount * -1);
};
