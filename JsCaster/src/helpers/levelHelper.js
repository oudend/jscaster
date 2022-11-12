class LevelHelper {
  constructor(level, autoReload = false) {
    this.level = level;

    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");

    this.ctx.imageSmoothingEnabled = false;

    this.canvas.width = this.level.width;
    this.canvas.height = this.level.height;

    this.autoReload = autoReload;
    this.autoReloadRate = 1000;

    if (this.autoReload)
      setTimeout(this.#autoReload.bind(this), this.autoReloadRate);

    //document.body.appendChild(this.canvas); //! DEBUG ONLY
  }

  #autoReload() {
    this.render();
    if (this.autoReload && !this.level.texturesLoaded)
      setTimeout(this.#autoReload.bind(this), this.autoReloadRate);
  }

  // reload() {
  //   render();
  // }

  #drawPolygon(polygon) {
    //console.log(polygon);

    this.ctx.fillStyle = polygon.color ?? "red";
    this.ctx.strokeStyle = "black";

    if (polygon.texture && polygon.texture.loaded) {
      //console.log("drawing texture");

      //polygon.texture.img.re

      var pattern = this.ctx.createPattern(
        polygon.texture.textureImage,
        "repeat"
      );
      pattern.setTransform({ a: 0.25, d: 0.25 });
      this.ctx.fillStyle = pattern;
      //this.ctx.fill();
    }

    this.ctx.moveTo(polygon.points[0].x, polygon.points[0].y);
    this.ctx.beginPath();

    for (var i = 1; i < polygon.points.length; i++) {
      const point = polygon.points[i];

      this.ctx.lineTo(point.x, point.y);
    }

    this.ctx.lineTo(polygon.points[0].x, polygon.points[0].y);

    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
  }

  render() {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (var i = 0; i < this.level.polygons.length; i++) {
      const polygon = this.level.polygons[i];

      this.#drawPolygon(polygon);
    }
  }
} //should be able to render a level to a canvas

export { LevelHelper };
