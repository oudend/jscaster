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

    this.texturesX = texturesX;
    this.texturesY = texturesY;

    this.loadedTextures = 0;
    this.textureLimit = texturesX * texturesY;

    this.canvas = document.createElement("canvas");
    this.canvas.width = size * texturesX;
    this.canvas.height = size * texturesY;
    this.ctx = this.canvas.getContext("2d");

    for (var source of this.sources) {
      this.addSource(source, this.#onload.bind(this));
      //this.textures.push(new Texture(source, size, size, this.#onload.bind(this)));
    }
  }

  get texture() {
    return this.canvas;
  }

  //? figure out how to trigger the onload
  addSource(source, onload) {
    if (this.loadedTextures >= this.textureLimit) {
      throw new Error("TextureAtlas is full");
    }

    this.textures.push(new Texture(source, this.size, this.size, onload));
  }

  //? combines multiple texture atlases into one. The texture atlases must have the same size.
  static combineTextureAtlases(
    textureAtlases,
    overrideTextureX = undefined,
    overrideTextureY = undefined
  ) {}

  //? create a TextureAtlas class and extract textures from the atlas based on the size of the individual textures and the distance between each texture within in x and y space.
  static fromTexture(src, size, offset = new Vector2(0, 0)) {
    const sources = [];
  }

  #onload(texture) {
    const textureX = this.loadedTextures % this.texturesX;
    const textureY = Math.floor(this.loadedTextures / this.texturesX);

    //  console.log(textureX, textureY, this.loadedTextures);

    //console.log(textureX, textureY);

    this.#writeTextureToAtlas(
      texture,
      Math.floor(textureX) * this.size,
      Math.floor(textureY) * this.size
    );

    if (this.loadedTextures + 1 >= this.sources.length) {
      this.onload(this.canvas);
    }

    this.loadedTextures++;
  }

  #writeTextureToAtlas(texture, x, y) {
    // const image = imagedata_to_image(texture.imageData);
    //console.log(texture, x, y);
    //console.log("image drawn", texture, x, y);

    //console.log(texture, "gotta draw", x, y);

    this.ctx.putImageData(texture.imagedata, x, y);

    //this.ctx.drawImage(texture, x, y);

    //this.ctx.fillRect(x, y, this.size, this.size);
  }
}

export { TextureAtlas };
