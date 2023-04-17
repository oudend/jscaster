import { Vector2 } from "../math/vector2.js";
import { Color } from "../primitives/color.js";
import { Texture } from "../primitives/texture.js";
import { TextureLoader } from "../loaders/textureLoader.js";
import {
  degrees_to_radians,
  storeDataInTexture,
  imageToTexture,
} from "../utils.js";
import { createProgramFromSources } from "../../lib/webgl-utils.js";

class WebglRenderer {
  constructor(width = 100, height = 100, camera) {
    this.resolution = width;
    this.camera = camera;

    this.height = height;

    this.shading = undefined;

    this.canvas = document.createElement("canvas");
    this.gl = this.canvas.getContext("webgl2", { antialias: false });

    // this.ctx.imageSmoothingEnabled = false;

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
      this.resolution / 2 / Math.tan(degrees_to_radians(this.camera.fov / 2)); //Math.tan(degrees_to_radians(this.camera.fov / 2)); //!this.camera.fov
    //this.angleBetweenRays = this.camera.fov / this.resolution;

    //console.log(this.distanceToProjectionPlane);

    this.baseCanvas = document.createElement("canvas");

    this.baseCanvas.width = this.resolution;
    this.baseCanvas.height = this.height;

    this.baseCtx = this.baseCanvas.getContext("2d");

    this.maxTextures = 10;

    var vs = `#version 300 es
      // an attribute is an input (in) to a vertex shader.
      // It will receive data from a buffer
      in vec4 a_position;

      // all shaders have a main function
      void main() {

      // gl_Position is a special variable a vertex shader
      // is responsible for setting
      gl_Position = a_position;
      }
    `;
    var fs2 = `#version 300 es
      precision highp float;

      #define numTextures ${this.maxTextures}

      // The texture.
      uniform vec2 cameraPosition;

      uniform sampler2D data;
      uniform sampler2D spriteData;
      uniform sampler2D floorAndCeilingData;

      uniform sampler2D polygonTextures[numTextures];

      uniform sampler2D floorTexture;
      uniform sampler2D ceilingTexture;

      uniform ivec2 levelDimensions;

      uniform ivec2 floorTextureDimensions;
      uniform ivec2 ceilingTextureDimensions;

      uniform vec2 resolution;
      uniform vec2 ceilingTextureScale;
      uniform vec2 floorTextureScale;

      uniform vec2 floorTextureOffset;
      uniform vec2 ceilingTextureOffset;

      uniform int floorTextureLoaded;
      uniform int ceilingTextureLoaded;
      uniform int spriteCount;

      uniform float projectionPlaneCenter;
      uniform float distanceToProjectionPlane;

      out vec4 fragColor;
      in vec2 fragCoord;

      void main() {

        vec4 wallInformation = texelFetch(data, ivec2(gl_FragCoord.x, 0), 0);

        int wallCount = int(wallInformation.r);

        vec4 firstData1 = texelFetch(data, ivec2(gl_FragCoord.x, 1), 0);
        // // vec4 data2 = texelFetch(data, ivec2(gl_FragCoord.x, 2), 0);
        // // vec4 data3 = texelFetch(data, ivec2(gl_FragCoord.x, 3), 0);

        vec4 lastData1 = texelFetch(data, ivec2(gl_FragCoord.x, 1 +  3 * (wallCount - 1) ), 0);

        float lastY = 0.;

        //! THIS SUCKS FIX THIS PLEASE I BEG OF YOU
        for(int i = 1; i < wallCount; i++) {
          vec4 wallData1 = texelFetch(data, ivec2(gl_FragCoord.x, 1 + 3 * i ), 0);

          float tempY = resolution.y - wallData1.r * 255.;

          if(tempY > lastY) {
            lastY = tempY;
          }
        }

        float firstY = resolution.y - firstData1.r * 255.;
        float firstHeight = -(firstData1.g * 255.);

        lastY = max(firstY, lastY);


        vec4 floorAndCeilingData1 = texelFetch(floorAndCeilingData, ivec2(gl_FragCoord.x, 0), 0);
        vec4 floorAndCeilingData2 = texelFetch(floorAndCeilingData, ivec2(gl_FragCoord.x, 1), 0);
        vec4 floorAndCeilingData3 = texelFetch(floorAndCeilingData, ivec2(gl_FragCoord.x, 2), 0);

        vec4 opacityColor = vec4(0.);

        if(spriteCount > 0) {
          for(int i = 0; i < spriteCount; i++) {
            vec4 spriteData1 = texelFetch(spriteData, ivec2(gl_FragCoord.x, 0 + i * 2), 0);
            vec4 spriteData2 = texelFetch(spriteData, ivec2(gl_FragCoord.x, 1 + i * 2), 0);


            float isSprite = spriteData1.r;

            float textureX = spriteData1.g;
            float textureHeight = spriteData1.b;
            int textureIndex = int(spriteData2.r);
            float spriteHeight = spriteData1.a * 255.;
            float spriteY = resolution.y - spriteData2.g * 255.;
            bool isTransparent = spriteData2.b == 1. ? true : false;

            //? temporary solution.. DO NOT PUSH TO PROD
            if(isSprite == 0.) 
              continue;

            if(gl_FragCoord.y > spriteY || gl_FragCoord.y < spriteY - spriteHeight)
              continue;

            int closestYCoord = int(round( ((textureHeight) / (spriteHeight)) * (spriteHeight - (gl_FragCoord.y - (spriteY - spriteHeight)) ) ));

            vec4 spriteColor;

            switch(textureIndex) {
              // we are not allowed to use i as index to access texture in array in current version of GLSL
              ${new Array(this.maxTextures)
                .fill(0)
                .map(
                  (_, i) => `case ${i}:
                spriteColor = texelFetch(polygonTextures[${i}], ivec2(textureX, closestYCoord), 0);

                fragColor = vec4(spriteColor) + opacityColor * opacityColor.a;    
                
                if(!(isTransparent && spriteColor.a < 1.))
                  return;
          
                opacityColor += spriteColor;

                break;
            `
                )
                .join("")}
              default: break;
            }

            //return;
          }
        }

        //? gl_FragCoord.y >= resolution.y,  gl_FragCoord.y <= (resolution.y - y) - height
        if(gl_FragCoord.y >= lastY || gl_FragCoord.y <= firstY + firstHeight - 1.) {
          bool isFloorAndCeilingLoaded = floorAndCeilingData1.r == 1.;

          bool isFloor = gl_FragCoord.y <= firstY;

          float lastBottomOfWall = floorAndCeilingData1.g * 255.;
          float lastTopOfWall = floorAndCeilingData1.b * 255.;
          //float projectionPlaneCenter = floorAndCeilingData1.a * 255.;
          float floorOffset = floorAndCeilingData2.r * 255.;
          float ceilingHeight = floorAndCeilingData2.g * 255.;
          float rayAngle = floorAndCeilingData2.b;
          //float distanceToProjectionPlane = floorAndCeilingData2.a * 255.; //! deprecated
          float finalAngle = floorAndCeilingData3.r;
          float offsetHeight = floorAndCeilingData3.g * 255.;

          float row = lastBottomOfWall + ((firstY + firstHeight) - gl_FragCoord.y);

          //?row = gl_FragCoord.y - ( (resolution.y - y) - height);

          float multiplier = resolution.x / 300.;//!resolution.x * (1. / 600.);

          float levelWidth = float(levelDimensions.x);// * tan(radians(fov/2.));//!
          float levelHeight = float(levelDimensions.y);// * tan(radians(fov/2.));//!

          float mysteriousValueX = levelWidth * 1.;//level=anything, res = (600, 600)
          float mysteriousValueY = levelHeight * 1.;//level=anything, res = (600, 600)

          if(isFloor && floorTextureLoaded == 1) {

            float floorRatio = ((floorOffset) / (row - projectionPlaneCenter));

            float floorDiagonalDistance = ((distanceToProjectionPlane * floorRatio) * (1. / (rayAngle) ));

            float floorXEnd = (floorDiagonalDistance * cos(finalAngle));
            float floorYEnd = (floorDiagonalDistance * sin(finalAngle));

            float floorTextureTranslationXscale = 2.;
            float floorTextureTranslationYscale = 2.;

            floorXEnd += cameraPosition.x * floorTextureTranslationXscale; 
            floorYEnd += cameraPosition.y * floorTextureTranslationYscale; 
            float floorTextureXscale = ( float(floorTextureDimensions.x) / (levelWidth * 1.));
            float floorTextureYscale = ( float(floorTextureDimensions.y) / (levelHeight * 1.));

            int floorTileX = int( abs(floorXEnd * floorTextureXscale + floorTextureOffset.x) / floorTextureScale.x ) % floorTextureDimensions.x;
            int floorTileY = int( abs(floorYEnd * floorTextureYscale + floorTextureOffset.y) / floorTextureScale.y ) % floorTextureDimensions.y;
            //! / floorTextureScale.x
            fragColor = mix( texelFetch(floorTexture, ivec2(floorTileX, floorTileY), 0), vec4(opacityColor.r, opacityColor.g, opacityColor.b, 1.), opacityColor.a);
            return;
          }

          if(ceilingTextureLoaded != 1 || isFloor) {
            fragColor = mix( vec4(0., 0., 0., 1.), vec4(opacityColor.r, opacityColor.g, opacityColor.b, 1.), opacityColor.a);
            return;
          }

          float ceilingRatio = (ceilingHeight * 2. - floorOffset) / (projectionPlaneCenter - row);

          float ceilingDiagonalDistance = ((distanceToProjectionPlane * ceilingRatio) * (1.0 / rayAngle));

          float ceilingYEnd = (ceilingDiagonalDistance * sin(finalAngle));
          float ceilingXEnd = (ceilingDiagonalDistance * cos(finalAngle));

          float ceilingTextureTranslationXscale = 2.;
          float ceilingTextureTranslationYscale = 2.;
          
          ceilingXEnd += cameraPosition.x * ceilingTextureTranslationXscale;
          ceilingYEnd += cameraPosition.y * ceilingTextureTranslationYscale;

          float ceilingTextureXscale = float(ceilingTextureDimensions.x) / (levelWidth * 1.);
          float ceilingTextureYscale = float(ceilingTextureDimensions.y) / (levelHeight * 1.);

          int ceilingTileX = int( abs(ceilingXEnd * ceilingTextureXscale + ceilingTextureOffset.x) / ceilingTextureScale.x ) % ceilingTextureDimensions.x; //int( mod(ceilingXEnd * ceilingTextureXscale, float(ceilingTextureDimensions.x) ) ); 
          int ceilingTileY = int( abs(ceilingYEnd * ceilingTextureYscale + ceilingTextureOffset.y) / ceilingTextureScale.y ) % ceilingTextureDimensions.y; //int( mod(ceilingYEnd * ceilingTextureYscale, float(ceilingTextureDimensions.y) ) );

          fragColor = mix( texelFetch(ceilingTexture, ivec2(ceilingTileX, ceilingTileY), 0) + opacityColor * opacityColor.a, vec4(opacityColor.r, opacityColor.g, opacityColor.b, 1.), opacityColor.a);
          return;


          fragColor = mix( vec4(0., 0., 0., 1.), vec4(opacityColor.r, opacityColor.g, opacityColor.b, 1.), opacityColor.a);
          return;
        }

        //? if(gl_FragCoord.y >= firstY) {
        //?   fragColor = vec4(0., 0., 0., 1.);
        //?   return;
        //? }

        for(int i = 0; i < wallCount; i++) {
          vec4 data1 = texelFetch(data, ivec2(gl_FragCoord.x, 1 + 3 * i ), 0);
          vec4 data2 = texelFetch(data, ivec2(gl_FragCoord.x, 2 + 3 * i ), 0);
          vec4 data3 = texelFetch(data, ivec2(gl_FragCoord.x, 3 + 3 * i ), 0);
        
          float y = resolution.y - data1.r * 255.;
          float height = -(data1.g * 255.);

          if(gl_FragCoord.y >= y || gl_FragCoord.y <= y + height - 1.) {
            continue;
          }

          if(data3.r == 1.) {
            float textureHeight = data3.b;

            int closestYCoord = int(round( ((textureHeight) / (-height+2.)) * (gl_FragCoord.y-(y + height)+1.) ));

            int textureIndex = int(data3.a);

            switch(textureIndex) {
              // we are not allowed to use i as index to access texture in array in current version of GLSL
              ${new Array(this.maxTextures)
                .fill(0)
                .map(
                  (_, i) => `case ${i}:
                fragColor = mix(data2.b * vec4(data1.b, data2.r, data2.g, 1.) + texelFetch(polygonTextures[${i}], ivec2(data3.g, closestYCoord), 0), vec4(opacityColor.r, opacityColor.g, opacityColor.b, 1.), opacityColor.a);
                
                return;
          
                break;
            `
                )
                .join("")}
              default: break;
            }
          }

          vec4 color = vec4(data1.b, data2.r, data2.g, data2.b);

          fragColor = mix(color.rgba, vec4(opacityColor.r, opacityColor.g, opacityColor.b, 1.), opacityColor.a);
          return;
        }
        
      }
    `;
    //TODO: replace polygonTextures with separate variables for infinite  texture limit.

    //     console.log(
    //       new Array(this.maxTextures)
    //         .fill(0)
    //         .map(
    //           (_, i) => `case ${i}:
    //     fragColor = data2.b * vec4(data1.b, data2.r, data2.g, 1.) + texelFetch(polygonTextures[${i}], ivec2(data3.g, closestYCoord), 0);
    //     return;

    //     break;
    // `
    //         )
    //         .join("")
    //     );

    this.loadedTextureCount = [];

    this.program = createProgramFromSources(this.gl, [vs, fs2]);

    this.dataLocation = this.gl.getUniformLocation(this.program, "data");
    this.spriteDataLocation = this.gl.getUniformLocation(
      this.program,
      "spriteData"
    );

    this.floorAndCeilingDataLocation = this.gl.getUniformLocation(
      this.program,
      "floorAndCeilingData"
    );

    this.loadedTextureLocation = this.gl.getUniformLocation(
      this.program,
      "polygonTextures"
    );
    this.cameraPositionLocation = this.gl.getUniformLocation(
      this.program,
      "cameraPosition"
    );
    this.floorTextureLocation = this.gl.getUniformLocation(
      this.program,
      "floorTexture"
    );
    this.ceilingTextureLocation = this.gl.getUniformLocation(
      this.program,
      "ceilingTexture"
    );

    this.ceilingTextureScaleLocation = this.gl.getUniformLocation(
      this.program,
      "ceilingTextureScale"
    );
    this.floorTextureScaleLocation = this.gl.getUniformLocation(
      this.program,
      "floorTextureScale"
    );

    this.ceilingTextureOffsetLocation = this.gl.getUniformLocation(
      this.program,
      "ceilingTextureOffset"
    );
    this.floorTextureOffsetLocation = this.gl.getUniformLocation(
      this.program,
      "floorTextureOffset"
    );

    this.floorTextureDimensionLocation = this.gl.getUniformLocation(
      this.program,
      "floorTextureDimensions"
    );
    this.spriteCountLocation = this.gl.getUniformLocation(
      this.program,
      "spriteCount"
    );
    this.ceilingTextureDimensionLocation = this.gl.getUniformLocation(
      this.program,
      "ceilingTextureDimensions"
    );

    this.projectionPlaneCenterLocation = this.gl.getUniformLocation(
      this.program,
      "projectionPlaneCenter"
    );

    this.distanceToProjectionPlaneLocation = this.gl.getUniformLocation(
      this.program,
      "distanceToProjectionPlane"
    );

    this.resolutionLocation = this.gl.getUniformLocation(
      this.program,
      "resolution"
    );

    this.levelDimensionLocation = this.gl.getUniformLocation(
      this.program,
      "levelDimensions"
    );

    this.floorTextureLoadedLocation = this.gl.getUniformLocation(
      this.program,
      "floorTextureLoaded"
    );
    this.ceilingTextureLoadedLocation = this.gl.getUniformLocation(
      this.program,
      "ceilingTextureLoaded"
    );

    //floorTextureLoaded

    this.floorTextureScale = new Vector2(1, 1);
    this.ceilingTextureScale = new Vector2(1, 1);

    //resolution

    //floorTextureDimensions

    this.floorTextureLoaded = false;
    this.ceilingTextureLoaded = false;

    // Create a buffer to put three 2d clip space points in
    this.positionBuffer = this.gl.createBuffer();

    this.positionAttributeLocation = this.gl.getAttribLocation(
      this.program,
      "a_position"
    );

    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);

