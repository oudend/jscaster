import { imagedata_to_image } from "../utils.js";
import { Vector2 } from "../math/vector2.js";

/**
 * Class representing a texture.
 *
 * @class Texture
 * @typedef {Texture}
 */
class Texture {
  /**
   * Creates an instance of Texture.
   *
   * @constructor
   * @param {string} src - Source of the image.
   * @param {number} width - Width of the texture.
   * @param {number} height - Height of the texture.
   * @param {function} onload - Function to call when the texture is loaded, used internally by the textureLoader class.
   * @param {string} [repeat="no-repeat"] - Repeat argument used to determine whether or not a scaled texture should be repeated, default is "no-repeat".
   * @param {*} matrix - Matrix to be applied to image, used by TextureLoader class to scale and rotate the image.
   */
  constructor(src, width, height, onload, repeat = "no-repeat", matrix) {
    this.src = src;

    this.desiredWidth = width;
    this.desiredHeight = height;

    this.onload = onload;

    this.repeat = repeat;

    this.matrix = matrix;

    this.image = new Image();
    this.image.crossOrigin = "anonymous";
    this.image.src = this.src;
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.image.addEventListener("load", this.#onload.bind(this));

    this.loaded = false;
  }

  #onload() {
    this.width = this.desiredWidth ? this.desiredWidth : this.image.width;
    this.height = this.desiredHeight ? this.desiredHeight : this.image.width;

    this.width = ~~this.width;
    this.height = ~~this.height;

    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.ctx.drawImage(this.image, 0, 0, this.width, this.height);
    this.image.style.display = "none";

    var imagedata = this.ctx.getImageData(0, 0, this.width, this.height);

    this.loaded = true;
    // const img = imagedata_to_image(imagedata);

    this.pattern = this.ctx.createPattern(this.canvas, this.repeat);

    if (this.matrix) this.pattern.setTransform(this.matrix);

    this.ctx.clearRect(0, 0, this.width, this.height);

    this.ctx.fillStyle = this.pattern;
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.imagedata = this.ctx.getImageData(0, 0, this.width, this.height);

    this.image = imagedata_to_image(this.imagedata);

    if (this.onload)
      this.onload({ imagedata: this.imagedata, image: this.image });
  }
}

export { Texture };
