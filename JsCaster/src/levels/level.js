import { Vector2 } from "../math/vector2.js";
import { LineSegment } from "../primitives/lineSegment.js";
import { Polygon } from "../primitives/polygon.js";
import { TextureLoader } from "../loaders/textureLoader.js";

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

    this.floorTextureScale = new Vector2(1, 1);
    this.ceilingTextureScale = new Vector2(1, 1);

    this.floorTexture = {};
    this.ceilingTexture = {};
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

  setFloorTexture(src, scale = new Vector2(1, 1)) {
    this.floorTexture = new TextureLoader(src);
    this.floorTextureScale = scale;
  }

  setCeilingTexture(src, scale = new Vector2(1, 1)) {
    this.ceilingTexture = new TextureLoader(src);
    this.ceilingTextureScale = scale;
  }

  addPolygon(polygon) {
    this.polygons.push(polygon);
    return polygon;
  }

  addLight(light) {
    this.lights.push(light);
  }
}

export { Level };
