import { Vector2 } from "../math/vector2.js";

class CanvasRenderer {
  constructor(resolution = 100, camera) {
    this.resolution = resolution;
    this.camera = camera;

    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");

    this.ctx.imageSmoothingEnabled = false;

    this.canvas.width = resolution;

    this.floor = "grey";
    this.background = "orange";

    this.rays = null;

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

    this.rays = rays;

    //console.log(rays);

    this.#drawBase();

    for (var i = 0; i < /*this.resolution*/ rays.length; i += 1) {
      const ray = rays[i]; //TODO: this kind of information should ideally be returned by ray.js and just added by camera.js

      const x = ray.x;

      if (!ray.intersects) continue;

      const distance = ray.distance;

      const distanceFactor = distance / this.camera.far;

      const normal1 = ray.normals[0];

      // console.log(normal1.angle);
      // return;

      const directionVector = Vector2.fromAngle(ray.direction);

      const lightIntensity = 0.5;

      const lightInfluence = Math.abs(normal1.angle - 90) * lightIntensity;

      const objectIntensity = 1;
      const multiplier = 0.1;
      const intensity =
        (objectIntensity / distance) * multiplier + lightInfluence;

      const polygon = ray.polygon;

      const texture = polygon.texture;

      //console.log(texture);

      //console.log(ray);

      // console.log(normal1, directionVector, dotProduct);
      // return;

      // console.log(
      //   this.canvas.height * (1 - distanceFactor),
      //   this.canvas.height,
      //   distanceFactor ** 2,
      //   distanceFactor
      // );
      // return;

      //console.log(distanceFactor);

      //console.log(distance, this.camera, 1 - distance / this.camera.far);
      //return;

      // console.log(ray, x);
      // return;

      const wallHeight =
        this.canvas.height - this.canvas.height * distanceFactor;

      //const colorModifier = Math.cos(1 + distanceFactor ** 2);

      // console.log(colorModifier);
      // return;

      //const color = [0, 150, 0];
      const color = [100, 100, 100];

      color[0] -= intensity;
      color[1] -= intensity;
      color[2] -= intensity;

      // color[0] /= lightInfluence;
      // color[1] /= lightInfluence;
      // color[2] /= lightInfluence;

      //console.log(distanceFactor);

      this.ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
      this.ctx.fillRect(
        x,
        this.canvas.height / 2 - wallHeight / 2,
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
