import { Vector2 } from "../math/vector2.js";
import { Color } from "../primitives/color.js";
import { Texture } from "../primitives/texture.js";
import { TextureLoader } from "../loaders/textureLoader.js";
import { createProgram } from "../renderers/shaders/webglRendererShader.js";
import {
  degrees_to_radians,
  storeDataInTexture,
  imageToTexture,
} from "../utils.js";
import { createProgramFromSources } from "../../lib/webgl-utils.js";

class WebglRenderer {
  constructor(
    width = 100,
    height = 100,
    camera,
    level,
    renderPass,
    options = {
      antialias: false,
      alpha: false,
    }
  ) {
    this.resolution = width;

    this.frameImage = new Image(width, height);

    this.width = width;
    this.height = height;

    this.camera = camera;

    this.setLevel(level);

    this.renderPass = renderPass;

    this.shading = undefined;

    this.canvas = document.createElement("canvas");
    this.gl = this.canvas.getContext("webgl2", options);

    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.pixels = new Uint8ClampedArray(this.width * this.height * 4);

    this.rays = null;

    this.floorOffset = 100;

    this.distanceToProjectionPlane =
      this.resolution / 2 / Math.tan(degrees_to_radians(this.camera.fov / 2));

    this.loadedTextureCount = [];

    this.program = createProgram(this.gl, this.renderPass); //createProgramFromSources(this.gl, [vs, fs2]);

    // Create a buffer to put three 2d clip space points in
    this.positionBuffer = this.gl.createBuffer();

    this.positionAttributeLocation = this.gl.getAttribLocation(
      this.program,
      "a_position"
    );

    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);

