import { Vector2 } from "../math/vector2.js";
import { degrees_to_radians } from "../utils.js";

class CanvasRenderer {
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

    console.log(
      this.distanceToProjectionPlane,
      this.angleBetweenRays,
      this.resolution,
      "?"
    );

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

  render(level) {
    const rays = this.camera.castRays(level, this.resolution);

    this.debugPoints = [];

    this.rays = rays;

    //console.log(rays);

    this.#drawBase();

    for (var i = 0; i < /*this.resolution*/ rays.length; i += 1) {
      const ray = rays[i]; //TODO: this kind of information should ideally be returned by ray.js and just added by camera.js

      if (!ray.intersects) continue;

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

      const texture = polygon.texture;

      // const wallHeight =
      //   this.canvas.height - this.canvas.height * distanceFactor;

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

      // console.log(ray);
      // return;
    }

    //console.log(rays);

    //shoot (resolution) amount of rays.
  }
}

export { CanvasRenderer };
