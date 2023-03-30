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
      this.resolution / 2 / Math.tan(degrees_to_radians(this.camera.fov / 2));
    //this.angleBetweenRays = this.camera.fov / this.resolution;

    // this.floorTexture = new Texture(
    //   "../assets/bricks.jpg",
    //   undefined,
    //   undefined,
    //   undefined,
    //   "repeat"
    // );

    // this.ceilingTexture = new Texture(
    //   "../assets/bricks2.jpg",
    //   undefined,
    //   undefined,
    //   undefined,
    //   "repeat"
    // );

    // // this.floorTexture = new TextureLoader(
    // //   "../assets/frame.jpg",
    // //   undefined,
    // //   true, //!TODO: IMplement scaleToFit :)
    // //   true,
    // //   "repeat",
    // //   new Vector2(1, 1),
    // //   new Vector2(0, 0)
    // // );

    // // this.ceilingTexture = new TextureLoader(
    // //   "../assets/bricks2.jpg",
    // //   undefined,
    // //   true, //!TODO: IMplement scaleToFit :)
    // //   true,
    // //   "repeat",
    // //   new Vector2(1, 1),
    // //   new Vector2(0, 0)
    // // );

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

      uniform sampler2D polygonTextures[numTextures];

      uniform sampler2D floorTexture;
      uniform sampler2D ceilingTexture;

      uniform ivec2 levelDimensions;

      uniform ivec2 floorTextureDimensions;
      uniform ivec2 ceilingTextureDimensions;

      uniform vec2 resolution;
      uniform vec2 ceilingTextureScale;
      uniform vec2 floorTextureScale;

      uniform int floorTextureLoaded;
      uniform int ceilingTextureLoaded;

      uniform float projectionPlaneCenter;

      out vec4 fragColor;
      in vec2 fragCoord;

      //uniform sampler2D

      void main() {

        //fragColor = texelFetch(polygonTextures[0], ivec2(gl_FragCoord), 0);
        //return;

        // gl_FragColor is a special variable a fragment shader
        // is responsible for setting

        //vec2 uv = gl_FragCoord.xy / u_resolution;

        //int test = int(gl_FragCoord.x);

        //vec3 col = 0.5 + 0.5*cos(u_time+uv.xyx+vec3(0,2,4));

        //float test2 = testArray[test];

        vec4 data1 = texelFetch(data, ivec2(gl_FragCoord.x, 0), 0);
        vec4 data2 = texelFetch(data, ivec2(gl_FragCoord.x, 1), 0);
        vec4 data3 = texelFetch(data, ivec2(gl_FragCoord.x, 2), 0);
        vec4 data4 = texelFetch(data, ivec2(gl_FragCoord.x, 3), 0);
        vec4 data5 = texelFetch(data, ivec2(gl_FragCoord.x, 4), 0);
        vec4 data6 = texelFetch(data, ivec2(gl_FragCoord.x, 5), 0);

        float y = resolution.y - data1.r * 255.;
        float height = -(data1.g * 255.);

        //! clue: try to reverse the way it draws walls so when you try and go up it goes down.

        //? gl_FragCoord.y >= resolution.y,  gl_FragCoord.y <= (resolution.y - y) - height
        if(gl_FragCoord.y >= y || gl_FragCoord.y <= y + height - 1.) {
          bool isFloorAndCeilingLoaded = data4.r == 1.;

          // if() {
          //   fragColor = vec4(0., 0., 0., 1.);
          //   return;
          // }
          
          // if(!isFloorAndCeilingLoaded) {
          //   fragColor = vec4(0., 0., 0., 1.);
          //   return;
          // }

          bool isFloor = gl_FragCoord.y <= y;

          //data4.r = 1;
          //data4.g = lastBottomOfWall;
          //data4.b = lastTopOfWall;
          //data4.a = this.projectionPlaneCenter; //! deprecated
          //data5.r = floorOffset;
          //data5.g = ceilingHeight;
          //data5.b = ray.angle;
          //data5.a = distanceToProjectionPlane;
          //data6.r = radians(finalAngle);

          float lastBottomOfWall = data4.g * 255.;
          float lastTopOfWall = data4.b * 255.;
          //float projectionPlaneCenter = data4.a * 255.;
          float floorOffset = data5.r * 255.;
          float ceilingHeight = data5.g * 255.;
          float rayAngle = data5.b;
          float distanceToProjectionPlane = data5.a * 255.;
          float finalAngle = data6.r;
          float offsetHeight = data6.g * 255.;

          //! this is an absolutely disgusting solution
          //! that might not even work. But oh well.

          // if(gl_FragCoord.y > y + height) {
          //   return;
          // }
          float row = lastBottomOfWall + ((y + height) - gl_FragCoord.y);

          //?row = gl_FragCoord.y - ( (resolution.y - y) - height);

          float multiplier = resolution.x * (1. / 600.);

          float levelWidth = float(levelDimensions.x) ;//!
          float levelHeight = float(levelDimensions.y);//!

          float mysteriousValueX = levelWidth * 0.2;//level=anything, res = (600, 600)
            float mysteriousValueY = levelHeight * 0.2;//level=anything, res = (600, 600)

          if(isFloor && floorTextureLoaded == 1) {
            // float floorTextureXscale = 1200. / float(floorTextureDimensions.x);
            // float floorTextureYscale = 1200. / float(floorTextureDimensions.y);
            //?float floorRow = lastBottomOfWall + row;

            float floorRatio = (floorOffset / (row - projectionPlaneCenter));

            //! * 1. x=600
            //! * .5 x=300

            float floorDiagonalDistance = ((distanceToProjectionPlane * floorRatio * multiplier) * (1.0 / rayAngle));

            float floorXEnd = (floorDiagonalDistance * cos(finalAngle));
            float floorYEnd = (floorDiagonalDistance * sin(finalAngle));

            //! floorTextureDimensions = 1024, 1024

            //!1200 res = * .6
            //!600 res = 1.2

            //?float mysteriousValue = 200.; level=(1000, 1000), res = (600, 600)
            //?float mysteriousValue = 10.; //level=(100, 1000), res = (600, 600)

            //?float mysteriousValueX = 20.; //level=(100, 1000), res = (600, 600)
            //?float mysteriousValueY = 200.; //level=(100, 1000), res = (600, 600)

            // float mysteriousValueX = levelWidth * 0.2;//level=anything, res = (600, 600)
            // float mysteriousValueY = levelHeight * 0.2;//level=anything, res = (600, 600)
            //! mysteriousValue might be right now...

            //!float mysteriousValueX = levelWidth * 0.2;//!level=anything, res = (100, 600)
            //!float mysteriousValueY = levelHeight * 0.2;//!level=anything, res = (100, 600)

            //?floorTextureTranslationXscale = 1.2;
            //?floorTextureTranslationYscale = 1.2;

            float floorTextureTranslationXscale = 1.2;
            float floorTextureTranslationYscale = 1.2;

            floorXEnd += cameraPosition.x * floorTextureTranslationXscale; //?((levelWidth + mysteriousValue)/levelWidth);//?floorTextureTranslationXscale;//cameraPosition.x;//normalizedX * float(floorTextureDimensions.x);//normalizedX * float(floorTextureDimensions.x) / xScale;//normalizedX * float(floorTextureDimensions.x); //?1000 is the width and height of the level
            floorYEnd += cameraPosition.y * floorTextureTranslationYscale; //?((levelHeight + mysteriousValue)/levelWidth);//?floorTextureTranslationXscale;//cameraPosition.y;//normalizedY * float(floorTextureDimensions.y);//normalizedY * float(floorTextureDimensions.y) / yScale;//normalizedY * float(floorTextureDimensions.y);

            float floorTextureXscale = float(floorTextureDimensions.x) / (levelWidth + mysteriousValueX);
            float floorTextureYscale = float(floorTextureDimensions.y) / (levelHeight + mysteriousValueY);

            int floorTileX = int( (floorXEnd * floorTextureXscale) / floorTextureScale.x ) % floorTextureDimensions.x;//mod(floorXEnd * floorTextureXscale, float(floorTextureDimensions.x) ) ); 
            int floorTileY = int( (floorYEnd * floorTextureYscale) / floorTextureScale.y ) % floorTextureDimensions.y; //mod(floorYEnd * floorTextureYscale, float(floorTextureDimensions.y) ) );
            
            fragColor = texelFetch(floorTexture, ivec2(floorTileX, floorTileY), 0);
            return;
          }

          if(ceilingTextureLoaded != 1) {
            fragColor = vec4(0., 0., 0., 1.);
            return;
          }

          // float ceilingTextureTranslationXscale = (1200./float(ceilingTextureDimensions.x)) * (600. / resolution.x);
          // float ceilingTextureTranslationYscale = (1200./float(ceilingTextureDimensions.y)) * (600. / resolution.y);

          // float ceilingTextureXscale = 1200. / float(ceilingTextureDimensions.x);
          // float ceilingTextureYscale = 1200. / float(ceilingTextureDimensions.y);

          //?float ceilingRow = lastBottomOfWall + row;

          float ceilingRatio = (ceilingHeight * 2. - floorOffset) / (projectionPlaneCenter - row);

          float ceilingDiagonalDistance = ((distanceToProjectionPlane * ceilingRatio * multiplier) * (1.0 / rayAngle));

          float ceilingYEnd = (ceilingDiagonalDistance * sin(finalAngle));
          float ceilingXEnd = (ceilingDiagonalDistance * cos(finalAngle));

          float ceilingTextureTranslationXscale = 1.2;
          float ceilingTextureTranslationYscale = 1.2;
          
          ceilingXEnd += cameraPosition.x * ceilingTextureTranslationXscale;
          ceilingYEnd += cameraPosition.y * ceilingTextureTranslationYscale;

          float ceilingTextureXscale = float(ceilingTextureDimensions.x) / (levelWidth + mysteriousValueX);
          float ceilingTextureYscale = float(ceilingTextureDimensions.y) / (levelHeight + mysteriousValueY);

          int ceilingTileX = int( (ceilingXEnd * ceilingTextureXscale) / ceilingTextureScale ) % ceilingTextureDimensions.x; //int( mod(ceilingXEnd * ceilingTextureXscale, float(ceilingTextureDimensions.x) ) ); 
          int ceilingTileY = int( (ceilingYEnd * ceilingTextureYscale) / ceilingTextureScale ) % ceilingTextureDimensions.y; //int( mod(ceilingYEnd * ceilingTextureYscale, float(ceilingTextureDimensions.y) ) );

          fragColor = texelFetch(ceilingTexture, ivec2(ceilingTileX, ceilingTileY), 0);
          return;


          fragColor = vec4(0., 0., 0., 1.);
          return;
        }

        if(data3.r == 1.) {
            float textureHeight = data3.b;

            int closestYCoord = int(round( (textureHeight / (-height+1.)) * (gl_FragCoord.y-(y + height)) ));

            switch(int(data3.a)) {
              // we are not allowed to use i as index to access texture in array in current version of GLSL
              ${new Array(this.maxTextures)
                .fill(0)
                .map(
                  (_, i) => `case ${i}:
                fragColor = data2.b * vec4(data1.b, data2.r, data2.g, 1.) + texelFetch(polygonTextures[${_}], ivec2(data3.g, closestYCoord), 0);
                return;
          
                break;
            `
                )
                .join("")}
              default: break;
            }
        }

        vec4 color = vec4(data1.b, data2.r, data2.g, data2.b);

      
        fragColor = color.rgba;
        return;

        

        // return reddish-purpl

        //fragColor = vec4(col, 1); // return reddish-purple
      }
    `;

    this.loadedTextureCount = [];

    this.program = createProgramFromSources(this.gl, [vs, fs2]);

    this.dataLocation = this.gl.getUniformLocation(this.program, "data");
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

    this.floorTextureDimensionLocation = this.gl.getUniformLocation(
      this.program,
      "floorTextureDimensions"
    );

    this.ceilingTextureDimensionLocation = this.gl.getUniformLocation(
      this.program,
      "ceilingTextureDimensions"
    );

    this.projectionPlaneCenterLocation = this.gl.getUniformLocation(
      this.program,
      "projectionPlaneCenter"
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

  #render(level, ray) {
    if (!ray.intersects) return; //contingency

    const polygon = ray.polygon;

    const x = ray.x;

    const distance = ray.distance; //  * degrees_to_radians(BETA); //ray.distance;

    //const fake = 600 / 2 / Math.tan(degrees_to_radians(this.camera.fov / 2));

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

    var color = polygon.color;

    if (level.lights.length > 0) {
      color = new Color(
        (polygon.color.r + lightColor.r * intensity) / 2,
        (polygon.color.g + lightColor.g * intensity) / 2,
        (polygon.color.b + lightColor.b * intensity) / 2
      );
    }

    const webglIndex = x * 3;

    if (
      (level.floorTexture.loaded || level.ceilingTexture.loaded) &&
      ray.closest
    ) {
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

      //!!!!

      var lastBottomOfWall = Math.floor(
        this.projectionPlaneCenter + offsetHeight / 2
      );

      var floorIterations = this.canvas.height - lastBottomOfWall;

      var lastTopOfWall = Math.floor(
        this.projectionPlaneCenter + offsetHeight / 2 - wallHeight //this.projectionPlaneCenter - offsetHeight / 2
      );

      //data4.r = 1;
      //data4.g = lastBottomOfWall;
      //data4.b = lastTopOfWall;
      //data4.a = this.projectionPlaneCenter;

      //data5.r = floorOffset;
      //data5.g = ceilingHeight;
      //data5.b = ray.angle;
      //data5.a = distanceToProjectionPlane;

      //data6.r = finalAngle;

      const fake = 600 / 2 / Math.tan(degrees_to_radians(this.camera.fov / 2));

      const fakeOffsetHeight =
        (this.floorOffset / distance / Math.cos(ray.angle)) * fake;

      //! CHANGED
      var lastBottomOfWallChanged = Math.floor(
        this.projectionPlaneCenter + fakeOffsetHeight / 2
      );

      this.webglData[this.resolution * 9 + webglIndex] = 1;
      this.webglData[this.resolution * 9 + webglIndex + 1] =
        lastBottomOfWall / 255;
      this.webglData[this.resolution * 9 + webglIndex + 2] =
        lastTopOfWall / 255;
      this.webglData[this.resolution * 9 + webglIndex + 3] =
        this.projectionPlaneCenter / 255;

      //! projectionPlaneCenter doesn't make any difference even if it's 1.

      this.webglData[this.resolution * 12 + webglIndex] =
        this.floorOffset / 255;
      this.webglData[this.resolution * 12 + webglIndex + 1] =
        level.ceilingHeight / 255;
      this.webglData[this.resolution * 12 + webglIndex + 2] = Math.cos(
        ray.angle
      );
      this.webglData[this.resolution * 12 + webglIndex + 3] =
        this.distanceToProjectionPlane / 255;

      //console.log(degrees_to_radians(ray.finalangle), ray.finalangle);
      //debugger;

      this.webglData[this.resolution * 15 + webglIndex] = degrees_to_radians(
        ray.finalangle
      );
      this.webglData[this.resolution * 15 + webglIndex + 1] =
        offsetHeight / 255;
      this.webglData[this.resolution * 15 + webglIndex + 2] = 0;
      this.webglData[this.resolution * 15 + webglIndex + 3] = 0;
    }

    this.webglData[webglIndex] =
      (this.projectionPlaneCenter + offsetHeight / 2 - wallHeight) / 255;
    this.webglData[webglIndex + 1] = wallHeight / 255;

    if (polygon.texture && polygon.texture.loaded) {
      var point = Math.floor(Vector2.distance(ray.lineSegment.start, ray.hit));

      const texture = polygon.texture.textureImage;

      if (polygon.texture.textureIndex === undefined) {
        //console.log("No bitches?", texture);
        imageToTexture(
          this.gl,
          texture,
          this.gl.TEXTURE0 + this.loadedTextureCount.length + 3
        );

        polygon.texture.textureIndex = this.loadedTextureCount.length;
        this.loadedTextureCount.push(this.loadedTextureCount.length + 3);
      }

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

      // this.ctx.drawImage(
      //   texture,
      //   textureX,
      //   0,
      //   1,
      //   textureHeight,
      //   x,
      //   this.projectionPlaneCenter + offsetHeight / 2 - wallHeight,
      //   1,
      //   wallHeight
      // );

      // if (level.lights.length > 0) {
      //   this.ctx.fillStyle = `rgba(${lightColor.r}, ${lightColor.g}, ${lightColor.b}, ${intensity})`;

      //   this.ctx.fillRect(
      //     x,
      //     this.projectionPlaneCenter + offsetHeight / 2 - wallHeight,
      //     1,
      //     wallHeight
      //   );
      // }

      this.webglData[this.resolution * 6 + webglIndex] = 1;
      this.webglData[this.resolution * 6 + webglIndex + 1] = textureX;
      this.webglData[this.resolution * 6 + webglIndex + 2] = textureHeight;
      this.webglData[this.resolution * 6 + webglIndex + 3] =
        polygon.texture.textureIndex; //! texture index.

      this.webglData[webglIndex + 2] = lightColor.r / 255;
      this.webglData[this.resolution * 3 + webglIndex] = lightColor.g / 255;
      this.webglData[this.resolution * 3 + webglIndex + 1] = lightColor.b / 255;
      this.webglData[this.resolution * 3 + webglIndex + 2] = intensity;

      //! needs lightColor.rgba to color the walls correctly.

      return; //! should be there normally
    }

    // this.webglData[webglIndex] =
    //   (this.projectionPlaneCenter + offsetHeight / 2 - wallHeight) / 255;
    // this.webglData[webglIndex + 1] = wallHeight / 255;

    this.webglData[webglIndex + 2] = color.r / 255;
    this.webglData[this.resolution * 3 + webglIndex] = color.g / 255;
    this.webglData[this.resolution * 3 + webglIndex + 1] = color.b / 255;
    this.webglData[this.resolution * 3 + webglIndex + 2] = color.a / 255;

    // this.ctx.fillRect(
    //   x,
    //   this.projectionPlaneCenter + offsetHeight / 2 - wallHeight,
    //   1,
    //   wallHeight //this.canvas.height - this.canvas.height * distanceFactor * 2
    // );
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

    this.webglData = new Float32Array(this.resolution * 18);

    const rays = this.camera.castRays(
      level,
      this.resolution,
      this.#render.bind(this)
    );

    storeDataInTexture(
      this.gl,
      this.webglData,
      this.resolution,
      6,
      this.gl.TEXTURE0,
      this.gl.RGB32F,
      this.gl.RGB
    );

    this.baseCtx.putImageData(this.baseSprite, 0, 0);
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

    this.gl.uniform1i(this.floorTextureLocation, 1);
    this.gl.uniform1i(this.ceilingTextureLocation, 2);

    this.gl.uniform1i(this.loadedTextureLocation, this.loadedTextureCount);

    this.gl.uniform1f(
      this.projectionPlaneCenterLocation,
      this.projectionPlaneCenter
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