    // fill it with 2 triangles that cover clipspace
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array([
        -1,
        -1, // first triangle
        1,
        -1,
        -1,
        1,
        -1,
        1, // second triangle
        1,
        -1,
        1,
        1,
      ]),
      this.gl.STATIC_DRAW
    );

    // let pix = new ImageData(
    //   new Uint8ClampedArray(this.width * this.height * 4),
    //   this.width,
    //   this.height
    // );
    // var texture = this.gl.createTexture();
    // this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    // this.gl.texImage2D(
    //   this.gl.TEXTURE_2D,
    //   0,
    //   this.gl.RGBA,
    //   this.gl.RGBA,
    //   this.gl.UNSIGNED_BYTE,
    //   pix
    // );
  }

  setDimensions(width, height) {
    this.resolution = width;
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;

    this.gl.canvas.width = width;
    this.gl.canvas.height = height;

    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
  }

  setRenderPass(renderPass) {
    this.renderPass = renderPass;
  }

  set dom(domElement) {
    domElement.appendChild(this.canvas);

    this.domElement = domElement;
  }

  get dom() {
    return this.domElement;
  }

  recalculateDistanceToProjectionPlane() {
    this.distanceToProjectionPlane =
      this.resolution / 2 / Math.tan(degrees_to_radians(this.camera.fov / 2));
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

  setLevel(level) {
    this.level = level;

    //this.resetTextures();
    this.loadLevelTextures(level);
  }

  resetTextures() {
    this.loadedTextureCount = [];
  }

  loadLevelTextures(level) {
    //! a little dumb to reload every texture if a new gets added but might actually be alright
    //! since webgl can't handle that many textures anyway, probably a decent solution.
    //? Shouldn't be permanent however.
    //console.log("loading texture for level: ", level);
    this.resetTextures();

    console.log("loading textures");

    for (let texture of level.textures) {
      imageToTexture(
        this.gl,
        texture,
        this.gl.TEXTURE0 + this.loadedTextureCount.length + 3
      );
      this.loadedTextureCount.push(this.loadedTextureCount.length + 3);
    }
  }

  updateTextures() {}

  #addRayWallToWebgl(level, ray, offsetIndex) {
    //? addRayPolygonToWebgl instead maybe?
    const polygon = ray.polygon;
    const x = ray.x;
    const distance = ray.distance;
    const angle = ray.angle;

    const wallHeight =
      (polygon.height / distance / Math.cos(angle)) *
      this.distanceToProjectionPlane;

    const offsetHeight =
      (this.floorOffset / distance / Math.cos(angle)) *
      this.distanceToProjectionPlane;

    const webglIndex = x * 4;

    const testModifier = 12 * offsetIndex;

    this.webglData[this.resolution * (4 + testModifier) + webglIndex] =
      (this.projectionPlaneCenter + offsetHeight / 2 - wallHeight) / 255;
    this.webglData[this.resolution * (4 + testModifier) + webglIndex + 1] =
      wallHeight / 255;

    this.webglData[this.resolution * (4 + testModifier) + webglIndex + 3] =
      distance / 255;

    var color = polygon.material.color;

    //! lights
    var intensity = undefined;
    var lightColor = undefined;

    if (level.lights.length > 0) {
      const lightData = this.#getLightIntensity(level.lights, ray);

      intensity = lightData.intensity;
      lightColor = lightData.color;

      color = new Color(
        (polygon.material.color.r + lightColor.r * intensity) / 2,
        (polygon.material.color.g + lightColor.g * intensity) / 2,
        (polygon.material.color.b + lightColor.b * intensity) / 2
      );
    }

    //! lights

    var materialIndex = polygon.material.getMaterialIndex(level); //!

    if (polygon.material.textureLoaded) {
      var point = Math.floor(Vector2.distance(ray.lineSegment.start, ray.hit));

      //const texture = polygon.texture.textureImage;
      const texture = polygon.material.texture;
      if (polygon.material.wrap) {
        const offset =
          ray.lineSegment.index > 0
            ? polygon.segmentOffsets[ray.lineSegment.index - 1]
            : 0;

        point = offset + point;
      }

      var textureX = point;

      var textureHeight = polygon.height;

      if (polygon.material.scaleToFit) {
        const length = polygon.material.wrap
          ? polygon.totalLength
          : ray.lineSegment.length;

        textureX = (texture.width / length) * point;
        textureHeight = texture.height;
      }

      //! redundant
      //this.webglData[this.resolution * (12 + testModifier) + webglIndex] = 1;

      this.webglData[this.resolution * (12 + testModifier) + webglIndex + 1] =
        textureX;
      this.webglData[this.resolution * (12 + testModifier) + webglIndex + 2] =
        textureHeight;
      this.webglData[this.resolution * (12 + testModifier) + webglIndex + 3] =
        materialIndex; //! texture index.

      if (!lightColor) return;

      this.webglData[this.resolution * (4 + testModifier) + webglIndex + 2] =
        lightColor.r / 255;
      this.webglData[this.resolution * (8 + testModifier) + webglIndex] =
        lightColor.g / 255;
      this.webglData[this.resolution * (8 + testModifier) + webglIndex + 1] =
        lightColor.b / 255;
      this.webglData[this.resolution * (8 + testModifier) + webglIndex + 2] =
        intensity;
      return;
    }

    this.webglData[this.resolution * (4 + testModifier) + webglIndex + 2] =
      color.r / 255;
    this.webglData[this.resolution * (8 + testModifier) + webglIndex] =
      color.g / 255;
    this.webglData[this.resolution * (8 + testModifier) + webglIndex + 1] =
      color.b / 255;
    this.webglData[this.resolution * (8 + testModifier) + webglIndex + 2] =
      color.a / 255;
  }

  #addRayFloorAndCeilingToWebgl(level, ray) {
    const x = ray.x;
    const webglIndex = x * 4;

    const polygon = ray.polygon;

    const distance = ray.distance;

    const wallHeight =
      (polygon.height / distance / Math.cos(ray.angle)) *
      this.distanceToProjectionPlane;

    const offsetHeight =
      (this.floorOffset / distance / Math.cos(ray.angle)) *
      this.distanceToProjectionPlane;

    const floorMaterial = this.level.floorMaterial;
    const ceilingMaterial = this.level.ceilingMaterial;

    const floorMaterialIndex = floorMaterial.getMaterialIndex(this.level);
    const ceilingMaterialIndex = ceilingMaterial.getMaterialIndex(this.level);

    var lastBottomOfWall = Math.floor(
      this.projectionPlaneCenter + offsetHeight / 2
    );

    var lastTopOfWall = Math.floor(
      this.projectionPlaneCenter + offsetHeight / 2 - wallHeight //this.projectionPlaneCenter - offsetHeight / 2
    );

    this.webglFloorAndCeilingData[webglIndex] = 1;
    this.webglFloorAndCeilingData[webglIndex + 1] = lastBottomOfWall / 255;
    this.webglFloorAndCeilingData[webglIndex + 2] = lastTopOfWall / 255;
    this.webglFloorAndCeilingData[webglIndex + 3] =
      this.projectionPlaneCenter / 255;

    this.webglFloorAndCeilingData[this.resolution * 4 + webglIndex] =
      this.floorOffset / 255;
    this.webglFloorAndCeilingData[this.resolution * 4 + webglIndex + 1] =
      this.level.ceilingHeight / 255;
    this.webglFloorAndCeilingData[this.resolution * 4 + webglIndex + 2] =
      Math.cos(ray.angle);
    this.webglFloorAndCeilingData[this.resolution * 4 + webglIndex + 3] =
      this.distanceToProjectionPlane / 255;

    this.webglFloorAndCeilingData[this.resolution * 8 + webglIndex] =
      degrees_to_radians(ray.finalangle);
    this.webglFloorAndCeilingData[this.resolution * 8 + webglIndex + 1] =
      offsetHeight / 255;
    this.webglFloorAndCeilingData[this.resolution * 8 + webglIndex + 2] =
      floorMaterialIndex;
    this.webglFloorAndCeilingData[this.resolution * 8 + webglIndex + 3] =
      ceilingMaterialIndex;
  }

  #addRaySpriteToWebgl(ray, spriteIndex) {
    const sprites = ray.spriteInfo;

    const x = ray.x;
    const webglIndex = x * 4;

    const sprite = sprites[spriteIndex].sprite;
    const spriteInfo = ray.spriteInfo[spriteIndex];

    //if (!sprite.material.textureLoaded) return;

    var point = Math.floor(
      Vector2.distance(spriteInfo.lineSegment.start, spriteInfo.hit)
    );

    const texture = sprite.material.texture;

    const materialIndex = sprite.material.getMaterialIndex(this.level);

    const length = spriteInfo.lineSegment.length;

    if (sprite.material.textureLoaded) {
      //? used to be texture.width and texture.height
      var textureX = (sprite.material.crop[1].x / length) * point;
      var textureHeight = sprite.material.crop[1].y;

      this.webglSpriteData[
        this.resolution * (8 * spriteIndex) + webglIndex + 1
      ] = textureX;
      this.webglSpriteData[
        this.resolution * (8 * spriteIndex) + webglIndex + 2
      ] = textureHeight;
    }

    const spriteHeight =
      (sprite.height / spriteInfo.distance / Math.cos(ray.angle)) *
      this.distanceToProjectionPlane;

    const spriteOffsetHeight =
      ((this.floorOffset - sprite.y) /
        spriteInfo.distance /
        Math.cos(ray.angle)) *
      this.distanceToProjectionPlane;

    //? sprite information
    this.webglSpriteData[this.resolution * (8 * spriteIndex) + webglIndex] = 1;
    this.webglSpriteData[this.resolution * (8 * spriteIndex) + webglIndex + 3] =
      spriteHeight / 255;

    this.webglSpriteData[this.resolution * (4 + 8 * spriteIndex) + webglIndex] =
      materialIndex;
    this.webglSpriteData[
      this.resolution * (4 + 8 * spriteIndex) + webglIndex + 1
    ] =
      (this.projectionPlaneCenter + spriteOffsetHeight / 2 - spriteHeight) /
      255;
    this.webglSpriteData[
      this.resolution * (4 + 8 * spriteIndex) + webglIndex + 2
    ] = sprite.transparent ? 1 : 0;

    this.webglSpriteData[
      this.resolution * (4 + 8 * spriteIndex) + webglIndex + 3
    ] = spriteInfo.distance / 255;
  }

  #render(level, ray) {
    if (!ray.intersects) return; //contingency

    const sprites = ray.spriteInfo;

    if (sprites.length > 0) {
      for (let i = 0; i < sprites.length; i++) {
        this.#addRaySpriteToWebgl(ray, i);
      }
    }

    if (
      /*(level.floorTexture.loaded || level.ceilingTexture.loaded)*/ true &&
      ray.closest
    ) {
      this.#addRayFloorAndCeilingToWebgl(level, ray);
    }

    const x = ray.x;
    const webglIndex = x * 4;

    this.webglData[webglIndex] = 1; //? the amount of walls

    const heightPasses = ray.heightPass;

    if (heightPasses.length > 0) {
      this.webglData[webglIndex] = heightPasses.length;
      for (let i = 0; i < heightPasses.length; i++) {
        const heightPass = heightPasses[i];
        this.#addRayWallToWebgl(level, heightPass, i);
      }
      return;
    }

    this.#addRayWallToWebgl(level, ray, 0);
  }

  render() {
    if (this.level.updateTextures === true) {
      this.level.updateTextures = false;
      this.loadLevelTextures(this.level);
    }

    this.projectionPlaneCenter =
      this.height / 2 + (this.height / 2 / 90) * this.camera.verticalAngle;

    this.textureWraps = {};

    this.webglData = new Float32Array(
      this.resolution * 16 * this.level.polygons.length
    );

    this.webglSpriteData = new Float32Array(
      this.resolution * this.level.sprites.length * 4 * 2
    );

    this.webglFloorAndCeilingData = new Float32Array(this.resolution * 6 * 4);

    const rays = this.camera.castRays(
      this.level,
      this.resolution,
      this.#render.bind(this)
    );

    storeDataInTexture(
      this.gl,
      this.webglData,
      this.resolution,
      3 * this.level.polygons.length + 1,
      this.gl.TEXTURE0,
      this.gl.RGBA32F,
      this.gl.RGBA
    );

    storeDataInTexture(
      this.gl,
      this.webglSpriteData,
      this.resolution,
      this.level.sprites.length * 2,
      this.gl.TEXTURE1,
      this.gl.RGBA32F,
      this.gl.RGBA
    );

    storeDataInTexture(
      this.gl,
      this.webglFloorAndCeilingData,
      this.resolution,
      6,
      this.gl.TEXTURE2,
      this.gl.RGBA32F,
      this.gl.RGBA
    );

    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

    // Tell it to use our program (pair of shaders)
    this.gl.useProgram(this.program); //TODO? shouldn't this be used in the constructor?

    //? maybe put the following in a function to clearify what is happening?

    this.gl.uniform1i(this.program.dataLocation, 0);
    this.gl.uniform1i(this.program.spriteDataLocation, 1);
    this.gl.uniform1i(this.program.floorAndCeilingDataLocation, 2);

    this.gl.uniform1fv(
      this.program.materialPropertiesLocation,
      this.level.materialProperties
    );

    //TODO: remove all the sassy comments

    if (this.loadedTextureCount.length > 0) {
      this.gl.uniform1iv(
        this.program.loadedTextureLocation,
        this.loadedTextureCount
      );
    }

    this.gl.uniform1f(
      this.program.projectionPlaneCenterLocation,
      this.projectionPlaneCenter
    );

    this.gl.uniform1f(
      this.program.distanceToProjectionPlaneLocation,
      this.distanceToProjectionPlane
    );

    this.gl.uniform2fv(this.program.cameraPositionLocation, [
      this.camera.position.x,
      this.camera.position.y,
    ]);

    this.gl.uniform2fv(this.program.resolutionLocation, [
      this.canvas.width,
      this.canvas.height,
    ]);

    this.gl.uniform2iv(this.program.levelDimensionLocation, [
      this.level.width,
      this.level.height,
    ]);

    this.gl.uniform1i(
      this.program.spriteCountLocation,
      this.level.sprites.length
    );

    // Turn on the attribute
    this.gl.enableVertexAttribArray(this.positionAttributeLocation);

    // Bind the position buffer.
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    this.gl.vertexAttribPointer(
      this.positionAttributeLocation,
      2, // 2 components per iteration
      this.gl.FLOAT, // the data is 32bit floats
      false, // don't normalize the data
      0, // 0 = move forward size * sizeof(type) each iteration to get the next position
      0 // start at the beginning of the buffer
    );

    this.gl.drawArrays(
      this.gl.TRIANGLES,
      0, // offset
      6 // num vertices to process
    );

    //this.frameImage.src = this.canvas.toDataURL("image/png");

    // // this.gl.readPixels(
    // //   0,
    // //   0,
    // //   this.width,
    // //   this.height,
    // //   this.gl.RGBA,
    // //   this.gl.UNSIGNED_BYTE,
    // //   this.pixels
    // // );
    //console.log(this.canvas.toDataURL("image/png"));

    this.rays = rays;
  }
}

export { WebglRenderer };
