import { Vector2 } from "../jscaster.js";
import { LineSegment } from "../primitives/lineSegment.js";
import { Texture } from "../primitives/texture.js";
import { imagedata_to_image } from "../utils.js";

/**
 * Class for loading textures.
 *
 * @class TextureLoader
 * @typedef {TextureLoader}
 */
class TextureLoader {
  /**
   * Creates an instance of TextureLoader.
   *
   * @constructor
   * @param {string} src - The image source.
   * @param {boolean} [transparent=false] - Whether or not the texture is transparent.
   * @param {boolean} [scaleToFit=true] - Whether or not to scale the texture to fit each side of the polygon.
   * @param {boolean} [wrap=false] - Whether or not the texture should be wrapped around the polygon.
   * @param {string} [repeat="no-repeat"] - How the texture should repeat.
   * @param {Vector2} [scale=new Vector2(1, 1)] - Scale of the texture.
   * @param {Vector2} [transform=new Vector2(0, 0)] - Transform of the texture.
   * @param {number} [angle=0] - Angle of rotation for the texture.
   */
  constructor(
    src,
    // polygon,
    transparent = false,
    scaleToFit = true,
    wrap = false,
    repeat = "no-repeat",
    scale = new Vector2(1, 1),
    transform = new Vector2(0, 0),
    angle = 0
  ) {
    this.src = src;
    this.scaleToFit = scaleToFit;
    this.wrap = wrap;
    // this.polygon = polygon;

    this.transparent = transparent;

    this.textureImage = undefined;
    this.texture = new Texture(
      this.src,
      undefined,
      undefined,
      this.#onload.bind(this),
      repeat,
      new DOMMatrix([
        Math.cos(angle) * scale.x,
        Math.sin(angle) * scale.x,
        -Math.sin(angle) * scale.y,
        Math.cos(angle) * scale.y,
        transform.x,
        transform.y,
      ])
    );

    this.data = null;

    this.loaded = false;
  }

  #onload(data) {
    this.textureImage = data.image;

    this.loaded = true;
  }
}

export { TextureLoader };
