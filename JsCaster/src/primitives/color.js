class Color {
  constructor(r, g, b, a = 255) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  multiplyScalar(scalar) {
    this.r *= scalar;
    this.g *= scalar;
    this.b *= scalar;
  }

  get style() {
    return `rgba(${this.r},${this.g},${this.b},${this.a})`;
  }

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
