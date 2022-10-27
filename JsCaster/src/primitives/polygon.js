import { TextureLoader } from "../loaders/textureLoader.js";

class Polygon {
  constructor(points) {
    if (points.length < 3)
      throw new Error("Invalid number of points, must be more than 2");

    this.points = points;

    this.testLoader = new TextureLoader("../assets/bricks.jpg");
  }

  loadTexture(loader) {}

  get texture() {
    return this.testLoader;
  }

  static fromLineSegments(segments) {
    const points = [];

    for (var i = 0; i < segments.length; i++) {
      points.push(segments[i].start);

      return segments;
    }
  }
}

export { Polygon };
