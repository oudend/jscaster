class LevelHelper {
  constructor(level) {
    this.level = level;

    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");

    this.ctx.imageSmoothingEnabled = false;

    this.canvas.width = this.level.width;
    this.canvas.height = this.level.height;

    //document.body.appendChild(this.canvas); //! DEBUG ONLY
  }

  #drawPolygon(polygon) {
    this.ctx.fillStyle = polygon.color ?? "red";
    this.ctx.strokeStyle = "black";

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
