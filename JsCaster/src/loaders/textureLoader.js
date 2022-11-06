import { LineSegment } from "../primitives/lineSegment.js";

class TextureLoader {
  //! PREPROCESS COLUMNS FOR EXTRA SPEED MAYBE?
  //? Make sure they work first though.
  constructor(src, polygon) {
    this.img = new Image();
    this.img.crossOrigin = "anonymous";
    this.src = this.img.src = src;
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.img.addEventListener("load", this.onload.bind(this));

    //this.segments = LineSegment.PolygonToLineSegments(polygon);

    //! The TextureLoader maybe shouldn't take care of line segments and texture rendering shit, I think you should make a new class for that perhaps.

    this.data = null;

    this.loaded = false;
  }

  //   get data() {
  //     return this.ctx.getImageData(0, 0, this.img.width, this.img.height);
  //   }

  getColumn(index) {
    //get the column at index

    var column = [];

    if (index < 0 || index > this.img.width)
      throw new Error("index out of bounds");

    for (let i = index, l = data.length - index; i < l; i += this.img.width) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      column.push([r, g, b, a]);
    }

    return column;
  }

  onload() {
    //console.log("loaded");

    this.ctx.drawImage(this.img, 0, 0);
    this.img.style.display = "none";

    this.data = this.ctx.getImageData(0, 0, this.img.width, this.img.height);

    this.loaded = true;
  }
}

export { TextureLoader };