    // fill it with a 2 triangles that cover clipspace
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

  #loadTexture(textureLoader) {
    if (textureLoader.isMultiTextureLoader === true) {
      if (textureLoader.textureIndex !== undefined) return;

      //console.log("loading multiTextureLoader");
      //textureLoader.textureIndex = this.loadedTextureCount.length;

      for (let subTextureLoader of textureLoader.textureLoaders) {
        this.#loadTexture(subTextureLoader);
      }

      return;
    }

    if (textureLoader.textureIndex === undefined) {
      //console.log("No bitches?", texture);
      imageToTexture(
        this.gl,
        textureLoader.textureImage,
        this.gl.TEXTURE0 + this.loadedTextureCount.length + 5
      );

      textureLoader.textureIndex = this.loadedTextureCount.length;
      this.loadedTextureCount.push(this.loadedTextureCount.length + 5);
    }
  }

  #addRayWallToWebgl(level, ray, offsetIndex) {
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

    //! lights
    var intensity = undefined;
    var lightColor = undefined;

    if (level.lights.length > 0) {
      const lightData = this.#getLightIntensity(level.lights, ray);

      intensity = lightData.intensity;
      lightColor = lightData.color;
    }

    var color = polygon.color;

    if (level.lights.length > 0) {
      color = new Color(
        (polygon.color.r + lightColor.r * intensity) / 2,
        (polygon.color.g + lightColor.g * intensity) / 2,
        (polygon.color.b + lightColor.b * intensity) / 2
      );
    }
    //! lights

    if (polygon.texture && polygon.texture.loaded) {
      var point = Math.floor(Vector2.distance(ray.lineSegment.start, ray.hit));

      const texture = polygon.texture.textureImage;

      this.#loadTexture(polygon.texture);

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

      this.webglData[this.resolution * (12 + testModifier) + webglIndex] = 1;
      this.webglData[this.resolution * (12 + testModifier) + webglIndex + 1] =
        textureX;
      this.webglData[this.resolution * (12 + testModifier) + webglIndex + 2] =
        textureHeight;
      this.webglData[this.resolution * (12 + testModifier) + webglIndex + 3] =
        polygon.texture.textureIndex; //! texture index.

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

    if (!this.floorTextureLoaded && level.floorTexture.loaded) {
      //console.log(this.floorTexture);
      imageToTexture(
        this.gl,
        level.floorTexture.texture.image,
        this.gl.TEXTURE1
      );
      this.floorTextureLoaded = true;
    }

    if (!this.ceilingTextureLoaded && level.ceilingTexture.loaded) {
      imageToTexture(
        this.gl,
        level.ceilingTexture.texture.image,
        this.gl.TEXTURE2
      );
      if (!this.ceilingTextureLoaded) {
        imageToTexture(
          this.gl,
          level.ceilingTexture.texture.image,
          this.gl.TEXTURE2
        );
        this.ceilingTextureLoaded = true;
      }
    }

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
      level.ceilingHeight / 255;
    this.webglFloorAndCeilingData[this.resolution * 4 + webglIndex + 2] =
      Math.cos(ray.angle);
    this.webglFloorAndCeilingData[this.resolution * 4 + webglIndex + 3] =
      this.distanceToProjectionPlane / 255;

    this.webglFloorAndCeilingData[this.resolution * 8 + webglIndex] =
      degrees_to_radians(ray.finalangle);
    this.webglFloorAndCeilingData[this.resolution * 8 + webglIndex + 1] =
      offsetHeight / 255;
  }

  #addRaySpriteToWebgl(ray, spriteIndex) {
    const sprites = ray.spriteInfo;

    const x = ray.x;
    const webglIndex = x * 4;

    const sprite = sprites[spriteIndex].sprite;
    const spriteInfo = ray.spriteInfo[spriteIndex];

    if (!sprite.texture.loaded) return;

    var point = Math.floor(
      Vector2.distance(spriteInfo.lineSegment.start, spriteInfo.hit)
    );

    const texture = sprite.texture.textureImage;

    this.#loadTexture(sprite.texture);

    const length = spriteInfo.lineSegment.length;

    var textureX = (texture.width / length) * point;
    var textureHeight = texture.height;

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
    this.webglSpriteData[this.resolution * (8 * spriteIndex) + webglIndex + 1] =
      textureX;
    this.webglSpriteData[this.resolution * (8 * spriteIndex) + webglIndex + 2] =
      textureHeight;
    this.webglSpriteData[this.resolution * (8 * spriteIndex) + webglIndex + 3] =
      spriteHeight / 255;

    this.webglSpriteData[this.resolution * (4 + 8 * spriteIndex) + webglIndex] =
      sprite.texture.textureIndex;
    this.webglSpriteData[
      this.resolution * (4 + 8 * spriteIndex) + webglIndex + 1
    ] =
      (this.projectionPlaneCenter + spriteOffsetHeight / 2 - spriteHeight) /
      255;
    this.webglSpriteData[
      this.resolution * (4 + 8 * spriteIndex) + webglIndex + 2
    ] = sprite.transparent ? 1 : 0;
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
      (level.floorTexture.loaded || level.ceilingTexture.loaded) &&
      ray.closest
    ) {
      this.#addRayFloorAndCeilingToWebgl(level, ray);
    }

    const x = ray.x;
    const webglIndex = x * 4;

    this.webglData[webglIndex] = 1; //? the amount of walls
    //?this.webglData[webglIndex + 1] = 0;

    const heightPasses = ray.heightPass;

    if (heightPasses.length > 0) {
      // const heightInfo = new Array(heightPasses.length).fill(0);

      // for (let i = 0; i < heightPasses.length; i++) {
      //   const wallHeight =
      //     (heightPasses[i].polygon.height /
      //       heightPasses[i].distance /
      //       Math.cos(ray.angle)) *
      //     this.distanceToProjectionPlane;

      //   const offsetHeight =
      //     (this.floorOffset / heightPasses[i].distance / Math.cos(ray.angle)) *
      //     this.distanceToProjectionPlane;

      //   const y =
      //     (this.projectionPlaneCenter + offsetHeight / 2 - wallHeight) / 255;

      //   if (i > 0 && heightInfo[i - 1] < y) {
      //     heightInfo[i] = undefined;
      //     continue;
      //   }

      //   heightInfo[i] = y;
      // }

      this.webglData[webglIndex] = heightPasses.length;
      for (let i = 0; i < heightPasses.length; i++) {
        // if (heightInfo[i] === undefined) continue;

        const heightPass = heightPasses[i];
        this.#addRayWallToWebgl(level, heightPass, i);
      }
      return;
    }

    this.#addRayWallToWebgl(level, ray, 0);
  }

  render(level) {
    this.projectionPlaneCenter =
      this.height / 2 + (this.height / 2 / 90) * this.camera.verticalAngle;
    //! - will make it face right when up and down.

    // this.#drawBase();

    this.baseSprite = this.baseCtx.createImageData(
      this.canvas.width,
      this.canvas.height
    );

    this.textureWraps = {};

    this.webglData = new Float32Array(
      this.resolution * 16 * level.polygons.length
    );

    this.webglSpriteData = new Float32Array(
      this.resolution * level.sprites.length * 4 * 2
    );

    this.webglFloorAndCeilingData = new Float32Array(this.resolution * 3 * 4);

    const rays = this.camera.castRays(
      level,
      this.resolution,
      this.#render.bind(this)
    );

    storeDataInTexture(
      this.gl,
      this.webglData,
      this.resolution,
      3 * level.polygons.length + 1,
      this.gl.TEXTURE0,
      this.gl.RGBA32F,
      this.gl.RGBA
    );

    storeDataInTexture(
      this.gl,
      this.webglSpriteData,
      this.resolution,
      level.sprites.length * 2,
      this.gl.TEXTURE3,
      this.gl.RGBA32F,
      this.gl.RGBA
    );

    storeDataInTexture(
      this.gl,
      this.webglFloorAndCeilingData,
      this.resolution,
      3,
      this.gl.TEXTURE4,
      this.gl.RGBA32F,
      this.gl.RGBA
    );

    //this.baseCtx.putImageData(this.baseSprite, 0, 0);
    //this.ctx.drawImage(this.baseCanvas, 0, 0);

    //this.ctx.putImageData(this.baseSprite, 0, 0);

    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

    // Tell it to use our program (pair of shaders)
    this.gl.useProgram(this.program);

    this.gl.uniform2iv(this.floorTextureDimensionLocation, [
      level.floorTexture.loaded ? level.floorTexture.texture.width : undefined,
      level.floorTexture.loaded ? level.floorTexture.texture.height : undefined,
    ]);
    this.gl.uniform2iv(this.ceilingTextureDimensionLocation, [
      level.ceilingTexture.loaded
        ? level.ceilingTexture.texture.width
        : undefined,
      level.ceilingTexture.loaded
        ? level.ceilingTexture.texture.height
        : undefined,
    ]);

    // if (this.floorTextureLoaded) {
    //   debugger;
    // }

    this.gl.uniform1i(this.dataLocation, 0);
    this.gl.uniform1i(this.spriteDataLocation, 3);
    this.gl.uniform1i(this.floorAndCeilingDataLocation, 4);

    this.gl.uniform1i(this.floorTextureLocation, 1);
    this.gl.uniform1i(this.ceilingTextureLocation, 2);

    this.gl.uniform1iv(this.loadedTextureLocation, this.loadedTextureCount);

    this.gl.uniform1f(
      this.projectionPlaneCenterLocation,
      this.projectionPlaneCenter
    );

    this.gl.uniform1f(
      this.distanceToProjectionPlaneLocation,
      this.distanceToProjectionPlane
    );

    this.gl.uniform2fv(this.cameraPositionLocation, [
      this.camera.position.x,
      this.camera.position.y,
    ]);

    this.gl.uniform2fv(this.resolutionLocation, [
      this.canvas.width,
      this.canvas.height,
    ]);

    this.gl.uniform2fv(this.floorTextureScaleLocation, [
      level.floorTextureScale.x,
      level.floorTextureScale.y,
    ]);
    this.gl.uniform2fv(this.ceilingTextureScaleLocation, [
      level.ceilingTextureScale.x,
      level.ceilingTextureScale.y,
    ]);

    this.gl.uniform2fv(this.floorTextureOffsetLocation, [
      level.floorTextureOffset.x,
      level.floorTextureOffset.y,
    ]);
    this.gl.uniform2fv(this.ceilingTextureOffsetLocation, [
      level.ceilingTextureOffset.x,
      level.ceilingTextureOffset.y,
    ]);

    //ceilingTextureOffsetLocation

    //this.floorTextureScaleLocation

    this.gl.uniform2iv(this.levelDimensionLocation, [
      level.width,
      level.height,
    ]);

    this.gl.uniform1i(
      this.floorTextureLoadedLocation,
      this.floorTextureLoaded ? 1 : 0
    );
    this.gl.uniform1i(
      this.ceilingTextureLoadedLocation,
      this.ceilingTextureLoaded ? 1 : 0
    );
    this.gl.uniform1i(this.spriteCountLocation, level.sprites.length);

    //levelDimensionLocation

    //this.loadedTextureLocation

    //this.gl.uniform1i(u_image1Location, 1);

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

    this.rays = rays;
  }
}

export { WebglRenderer };
