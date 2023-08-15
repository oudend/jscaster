import { LevelHelper } from "./levelHelper.js";
import { Vector2 } from "../math/vector2.js";

/**
 * A class for debugging the renderer with a top down view.
 *
 * @class RendererHelper
 * @typedef {RendererHelper}
 */
class RendererHelper {
  /**
   * Creates an instance of RendererHelper.
   *
   * @constructor
   * @param {*} renderer - The renderer to debug.
   * @param {*} level - The level to debug.
   * @param {*} autoReloadTextures - Whether to automatically reload when textures get loaded.
   */
  constructor(renderer, level, autoReloadTextures, debugGrid) {
    this.renderer = renderer;

    this.camera = this.renderer.camera;
    this.level = level;

    this.debugGrid = debugGrid;

    this.levelHelper = new LevelHelper(this.level, autoReloadTextures);

    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");

    this.ctx.imageSmoothingEnabled = false;

    this.canvas.width = this.level.width;
    this.canvas.height = this.level.height;

    document.body.appendChild(this.canvas); //! DEBUG ONLY

    this.levelHelper.render();
  }

  /**
   * Updates the view.
   */
  render() {
    this.ctx.drawImage(this.levelHelper.canvas, 0, 0);

    if (!this.renderer.rays) return;

    this.ctx.strokeStyle = "white";
    this.ctx.lineWidth = 1;

    this.ctx.beginPath();
    for (var i = 0; i < this.renderer.rays.length; i++) {
      const ray = this.renderer.rays[i];

      let start = ray.ray.lineSegment.start;
      let end = ray.ray.lineSegment.end;

      if (ray.intersects) {
        end = ray.hit;

        this.ctx.fillStyle = "rgba(0, 255, 0, 0.6)";
        this.ctx.moveTo(end.x, end.y);
        this.ctx.arc(end.x, end.y, 6, 0, 2 * Math.PI, false);
      }

      this.ctx.moveTo(start.x, start.y);
      this.ctx.lineTo(end.x, end.y);
    }

    this.ctx.closePath();
    this.ctx.stroke();

    this.ctx.fillStyle = "red";

    //console.log(this.camera.intersectionPoints[0])

    //this.ctx.beginPath();

    //!const points = [...this.level.debug, ...this.camera.intersectionPoints];

    if (!this.debugGrid) return;

    const points = this.camera.intersectionPoints;

    //return;

    for (var i = 0; i < points.length; i++) {
      const point = points[i];
      this.ctx.fillStyle = "red";

      if (i % 2 == 1) this.ctx.fillStyle = "blue";
      //console.log(point);
      //debugger;
      this.ctx.beginPath();
      this.ctx.arc(point.x, point.y, 10, 0, 2 * Math.PI, false);
      this.ctx.closePath();
      this.ctx.fill();
    }

    // this.ctx.arc(
    //   this.camera.intersectionPoints[0].x,
    //   this.camera.intersectionPoints[0].y,
    //   100,
    //   0,
    //   2 * Math.PI,
    //   false
    // );
    // this.ctx.fill();
    // this.ctx.closePath();

    // const start = this.camera.angle - this.camera.fov / 2;
    // const end = this.camera.angle + this.camera.fov / 2;

    // const increment = (end - start) / this.renderer.resolution;

    // this.ctx.strokeStyle = "white";
    // this.ctx.lineWidth = 1;

    // for (var i = 0; i < this.renderer.resolution; i++) {
    //   const direction = start + increment * i;

    //   const ray = new Ray(this.camera.position, direction, this.far);

    //   this.ctx.beginPath();
    //   this.ctx.moveTo(ray.lineSegment.start.x, ray.lineSegment.start.y);
    //   this.ctx.lineTo(ray.lineSegment.end.x, ray.lineSegment.end.y);
    //   this.ctx.stroke();
    // }
  }
}

export { RendererHelper };
