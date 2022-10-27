import { Vector2 } from "../jscaster.js";

class Level {
  constructor(width, height) {
    this.width = width;
    this.height = height;

    this.polygons = [];
  }

  get center() {
    return new Vector2(this.width / 2, this.height / 2);
  }

  static fromFile() {}

  toFile() {}

  addPolygon(polygon) {
    this.polygons.push(polygon);
  }

  addLight(light) {}
}

export { Level };
