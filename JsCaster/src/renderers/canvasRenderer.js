import { Vector2 } from "../math/vector2.js";
import { Color } from "../primitives/color.js";
import { Texture } from "../primitives/texture.js";
import { degrees_to_radians } from "../utils.js";

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

    this.floor = "grey";
    this.background = "orange";
    this.horizon = "white";

    this.rays = null;

    this.floorOffset = 100;

    //this.columnAngle = camera.fov / this.resolution;

    //this.debugPoints = [];

    this.distanceToProjectionPlane =
      this.resolution / 2 / Math.tan(degrees_to_radians(this.camera.fov / 2));
    //this.angleBetweenRays = this.camera.fov / this.resolution;

    this.floorTexture = new Texture(
      "../assets/bricks.jpg",
      undefined,
      undefined,
      undefined,
      "repeat"
    );

    this.ceilingTexture = new Texture(
      "../assets/bricks2.jpg",
      undefined,
      undefined,
      undefined,
      "repeat"
    );

    this.baseCanvas = document.createElement("canvas");

    this.baseCanvas.width = this.resolution;
    this.baseCanvas.height = this.height;

    this.baseCtx = this.baseCanvas.getContext("2d");
  }

  set dom(domElement) {
    domElement.appendChild(this.canvas);

    this.domElement = domElement;
  }

  get dom() {
    return this.domElement;
  }

  #drawBase() {
    var ground = this.ctx.createLinearGradient(
      0,
      this.canvas.height + this.projectionPlaneCenter,
      0,
      this.projectionPlaneCenter
    );
    ground.addColorStop(1, this.horizon);
    ground.addColorStop(0, this.floor);

    const sky = this.ctx.createLinearGradient(
      0,
      this.projectionPlaneCenter,
      0,
      0
    );
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

    const color = new Color(0, 0, 0);

    for (var light of lights) {
      const lightInfluence =
        (Math.abs(normal.degrees - light.direction) / 360) * light.intensity;

      intensity += lightInfluence;
    }

    for (light of lights) {
      var lightInfluence =
        (Math.abs(normal.degrees - light.direction) / 360) * light.intensity;

      var influenceProportion = lightInfluence / intensity;

      if (!influenceProportion) influenceProportion = 0;

      color.r += light.color.r * influenceProportion;
      color.g += light.color.g * influenceProportion;
      color.b += light.color.b * influenceProportion;
    }

    intensity /= lights.length;

    return { intensity: intensity, color: color };
  }

  #drawTexturedWall() {}

  #drawWall() {}

  #render(level, ray) {
    if (!ray.intersects) return; //contingency

    const polygon = ray.polygon;

    const x = ray.x;

    const distance = ray.distance; //  * degrees_to_radians(BETA); //ray.distance;

    const wallHeight =
      (polygon.height / distance / Math.cos(ray.angle)) *
      this.distanceToProjectionPlane;

    const offsetHeight =
      (this.floorOffset / distance / Math.cos(ray.angle)) *
      this.distanceToProjectionPlane;

    var intensity = undefined;
    var lightColor = undefined;

    if (level.lights.length > 0) {
      const lightData = this.#getLightIntensity(level.lights, ray);

      intensity = lightData.intensity;
      lightColor = lightData.color;
    }

    if (
      this.floorTexture?.loaded &&
      this.ceilingTexture?.loaded &&
      ray.closest
    ) {
      //!!!!

      var lastBottomOfWall = Math.floor(
        this.projectionPlaneCenter + offsetHeight / 2
      );

      var floorIterations = this.canvas.height - lastBottomOfWall;

      var lastTopOfWall = Math.floor(
        this.projectionPlaneCenter + offsetHeight / 2 - wallHeight //this.projectionPlaneCenter - offsetHeight / 2
      );

      //var floorIterations = lastTopOfWall

      //? floor and ceiling casting
      for (var row = 0; row < Math.max(floorIterations, lastTopOfWall); row++) {
        var floorRow = lastBottomOfWall + row;
        var ceilingRow = lastTopOfWall - row;

        var floorRatio =
          this.floorOffset /
          (Math.max(floorRow, ceilingRow) - this.projectionPlaneCenter);

        var ceilingRatio =
          (level.ceilingHeight * 2 - this.floorOffset) /
          (this.projectionPlaneCenter - ceilingRow); //TODO: replace 200 with the actual height

        var floorDiagonalDistance = Math.floor(
          this.distanceToProjectionPlane *
            floorRatio *
            (1.0 / Math.cos(ray.angle))
        );

        // console.log(
        //   floorDiagonalDistance,
        //   this.distanceToProjectionPlane,
        //   floorRatio,
        //   1.0 / Math.cos(ray.angle)
        // );
        // debugger;

        var ceilingDiagonalDistance = Math.floor(
          this.distanceToProjectionPlane *
            ceilingRatio *
            (1.0 / Math.cos(ray.angle))
        );

        var floorYEnd = Math.floor(
          floorDiagonalDistance * Math.sin(degrees_to_radians(ray.finalangle))
        );
        var floorXEnd = Math.floor(
          floorDiagonalDistance * Math.cos(degrees_to_radians(ray.finalangle))
        );
        floorXEnd += this.camera.position.x * 2;
        floorYEnd += this.camera.position.y * 2;

        var ceilingYEnd = Math.floor(
          ceilingDiagonalDistance * Math.sin(degrees_to_radians(ray.finalangle))
        );
        var ceilingXEnd = Math.floor(
          ceilingDiagonalDistance * Math.cos(degrees_to_radians(ray.finalangle))
        );
        ceilingXEnd += this.camera.position.x * 2;
        ceilingYEnd += this.camera.position.y * 2;

        // Find offset of tile and column in texture
        var floorTileRow = Math.floor(
          Math.abs(floorYEnd) % this.floorTexture.height
        ); //this.floorTexture.height); //TODO: replace 64 with tile_size variable
        var floorTileColumn = Math.floor(
          Math.abs(floorXEnd) % this.floorTexture.width
        ); //% this.floorTexture.width);
        // Pixel to draw

        var ceilingTileRow = Math.floor(
          Math.abs(ceilingYEnd) % this.floorTexture.height
        ); //this.floorTexture.height); //TODO: replace 64 with tile_size variable
        var ceilingTileColumn = Math.floor(
          Math.abs(ceilingXEnd) % this.floorTexture.width
        ); //% this.floorTexture.width);
        // Pixel to draw

        //? floor
        if (floorRow <= this.height) {
          this.baseSprite.data[floorRow * 4 * this.canvas.width + x * 4] =
            this.floorTexture.imagedata.data[
              floorTileRow * 4 * this.floorTexture.height + floorTileColumn * 4
            ];
          this.baseSprite.data[floorRow * 4 * this.canvas.width + x * 4 + 1] =
            this.floorTexture.imagedata.data[
              floorTileRow * 4 * this.floorTexture.height +
                floorTileColumn * 4 +
                1
            ];
          this.baseSprite.data[floorRow * 4 * this.canvas.width + x * 4 + 2] =
            this.floorTexture.imagedata.data[
              floorTileRow * 4 * this.floorTexture.height +
                floorTileColumn * 4 +
                2
            ];

          //!DEBUG
          this.baseSprite.data[floorRow * 4 * this.canvas.width + x * 4] =
            ray.finalAngle * (3.1415 / 180) * 255; //(row / this.canvas.height) * 255; //(floorXEnd - this.camera.position.x * 2) / (600 / 255);
          this.baseSprite.data[
            floorRow * 4 * this.canvas.width + x * 4 + 1
          ] = 1; //(floorYEnd - this.camera.position.y * 2) / (600 / 255);
          this.baseSprite.data[
            floorRow * 4 * this.canvas.width + x * 4 + 2
          ] = 1;
          //!DEBUG

          this.baseSprite.data[
            floorRow * 4 * this.canvas.width + x * 4 + 3
          ] = 255;
        }

        //? ceiling
        if (ceilingRow >= 0) {
          this.baseSprite.data[ceilingRow * 4 * this.canvas.width + x * 4] =
            this.ceilingTexture.imagedata.data[
              ceilingTileRow * 4 * this.ceilingTexture.height +
                ceilingTileColumn * 4
            ];
          this.baseSprite.data[ceilingRow * 4 * this.canvas.width + x * 4 + 1] =
            this.ceilingTexture.imagedata.data[
              ceilingTileRow * 4 * this.ceilingTexture.height +
                ceilingTileColumn * 4 +
                1
            ];
          this.baseSprite.data[ceilingRow * 4 * this.canvas.width + x * 4 + 2] =
            this.ceilingTexture.imagedata.data[
              ceilingTileRow * 4 * this.ceilingTexture.height +
                ceilingTileColumn * 4 +
                2
            ];
          this.baseSprite.data[
            ceilingRow * 4 * this.canvas.width + x * 4 + 3
          ] = 255;
        }
      }
    }

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
        this.projectionPlaneCenter + offsetHeight / 2 - wallHeight,
        1,
        wallHeight
      );

      if (level.lights.length > 0) {
        this.ctx.fillStyle = `rgba(${lightColor.r}, ${lightColor.g}, ${lightColor.b}, ${intensity})`;

        this.ctx.fillRect(
          x,
          this.projectionPlaneCenter + offsetHeight / 2 - wallHeight,
          1,
          wallHeight
        );
      }

      return;
    }

    var color = polygon.color;

    if (level.lights.length > 0) {
      color = new Color(
        (polygon.color.r + lightColor.r * intensity) / 2,
        (polygon.color.g + lightColor.g * intensity) / 2,
        (polygon.color.b + lightColor.b * intensity) / 2
      );
    }

    this.ctx.fillStyle = color.style;

    this.ctx.fillRect(
      x,
      this.projectionPlaneCenter + offsetHeight / 2 - wallHeight,
      1,
      wallHeight //this.canvas.height - this.canvas.height * distanceFactor * 2
    );
  }

  render(level) {
    this.projectionPlaneCenter =
      this.height / 2 + (this.height / 2 / 90) * this.camera.verticalAngle;

    this.#drawBase();

    this.baseSprite = this.baseCtx.createImageData(
      this.canvas.width,
      this.canvas.height
    );

    this.textureWraps = {};

    const rays = this.camera.castRays(
      level,
      this.resolution,
      this.#render.bind(this)
    );

    this.baseCtx.putImageData(this.baseSprite, 0, 0);
    this.ctx.drawImage(this.baseCanvas, 0, 0);

    //this.ctx.putImageData(this.baseSprite, 0, 0);

    this.rays = rays;
  }
}

export { CanvasRenderer };
