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
    repeat = "no-repeat",
    scale = new Vector2(1, 1),
    transform = new Vector2(0, 0),
    angle = 0,
    onload
  ) {
    this.src = src;
    this.onloads = onload !== undefined ? [onload] : [];
    // this.polygon = polygon;

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

  static fromTexture() {}

  listen(func) {
    this.onloads.push(func);
  }

  #onload(data) {
    this.textureImage = data.imagedata;

    this.data = data;

    this.loaded = true;

    for (var onload of this.onloads) onload(data, this.textureImage);
  }
}

export { TextureLoader };
