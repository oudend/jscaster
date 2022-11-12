import { Vector2 } from "../math/vector2.js";
import { degrees_to_radians } from "../utils.js";

class CanvasRenderer {
  //? no texture support.
  constructor(width = 100, height = 100, camera) {
    this.resolution = width;
    this.camera = camera;

    this.height = height;

    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");

    this.ctx.imageSmoothingEnabled = false;

    this.canvas.width = this.resolution;
    this.canvas.height = this.height;

    this.floor = "grey";
    this.background = "orange";

    this.rays = null;

    this.columnAngle = camera.fov / this.resolution;

    this.debugPoints = [];

    this.distanceToProjectionPlane =
      this.resolution / 2 / Math.tan(degrees_to_radians(this.camera.fov / 2));

    this.angleBetweenRays = this.camera.fov / this.resolution;

    // console.log(
    //   this.distanceToProjectionPlane,
    //   this.angleBetweenRays,
    //   this.resolution,
    //   "?"
    // );

    // domElement.appendChild(this.canvas);
  }

  set dom(domElement) {
    domElement.appendChild(this.canvas);

    this.domElement = domElement;
  }

  get dom() {
    return this.domElement;
  }

  #drawBase() {
    const ground = this.ctx.createLinearGradient(0, this.canvas.height, 0, 0);
    ground.addColorStop(0, this.floor);
    ground.addColorStop(1, "white");

    const sky = this.ctx.createLinearGradient(0, this.canvas.height, 0, 0);
    sky.addColorStop(0, "white");
    sky.addColorStop(1, this.background);

    this.ctx.fillStyle = ground;
    this.ctx.fillRect(
      0,
      this.canvas.height / 2,
      this.canvas.width,
      this.canvas.height / 2
    );

    this.ctx.fillStyle = sky;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height / 2);
  }

  #render(level, ray) {
    //const ray = rays[i]; //TODO: this kind of information should ideally be returned by ray.js and just added by camera.js

    //console.log(ray.lineSegment)

    // return;

    if (!ray.intersects) return; //contingency

    const polygon = ray.polygon;

    const x = ray.x;

    //var BETA = ray.angle; // - this.camera.fov / 2; //this.camera.fov / 2;

    const distance = ray.distance; //  * degrees_to_radians(BETA); //ray.distance;

    const wallHeight =
      (polygon.height / distance / Math.cos(ray.angle)) *
      this.distanceToProjectionPlane;

    // const wallHeight =
    //   (polygon.height * this.distanceToProjectionPlane) / distance;

    // const distanceFactor = distance / this.camera.far;

    const normal1 = ray.normals[0];

    const lightIntensity = 0.5;

    const lightInfluence = Math.abs(normal1.angle - 90) * lightIntensity;

    const objectIntensity = 1;
    const multiplier = 0.1;
    const intensity =
      (objectIntensity / distance) * multiplier + lightInfluence;

    if (polygon.texture && polygon.texture.loaded) {
      var point = Math.floor(Vector2.distance(ray.lineSegment.start, ray.hit));

      const texture = polygon.texture.textureImage;

      if (polygon.texture.wrap) {
        const offset =
          ray.lineSegment.index > 0
            ? polygon.segmentOffsets[ray.lineSegment.index - 1]
            : 0;

        point = offset + point;
      }

      var textureX = point;

      var textureHeight = polygon.height;

      if (polygon.texture.scaleToFit) {
        const length = polygon.texture.wrap
          ? polygon.totalLength
          : ray.lineSegment.length;

        textureX = (texture.width / length) * point;
        textureHeight = texture.height;
      }

      this.ctx.drawImage(
        texture,
        textureX,
        0,
        1,
        textureHeight,
        x,
        this.height / 2 - wallHeight / 2,
        1,
        wallHeight
      );

      // this.ctx.fillStyle = `rgba(0, 0, 0, ${intensity / 255})`;
      // this.ctx.fillRect(
      //   x,
      //   this.height / 2 - wallHeight / 2,
      //   1,
      //   wallHeight //this.canvas.height - this.canvas.height * distanceFactor * 2
      // );

      return;
    }

    const color = [100, 100, 100];

    color[0] -= intensity;
    color[1] -= intensity;
    color[2] -= intensity;

    this.ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    this.ctx.fillRect(
      x,
      this.height / 2 - wallHeight / 2,
      1,
      wallHeight //this.canvas.height - this.canvas.height * distanceFactor * 2
    );
  }

  render(level) {
    this.#drawBase();

    this.textureWraps = {};

    const rays = this.camera.castRays(
      level,
      this.resolution,
      this.#render.bind(this)
    );

    this.rays = rays;
  }
}

export { CanvasRenderer };
