import { Vector2 } from "../math/vector2.js";
import { degrees_to_radians, normalizeRadian } from "../utils.js";

class CanvasRenderer {
  //? no texture support.
  constructor(width = 100, height = 100, camera) {
    this.resolution = width;
    this.camera = camera;

    this.height = height;

    this.shading = undefined;

    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");

    this.ctx.imageSmoothingEnabled = false;

    this.canvas.width = this.resolution;
    this.canvas.height = this.height;

    this.verticalOffset = 0;

    this.floor = "grey";
    this.background = "orange";
    this.horizon = "white";

    this.rays = null;

    //this.columnAngle = camera.fov / this.resolution;

    //this.debugPoints = [];

    this.distanceToProjectionPlane =
      this.resolution / 2 / Math.tan(degrees_to_radians(this.camera.fov / 2));
    //this.angleBetweenRays = this.camera.fov / this.resolution;
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
    ground.addColorStop(1, this.horizon);

    const sky = this.ctx.createLinearGradient(0, this.canvas.height, 0, 0);
    sky.addColorStop(0, this.horizon);
    sky.addColorStop(1, this.background);

    this.ctx.fillStyle = ground;
    this.ctx.fillRect(
      0,
      this.projectionPlaneCenter,
      this.canvas.width,
      this.canvas.height - this.projectionPlaneCenter
    );

    this.ctx.fillStyle = sky;
    this.ctx.fillRect(0, 0, this.canvas.width, this.projectionPlaneCenter);
  }

  #getLightIntensity(lights, ray) {
    var intensity = 0;

    const normal = ray.normal;

    const color = [0, 0, 0];

    for (var light of lights) {
      const lightInfluence =
        (Math.abs(normal.degrees - light.direction) / 360) * light.intensity;

      intensity += lightInfluence;
    }

    for (light of lights) {
      // console.log(light.direction, normal.angle, (normal.angle-light.direction+540) % 360 - 180);
      // throw new Error("");

      var lightInfluence =
        (Math.abs(normal.degrees - light.direction) / 360) * light.intensity;

      // console.log(
      //   Math.abs(
      //     normalizeRadian(normal.radians) - normalizeRadian(light.direction)
      //   )
      // );

      // throw new Error("");

      // if (lightInfluence <= 0) {
      //   lightInfluence = 0;
      // }

      var influenceProportion = lightInfluence / intensity;

      if (!influenceProportion) influenceProportion = 0;

      // if (!influenceProportion) {
      //   console.log(influenceProportion, lightInfluence, influence);
      //   throw new Error("H");
      // }

      color[0] += light.color[0] * influenceProportion;
      color[1] += light.color[1] * influenceProportion;
      color[2] += light.color[2] * influenceProportion;
    }

    //console.log(color)

    intensity /= lights.length;

    const objectIntensity = 0.5;
    const multiplier = 70;

    //const intensity = (objectIntensity / ray.distance) * multiplier + influence;

    return { intensity: intensity, color: color };
  }

  #render(level, ray) {
    if (!ray.intersects) return; //contingency

    const polygon = ray.polygon;

    const x = ray.x;

    const distance = ray.distance; //  * degrees_to_radians(BETA); //ray.distance;

    const wallHeight =
      (polygon.height / distance / Math.cos(ray.angle)) *
      this.distanceToProjectionPlane;

    // const normal = ray.normal;

    // const lightIntensity = 0.7;

    // // console.log(normal, ray);

    // const lightInfluence = Math.abs(normal.angle - 90) * lightIntensity;

    // const objectIntensity = 0.5;
    // const multiplier = 70;

    // const intensity =
    //   (objectIntensity / distance) * multiplier + lightInfluence;

    var intensity = 0;
    var lightColor = [0, 0, 0];

    if (level.lights.length > 0) {
      const lightData = this.#getLightIntensity(level.lights, ray);

      intensity = lightData.intensity;
      lightColor = lightData.color;
    }

    // if (lightColor.length !== 3) {
    //   console.log(lightData);
    //   throw new Error("?");
    // }

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

      // var ratio = this.distanceToProjectionPlane / distance;

      this.ctx.drawImage(
        texture,
        textureX,
        0,
        1,
        textureHeight,
        x,
        this.projectionPlaneCenter - wallHeight / 2,
        1,
        wallHeight
      );

      // console.log(lightData);

      if (level.lights.length > 0) {
        this.ctx.fillStyle = `rgba(${lightColor[0]}, ${lightColor[1]}, ${
          lightColor[2]
        }, ${intensity / 2})`;

        this.ctx.fillRect(
          x,
          this.projectionPlaneCenter - wallHeight / 2,
          1,
          wallHeight //this.canvas.height - this.canvas.height * distanceFactor * 2
        );
      }

      return;
    }

    this.ctx.fillStyle = polygon.color.style;

    //console.log(polygon.color);

    this.ctx.fillRect(
      x,
      this.projectionPlaneCenter - wallHeight / 2,
      1,
      wallHeight //this.canvas.height - this.canvas.height * distanceFactor * 2
    );
  }

  render(level) {
    this.projectionPlaneCenter =
      this.height / 2 + (this.height / 2 / 90) * this.camera.verticalAngle;

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
