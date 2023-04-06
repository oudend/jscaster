//? vector factory
//maybe

/**
 * Class for representing a 2d vector.
 *
 * @class Vector2
 * @typedef {Vector2}
 */
class Vector2 {
  /**
   * Creates an instance of Vector2.
   *
   * @constructor
   * @param {number} [x=0] - X component of the vector.
   * @param {number} [y=0] - Y component of the vector.
   */
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;

    this.isVector2 = true;
  }

  /**
   * Returns the angle of the vector in degrees.
   *
   * @readonly
   * @type {number}
   */
  get degrees() {
    var angle = Math.atan2(this.y, this.x);
    var degrees = (180 * angle) / Math.PI;
    return (360 + Math.round(degrees)) % 360;
  }

  /**
   * Returns the angle of the vector in radians.
   *
   * @readonly
   * @type {*}
   */
  get radians() {
    return Math.atan2(this.y, this.x);
  }

  /**
   * Adds to another vector or adds each component by single value.
   *
   * @param {number | Vector2} v
   * @returns {this}
   */
  add(v) {
    if (v.isVector2) {
      this.x += v.x;
      this.y += v.y;
    } else {
      this.x += v;
      this.y += v;
    }
    return this;
  }

  /**
   * Subtracts by another vector or subtracts each component by single value.
   *
   * @param {number | Vector2} v
   * @returns {this}
   */
  subtract(v) {
    if (v.isVector2) {
      this.x -= v.x;
      this.y -= v.y;
    } else {
      this.x -= v;
      this.y -= v;
    }
    return this;
  }

  /**
   * Multiplies with another vector or multiplies each component by single value.
   *
   * @param {*} v
   * @returns {this}
   */
  multiply(v) {
    if (v.isVector2) {
      this.x *= v.x;
      this.y *= v.y;
    } else {
      this.x *= v;
      this.y *= v;
    }
    return this;
  }

  /**
   * Divides with another vector or divides each component by single value.
   *
   * @param {*} v
   * @returns {this}
   */
  divide(v) {
    if (v.isVector2) {
      this.x /= v.x;
      this.y /= v.y;
    } else {
      this.x /= v;
      this.y /= v;
    }
    return this;
  }

  /**
   * Compares two vectors and returns whether or not their x and y components are equal.
   *
   * @static
   * @param {*} v1 - First vector.
   * @param {*} v2 - Second vector.
   * @returns {boolean}
   */
  static compare(v1, v2) {
    return v1.x == v2.x && v1.y == v2.y;
  }

  /**
   * Returns the dot product of two vectors.
   *
   * @static
   * @param {*} v1 - First vector.
   * @param {*} v2 - Second vector.
   * @returns {number}
   */
  static dot(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y;
  }

  /**
   * Converts angle in radians to vector.
   *
   * @static
   * @param {number} angle - Angle in radians.
   * @returns {Vector2}
   */
  static fromAngle(angle) {
    return new Vector2(Math.cos(angle), Math.sin(angle));
  }

  /**
   * Subtracts two vectors or subtracts first vectors components by value in second.
   *
   * @static
   * @param {Vector2} v1 - First vector.
   * @param {number | Vector2} v2 - Second vector.
   * @returns {Vector2}
   */
  static subtract(v1, v2) {
    if (v2.isVector2) return new Vector2(v1.x - v2.x, v1.y - v2.y);
    return new Vector2(v1.x - v2, v1.y - v2);
  }

  /**
   * Adds two vectors or adds first vectors components by value in second.
   *
   * @static
   * @param {Vector2} v1 - First vector.
   * @param {number | Vector2} v2 - Second vector.
   * @returns {Vector2}
   */
  static add(v1, v2) {
    if (v2.isVector2) return new Vector2(v1.x + v2.x, v1.y + v2.y);
    return new Vector2(v1.x + v2, v1.y + v2);
  }

  /**
   * Divides two vectors or divides first vectors components by value in second.
   *
   * @static
   * @param {Vector2} v1 - First vector.
   * @param {number | Vector2} v2 - Second vector.
   * @returns {Vector2}
   */
  static divide(v1, v2) {
    if (v2.isVector2) return new Vector2(v1.x / v2.x, v1.y / v2.y);
    return new Vector2(v1.x / v2, v1.y / v2);
  }

  /**
   * Multiplies two vectors or multiplies first vectors components by value in second.
   *
   * @static
   * @param {Vector2} v1 - First vector.
   * @param {number | Vector2} v2 - Second vector.
   * @returns {Vector2}
   */
  static multiply(v1, v2) {
    if (v2.isVector2) return new Vector2(v1.x * v2.x, v1.y * v2.y);
    return new Vector2(v1.x * v2, v1.y * v2);
  }

  /**
   * Returns the angle between two vectors in degrees.
   *
   * @static
   * @param {Vector2} v1 - First vector.
   * @param {Vector2} v2 - Second vector.
   * @returns {number}
   */
  static angleBetween(v1, v2) {
    return (Math.atan2(v2.y - v1.y, v2.x - v1.x) * 180) / Math.PI;
  }

  /**
   * Returns the euclidean distance between two vectors.
   *
   * @static
   * @param {*} v1 - First vector.
   * @param {*} v2 - Second vector.
   * @returns {*}
   */
  static distance(v1, v2) {
    var a = v1.x - v2.x;
    var b = v1.y - v2.y;

    var c = Math.sqrt(a * a + b * b);

    return c;
  }
}

export { Vector2 };
