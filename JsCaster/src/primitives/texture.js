import { imagedata_to_image } from "../utils.js";
import { Vector2 } from "../math/vector2.js";

class Texture {
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
    //this.ctx.imageSmoothingEnabled = false;
    this.image.addEventListener("load", this.#onload.bind(this));

    this.loaded = false;
  }

  // column(x) {
  //   var column = [];

  //   //console.log(this.loaded);

  //   if (x < 0 || x > this.width) throw new Error("index out of bounds");

  //   for (let i = x, l = this.data.length - x; i < l; i += this.width) {
  //     const r = this.data[i];
  //     const g = this.data[i + 1];
  //     const b = this.data[i + 2];
  //     const a = this.data[i + 3];

  //     column.push([r, g, b, a]);
  //   }

  //   return column;
  // }

  #onload() {
    //! use ctx.drawPattern maybe to get repeat?
    this.width = this.desiredWidth ? this.desiredWidth : this.image.width;
    this.height = this.desiredHeight ? this.desiredHeight : this.image.width;

    this.width = ~~this.width;
    this.height = ~~this.height;

    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.ctx.drawImage(this.image, 0, 0, this.width, this.height);
    this.image.style.display = "none";

    var imagedata = this.ctx.getImageData(0, 0, this.width, this.height);

    // this.data = imagedata.data;

    this.loaded = true;

    //console.log(this.data)

    //console.log(imagedata_to_image(imagedata));
    const img = imagedata_to_image(imagedata);

    const pattern = this.ctx.createPattern(this.canvas, this.repeat);
    // console.log(pattern);

    if (this.matrix) pattern.setTransform(this.matrix);

    this.ctx.clearRect(0, 0, this.width, this.height);

    this.ctx.fillStyle = pattern;
    this.ctx.fillRect(0, 0, this.width, this.height);

    imagedata = this.ctx.getImageData(0, 0, this.width, this.height);

    this.image = imagedata_to_image(imagedata);

    if (this.onload) this.onload(this.image); //this.image);

    // console.log("loaded successfully");
    // console.log(this.column(1), this.width, this.height, this.height * 4);
  }
}

export { Texture };
