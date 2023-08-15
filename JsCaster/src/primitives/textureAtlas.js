import { imagedata_to_image } from "../utils.js";
import { Vector2 } from "../math/vector2.js";
import { Texture } from "./texture.js";

/**
 * Class representing a texture atlas.
 *
 * @class TextureAtlas
 * @typedef {TextureAtlas}
 */
class TextureAtlas {
  /**
   * Creates an instance of TextureAtlas.
   *
   * @constructor
   * @param {string} sources - Image sources for the texture atlas.
   * @param {number} size - Width and height of each texture in the atlas.
   * @param {number} texturesX - Determines the width of the texture atlas's texture and gets converted to a multiple of size.
   * @param {number} texturesY - Determines the height of the texture atlas's texture and gets converted to a multiple of size.
   * @param {function} onload - Function to call when the texture atlas is initially loaded, will not retrigger when a new texture is added.
   */
  constructor(sources, size, texturesX, texturesY, onload) {
    this.sources = sources;

    this.size = size;

    this.onload = onload;

    this.textures = [];

    this.crops = [];

    this.texturesX = texturesX;
    this.texturesY = texturesY;

    this.loadedTextures = 0;
    this.textureLimit = texturesX * texturesY;

    this.canvas = document.createElement("canvas");
    this.canvas.width = size * texturesX;
    this.canvas.height = size * texturesY;
    this.ctx = this.canvas.getContext("2d");

    // for (var source of this.sources) {
    //   this.addSource(source, this.#onload.bind(this));
    // }

    for (let index = 0; index < this.sources.length; index++) {
      let source = this.sources[index];
      this.addSource(source, this.#onload.bind(this, index));
    }
  }

  get texture() {
    return this.canvas;
  }

  addSource(source, onload) {
    if (this.loadedTextures >= this.textureLimit) {
      throw new Error("TextureAtlas is full");
    }

    this.textures.push(new Texture(source, this.size, this.size, onload));
  }

  //? combines multiple texture atlases into one. The texture atlases must have the same size.
  static combineTextureAtlases(
    textureAtlases,
    overrideTextureX = 4,
    overrideTextureY = 3,
    onload
  ) {
    const size = textureAtlases[0].size;
    const sources = textureAtlases[0].sources;

    var textureX = overrideTextureX || textureAtlases[0].texturesX;
    var textureY = overrideTextureY || textureAtlases[0].texturesY;

    for (var i = 1; i < textureAtlases.length; i++) {
      if (textureAtlases[i].size !== size) {
        throw new Error("TextureAtlas sizes do not match");
      }

      sources.push(...textureAtlases[i].sources);

      if (!overrideTextureX) textureX += textureAtlases[i].texturesX;
      if (!overrideTextureY) textureY += textureAtlases[i].texturesY;
    }

    const textureAtlas = new TextureAtlas(
      sources,
      size,
      textureX,
      textureY,
      onload
    );

    return textureAtlas;
  }

  //? create a TextureAtlas class and extract textures from the atlas based on the size of the individual textures and the distance between each texture within in x and y space.
  static fromTexture(src, size, offset = new Vector2(0, 0)) {
    const sources = [];
    const texture = new Texture(src, size, size);
  }

  #onload(index, texture) {
    const textureX = this.loadedTextures % this.texturesX;
    const textureY = Math.floor(this.loadedTextures / this.texturesX);

    this.crops[index] = [
      new Vector2(
        Math.floor(textureX) * this.size,
        Math.floor(textureY) * this.size
      ),
      new Vector2(this.size, this.size),
    ];

    this.#writeTextureToAtlas(
      texture,
      Math.floor(textureX) * this.size,
      Math.floor(textureY) * this.size
    );

    if (this.loadedTextures + 1 >= this.sources.length && this.onload) {
      this.imagedata = this.ctx.getImageData(
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
      this.onload({
        imagedata: this.imagedata,
        canvas: this.canvas,
      });
    }

    this.loadedTextures++;
  }

  #writeTextureToAtlas(texture, x, y) {
    this.ctx.putImageData(texture.imagedata, x, y);
  }
}

export { TextureAtlas };
