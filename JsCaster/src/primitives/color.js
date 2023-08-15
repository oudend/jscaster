/**
 * Simple class representing a color.
 *
 * @class Color
 * @typedef {Color}
 */
class Color {
  /**
   * Creates an instance of Color.
   *
   * @constructor
   * @param {number} r - The red component of the color(value between 0 and 255).
   * @param {number} g - The green component of the color(value between 0 and 255).
   * @param {number} b - The blue component of the color(value between 0 and 255).
   * @param {number} [a=255] - The alpha component of the color(value between 0 and 255).
   */
  constructor(r, g, b, a = 255) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  /**
   * Multiply the colors rgb values with scalar.
   *
   * @param {number} scalar
   */
  multiplyScalar(scalar) {
    this.r *= scalar;
    this.g *= scalar;
    this.b *= scalar;
  }

  /**
   * css style of color.
   *
   * @readonly
   * @type {string}
   */
  get style() {
    return `rgba(${this.r},${this.g},${this.b},${this.a})`;
  }

  /**
   * Convert hexadecimal string to a Color object.
   *
   * @static
   * @param {string} hex
   * @returns {Color}
   */
  static fromHex(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? new Color(
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16)
        )
      : null;
  }
}

export { Color };
