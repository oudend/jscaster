import { Vector2 } from "../math/vector2.js";
import { LineSegment } from "../primitives/lineSegment.js";
import { Polygon } from "../primitives/polygon.js";
import { TextureLoader } from "../loaders/textureLoader.js";

/**
 * Class that represents a level.
 *
 * @class Level
 * @typedef {Level}
 */
class Level {
  /**
   * Creates an instance of Level.
   *
   * @constructor
   * @param {number} width - Width of the level in 2d space.
   * @param {number} height - Height of the level in 2d space.
   * @param {number} [ceilingHeight=100] - Height of the level in "3d" space.
   */
  constructor(width, height, ceilingHeight = 100) {
    this.width = width;
    this.height = height;
    this.ceilingHeight = ceilingHeight;

    this.polygons = [];
    this.sprites = [];
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

  /**
   * Returns whether or not the textures in the polygons of the level are fully loaded.
   *
   * @readonly
   * @type {boolean}
   */
  get texturesLoaded() {
    // console.log("hello");

    for (var polygon of this.polygons) {
      if (!polygon.texture) continue;
      if (!polygon.texture.loaded) return false;
    }

    return true;
  }

  /**
   * Returns center of the level.
   *
   * @readonly
   * @type {Vector2}
   */
  get center() {
    return new Vector2(this.width / 2, this.height / 2);
  }

  static fromFile() {}

  toFile() {}

  /**
   * Sets the floor texture of the level. If ignored no floor texture will be set.
   *
   * @param {string} src - Source of the image.
   * @param {Vector2} [scale=new Vector2(1, 1)] - Scale of the texture.
   */
  setFloorTexture(src, scale = new Vector2(1, 1)) {
    this.floorTexture = new TextureLoader(src);
    this.floorTextureScale = scale;
  }

  /**
   * Sets the ceiling texture of the level. If ignored no floor texture will be set.
   *
   * @param {*} src - Source of the image.
   * @param {*} [scale=new Vector2(1, 1)] - Scale of the texture.
   */
  setCeilingTexture(src, scale = new Vector2(1, 1)) {
    this.ceilingTexture = new TextureLoader(src);
    this.ceilingTextureScale = scale;
  }

  /**
   * Adds polygon to the level.
   *
   * @param {Polygon} polygon - Polygon to add.
   * @returns {Polygon}
   */
  addPolygon(polygon) {
    this.polygons.push(polygon);
    return polygon;
  }

  addSprite(sprite) {
    this.sprites.push(sprite);
    return sprite;
  }

  /**
   * Adds light to the level.
   *
   * @param {*} light - The light to add. Currently only supports DirectionalLight.
   */
  addLight(light) {
    this.lights.push(light);
    return light;
  }
}

export { Level };
