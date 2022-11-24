import { LevelHelper } from "./levelHelper.js";
import { Vector2 } from "../math/vector2.js";

class RendererHelper {
  constructor(renderer, level, autoReloadTextures) {
    this.renderer = renderer;

    this.camera = this.renderer.camera;
    this.level = level;

    this.levelHelper = new LevelHelper(this.level, autoReloadTextures);

    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");

    this.ctx.imageSmoothingEnabled = false;

    this.canvas.width = this.level.width;
    this.canvas.height = this.level.height;

    document.body.appendChild(this.canvas); //! DEBUG ONLY

    this.levelHelper.render();
  }

  render() {
    this.ctx.drawImage(this.levelHelper.canvas, 0, 0);

    this.ctx.fillStyle = "orange";

    //Draw Camera
    this.ctx.beginPath();
    this.ctx.arc(
      this.camera.position.x,
      this.camera.position.y,
      5,
      0,
      2 * Math.PI
    );
    this.ctx.fill();

    const cameraRadians = this.camera.angle * (Math.PI / 180);

    const cameraLeftBoundaryRadians = //TODO
      (this.camera.angle - this.camera.fov / 2) * (Math.PI / 180);

    const cameraRightBoundaryRadians =
      (this.camera.angle + this.camera.fov / 2) * (Math.PI / 180);

    const forwardVector = Vector2.multiply(
      Vector2.fromAngle(cameraRadians),
      new Vector2(30, 30)
    );

    const leftBoundaryVector = Vector2.multiply(
      Vector2.fromAngle(cameraLeftBoundaryRadians),
      new Vector2(this.camera.far, this.camera.far)
    );

    const rightBoundaryVector = Vector2.multiply(
      Vector2.fromAngle(cameraRightBoundaryRadians),
      new Vector2(this.camera.far, this.camera.far)
    );

    //console.log(cameraRightBoundaryRadians)

    // console.log(radians);
    // return;

    const finalVector = Vector2.add(this.camera.position, forwardVector);
    const finalVector2 = Vector2.add(this.camera.position, leftBoundaryVector);
    const finalVector3 = Vector2.add(this.camera.position, rightBoundaryVector);

    this.ctx.strokeStyle = "red";
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(this.camera.position.x, this.camera.position.y);
    this.ctx.lineTo(finalVector.x, finalVector.y);
    this.ctx.stroke();

    this.ctx.strokeStyle = "green";
    this.ctx.beginPath();
    this.ctx.moveTo(this.camera.position.x, this.camera.position.y);
    this.ctx.lineTo(finalVector2.x, finalVector2.y);

    this.ctx.moveTo(this.camera.position.x, this.camera.position.y);
    this.ctx.lineTo(finalVector3.x, finalVector3.y);
    this.ctx.stroke();

    //console.log(finalVector3)

    //console.log(facingVector);
    //Draw Camera

    if (!this.renderer.rays) return;

    this.ctx.strokeStyle = "white";
    this.ctx.lineWidth = 1;
    for (var i = 0; i < this.renderer.rays.length; i++) {
      const ray = this.renderer.rays[i];

      const start = ray.ray.lineSegment.start;
      var end = ray.ray.lineSegment.end;

      if (ray.intersects) end = ray.hit;

      this.ctx.beginPath();
      this.ctx.moveTo(start.x, start.y);
      this.ctx.lineTo(end.x, end.y);
      this.ctx.stroke();
    }

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
