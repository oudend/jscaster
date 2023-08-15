import { Vector2 } from "../math/vector2.js";
import { TextureAtlas } from "../primitives/textureAtlas.js";
import { LineSegment } from "../primitives/lineSegment.js";
import { Texture } from "../primitives/texture.js";
import { imagedata_to_image } from "../utils.js";

/**
 * Class for loading textures.
 *
 * @class TextureAtlasLoader
 * @typedef {TextureAtlasLoader}
 */
class TextureAtlasLoader {
  /**
   * Creates an instance of TextureAtlasLoader.
   *
   * @constructor
   * @param {[String]} sources
   * @param {*} size
   * @param {*} texturesX
   * @param {*} texturesY
   * @param {*} onload
   */
  constructor(sources, size, texturesX, texturesY, onload) {
    this.textureAtlas = new TextureAtlas(
      sources,
      size,
      texturesX,
      texturesY,
      this.#onload.bind(this)
    );

    this.textureImage = null;

    this.crops = [];

    this.onloads = onload !== undefined ? [onload] : [];

    this.data = null;

    this.loaded = false;
  }

  listen(func) {
    this.onloads.push(func);
  }

  #onload(data) {
    this.textureImage = data.imagedata;
    this.crops = this.textureAtlas.crops;
    this.loaded = true;

    this.data = data;

    for (var onload of this.onloads) onload(data, this.textureImage);
  }
}

export { TextureAtlasLoader };
