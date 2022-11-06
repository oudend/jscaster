import { TextureLoader } from "../loaders/textureLoader.js";

class Polygon {
  constructor(points, height = 100) {
    if (points.length < 3)
      throw new Error("Invalid number of points, must be more than 2");

    this.points = points;

    this.height = height; //In the future maybe add support for height to each point so when computing the height will be blended between them.

    this.color = "red";

    this.textureLoader = undefined; //new TextureLoader("../assets/bricks.jpg");
  }

  addPoint(point) {
    this.points.push(point);
  }

  loadTexture(src) {
    this.textureLoader = new TextureLoader(src, this);
    return this;
  }

  get texture() {
    return this.textureLoader;
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
