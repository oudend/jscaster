import { Vector2 } from "../math/vector2.js";
import { LineSegment } from "../primitives/lineSegment.js";
import { Polygon } from "../primitives/polygon.js";

class Level {
  constructor(width, height, ceilingHeight = 100) {
    this.width = width;
    this.height = height;
    this.ceilingHeight = ceilingHeight;

    this.polygons = [];

    this.lights = [];

    this.walls = new Polygon(
      [
        new Vector2(0, 0),
        new Vector2(width, 0),
        new Vector2(width, height),
        new Vector2(0, height),
        //new LineSegment(new Vector2(0, height), new Vector2(0, 0)),
      ],
      ceilingHeight //this.height //TODO: Make input variable
    );
  }

  get texturesLoaded() {
    // console.log("hello");

    for (var polygon of this.polygons) {
      if (!polygon.texture) continue;
      if (!polygon.texture.loaded) return false;
    }

    return true;
  }

  get center() {
    return new Vector2(this.width / 2, this.height / 2);
  }

  static fromFile() {}

  toFile() {}

  addPolygon(polygon) {
    this.polygons.push(polygon);
    return polygon;
  }

  addLight(light) {
    this.lights.push(light);
  }
}

export { Level };
