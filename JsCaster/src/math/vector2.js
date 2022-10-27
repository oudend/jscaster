//? vector factory
//maybe

class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  get angle() {
    var angle = Math.atan2(this.y, this.x);
    var degrees = (180 * angle) / Math.PI;
    return (360 + Math.round(degrees)) % 360;
  }

  static dot(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y;
  }

  static fromAngle(angle) {
    return new Vector2(Math.cos(angle), Math.sin(angle));
  }

  static subtract(v1, v2) {
    return new Vector2(v1.x - v2.x, v1.y - v2.y);
  }

  static add(v1, v2) {
    return new Vector2(v1.x + v2.x, v1.y + v2.y);
  }

  static divide(v1, v2) {
    return new Vector2(v1.x / v2.x, v1.y / v2.y);
  }

  static multiply(v1, v2) {
    return new Vector2(v1.x * v2.x, v1.y * v2.y);
  }

  static angleBetween(v1, v2) {
    return (Math.atan2(v2.y - v1.y, v2.x - v1.x) * 180) / Math.PI;
  }

  static distance(v1, v2) {
    var a = v1.x - v2.x;
    var b = v1.y - v2.y;

    var c = Math.sqrt(a * a + b * b);

    return c;
  }
}

export { Vector2 };
