import { createProgramFromSources } from "../../../lib/webgl-utils.js";

const maxTextures = 10;

var vs = /*glsl*/ `#version 300 es
      in vec4 a_position;

      void main() {

      gl_Position = a_position;
      }
    `;

function createProgram(gl, renderPass) {
  var fs2 =
    /*glsl*/ `#version 300 es
      precision highp float;

      precision highp sampler2DArray;

      #define numTextures ${maxTextures}

      uniform vec2 cameraPosition;
      
      uniform vec2 resolution;

      uniform sampler2D data;
      uniform sampler2D spriteData;
      uniform sampler2D floorAndCeilingData;

      uniform sampler2DArray textures2;

      uniform sampler2D textures[numTextures];

      uniform ivec2 levelDimensions;

      uniform int floorTextureLoaded;
      uniform int ceilingTextureLoaded;
      uniform int spriteCount;

      uniform float projectionPlaneCenter;
      uniform float distanceToProjectionPlane;

      uniform float materialProperties[1000]; // allows for 100 materials
      //? 0: firstParam, 1: secondParam, 2: new material firstParam...

      out vec4 fragColor;
      in vec2 fragCoord;

      //? 0 = wall, 1 = floor, 2 = ceiling, 3 = sprite
      vec4 renderPass(vec4 color, float distance, int renderType) {
        ` +
    (renderPass ? renderPass : "return color;") +
    /*glsl*/ `
      }
      
      vec4 getTexture(int index, ivec2 uv) {
        switch(index) {
          ` +
    new Array(maxTextures)
      .fill(0)
      .map(
        (_, i) => /*glsl*/ `case ${i}:
                          return texelFetch(textures[${i}], uv, 0);


                          break;
                      `
      )
      .join("") +
    /*glsl*/ `
              
      default: break;
        }

        return vec4(0);
      }

      void main() {

        vec4 wallInformation = texelFetch(data, ivec2(gl_FragCoord.x, 0), 0);

        int wallCount = int(wallInformation.r); //? surely not necessary

        vec4 firstData1 = texelFetch(data, ivec2(gl_FragCoord.x, 1), 0);

        vec4 lastData1 = texelFetch(data, ivec2(gl_FragCoord.x, 1 +  3 * (wallCount - 1) ), 0);

        float lastY = 0.;

        //! THIS SUCKS FIX THIS PLEASE I BEG OF YOU

        //? what it does:
        //? finds the polygon that uses the most screen space... tbc
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

        vec4 opacityColor = vec4(0., 0., 0., 0.);

        if(spriteCount > 0) {
          for(int i = 0; i < spriteCount; i++) {
            vec4 spriteData1 = texelFetch(spriteData, ivec2(gl_FragCoord.x, 0 + i * 2), 0);
            vec4 spriteData2 = texelFetch(spriteData, ivec2(gl_FragCoord.x, 1 + i * 2), 0);


            float isSprite = spriteData1.r;

            float textureX = spriteData1.g;
            float textureHeight = spriteData1.b;
            int materialIndex = int(spriteData2.r);
            float spriteHeight = spriteData1.a * 255.;
            float spriteY = resolution.y - spriteData2.g * 255.;
            bool isTransparent = spriteData2.b == 1. ? true : false;
            float distance = spriteData2.a * 255.;

            if(isSprite == 0.) 
              continue;

            if(gl_FragCoord.y > spriteY || gl_FragCoord.y < spriteY - spriteHeight)
              continue;

            vec2 textureScale = vec2(materialProperties[materialIndex * 13], materialProperties[materialIndex * 13 + 1]);
            vec2 textureOffset = vec2(materialProperties[materialIndex * 13 + 2], materialProperties[materialIndex * 13 + 3]);
            vec2 textureDimensions = vec2(materialProperties[materialIndex * 13 + 4], materialProperties[materialIndex * 13 + 5]);
            bool textureLoaded = materialProperties[materialIndex * 13 + 6] == 1.;
            vec3 materialColor = vec3(materialProperties[materialIndex * 13 + 7], materialProperties[materialIndex * 13 + 8], materialProperties[materialIndex * 13 + 9]);
            int textureIndex = int(materialProperties[materialIndex * 13 + 10]);
            vec2 cropPosition = vec2(materialProperties[materialIndex * 13 + 11], materialProperties[materialIndex * 13 + 12]);



            //TODO? Material properties can store the color and whether or not it has a texture so that rays don't need to.

            //? temporary solution.. DO NOT PUSH TO PROD

            vec4 spriteColor = vec4(materialColor, 1.);

            if(textureLoaded) {
              int closestYCoord = int(round( ((textureHeight) / (spriteHeight)) * (spriteHeight - (gl_FragCoord.y - (spriteY - spriteHeight)) ) ));

              ivec2 closestTextureCoord = ivec2( cropPosition + mod((vec2(textureX, closestYCoord) + textureOffset) / textureScale, textureDimensions));

              spriteColor = getTexture(textureIndex, closestTextureCoord);
            }
            
            if(spriteColor.a > 0.)
              spriteColor = renderPass(mix(spriteColor.rgba, vec4(opacityColor.r, opacityColor.g, opacityColor.b, 1.), opacityColor.a), distance, 3);

            fragColor = spriteColor;    
                          
            if(!(isTransparent && spriteColor.a < 1.))
              return;
      
            opacityColor += spriteColor;
          }
        }

        vec4 floorAndCeilingData1 = texelFetch(floorAndCeilingData, ivec2(gl_FragCoord.x, 0), 0);
        vec4 floorAndCeilingData2 = texelFetch(floorAndCeilingData, ivec2(gl_FragCoord.x, 1), 0);
        vec4 floorAndCeilingData3 = texelFetch(floorAndCeilingData, ivec2(gl_FragCoord.x, 2), 0);
        vec4 floorAndCeilingData4 = texelFetch(floorAndCeilingData, ivec2(gl_FragCoord.x, 3), 0);
        vec4 floorAndCeilingData5 = texelFetch(floorAndCeilingData, ivec2(gl_FragCoord.x, 4), 0);

        if(gl_FragCoord.y >= lastY || gl_FragCoord.y <= firstY + firstHeight - 1.) {
          bool isFloor = gl_FragCoord.y <= firstY;

          float lastBottomOfWall = floorAndCeilingData1.g * 255.;
          float lastTopOfWall = floorAndCeilingData1.b * 255.;
          float floorOffset = floorAndCeilingData2.r * 255.;
          float ceilingHeight = floorAndCeilingData2.g * 255.;
          float rayAngle = floorAndCeilingData2.b;
          float finalAngle = floorAndCeilingData3.r;
          float offsetHeight = floorAndCeilingData3.g * 255.;

          // // bool floorTextureLoaded = floorAndCeilingData3.b==1.;
          // // bool ceilingTextureLoaded = floorAndCeilingData3.a==1.;

          float row = lastBottomOfWall + ((firstY + firstHeight) - gl_FragCoord.y);

          float levelWidth = float(levelDimensions.x);
          float levelHeight = float(levelDimensions.y);

          int floorMaterialIndex = int(floorAndCeilingData3.b);
          int ceilingMaterialIndex = int(floorAndCeilingData3.a);

          float floorRatio = ((floorOffset) / (row - projectionPlaneCenter));

          float floorDiagonalDistance = ((distanceToProjectionPlane * floorRatio) * (1. / (rayAngle) ));

          vec2 floorTextureScale = vec2(materialProperties[floorMaterialIndex * 13], materialProperties[floorMaterialIndex * 13 + 1]);
          vec2 floorTextureOffset = vec2(materialProperties[floorMaterialIndex * 13 + 2], materialProperties[floorMaterialIndex * 13 + 3]);
          ivec2 floorTextureDimensions = ivec2(materialProperties[floorMaterialIndex * 13 + 4], materialProperties[floorMaterialIndex * 13 + 5]);
          bool floorTextureLoaded = materialProperties[floorMaterialIndex * 13 + 6] == 1.;
          vec3 floorMaterialColor = vec3(materialProperties[floorMaterialIndex * 13 + 7], materialProperties[floorMaterialIndex * 13 + 8], materialProperties[floorMaterialIndex * 13 + 9]);
          int floorTextureIndex = int(materialProperties[floorMaterialIndex * 13 + 10]);
          vec2 floorCropPosition = vec2(materialProperties[floorMaterialIndex * 13 + 11], materialProperties[floorMaterialIndex * 13 + 12]);

          // vec2 floorTextureOffset = vec2(0.,0.);
          // vec2 floorTextureScale = vec2(2.,2.);
          
          vec2 ceilingTextureScale = vec2(materialProperties[ceilingMaterialIndex * 13], materialProperties[ceilingMaterialIndex * 13 + 1]);
          vec2 ceilingTextureOffset = vec2(materialProperties[ceilingMaterialIndex * 13 + 2], materialProperties[ceilingMaterialIndex * 13 + 3]);
          ivec2 ceilingTextureDimensions = ivec2(materialProperties[ceilingMaterialIndex * 13 + 4], materialProperties[ceilingMaterialIndex * 13 + 5]);
          bool ceilingTextureLoaded = materialProperties[ceilingMaterialIndex * 13 + 6] == 1.;
          vec3 ceilingMaterialColor = vec3(materialProperties[ceilingMaterialIndex * 13 + 7], materialProperties[ceilingMaterialIndex * 13 + 8], materialProperties[ceilingMaterialIndex * 13 + 9]);
          int ceilingTextureIndex = int(materialProperties[ceilingMaterialIndex * 13 + 10]);
          vec2 ceilingCropPosition = vec2(materialProperties[ceilingMaterialIndex * 13 + 11], materialProperties[ceilingMaterialIndex * 13 + 12]);

          // vec2 ceilingTextureOffset = vec2(0.,0.);
          // vec2 ceilingTextureScale = vec2(2.,2.);

          fragColor = renderPass( mix( vec4(floorMaterialColor, 1.), vec4(opacityColor.r, opacityColor.g, opacityColor.b, 1.), opacityColor.a), floorDiagonalDistance, 1);

          if(isFloor && floorTextureLoaded){

            float floorXEnd = (floorDiagonalDistance * cos(finalAngle));
            float floorYEnd = (floorDiagonalDistance * sin(finalAngle));

            float floorTextureTranslationXscale = 2.;
            float floorTextureTranslationYscale = 2.;

            floorXEnd += cameraPosition.x * floorTextureTranslationXscale; 
            floorYEnd += cameraPosition.y * floorTextureTranslationYscale; 
            
            float floorTextureXscale = ( float(floorTextureDimensions.x) / (levelWidth * 1.)) * 0.5;
            float floorTextureYscale = ( float(floorTextureDimensions.y) / (levelHeight * 1.)) * 0.5;

            int floorTileX = int( abs(floorXEnd * floorTextureXscale + floorTextureOffset.x) / floorTextureScale.x ) % floorTextureDimensions.x;
            int floorTileY = int( abs(floorYEnd * floorTextureYscale + floorTextureOffset.y) / floorTextureScale.y ) % floorTextureDimensions.y;

            fragColor = renderPass(mix( getTexture(floorTextureIndex, ivec2(floorTileX, floorTileY)), vec4(opacityColor.r, opacityColor.g, opacityColor.b, 1.), opacityColor.a), floorDiagonalDistance, 1);

          }
          if(isFloor)
            return;

          float ceilingRatio = (ceilingHeight * 2. - floorOffset) / (projectionPlaneCenter - row);

          float ceilingDiagonalDistance = ((distanceToProjectionPlane * ceilingRatio) * (1.0 / rayAngle));

          fragColor = renderPass( mix( vec4(ceilingMaterialColor, 1.), vec4(opacityColor.r, opacityColor.g, opacityColor.b, 1.), opacityColor.a), ceilingDiagonalDistance, 2);

          if(!ceilingTextureLoaded) {
            return;
          }

          float ceilingYEnd = (ceilingDiagonalDistance * sin(finalAngle));
          float ceilingXEnd = (ceilingDiagonalDistance * cos(finalAngle));

          float ceilingTextureTranslationXscale = 2.;
          float ceilingTextureTranslationYscale = 2.;
          
          ceilingXEnd += cameraPosition.x * ceilingTextureTranslationXscale;
          ceilingYEnd += cameraPosition.y * ceilingTextureTranslationYscale;

          float ceilingTextureXscale = float(ceilingTextureDimensions.x) / (levelWidth * 1.) * 0.5;
          float ceilingTextureYscale = float(ceilingTextureDimensions.y) / (levelHeight * 1.) * 0.5;

          int ceilingTileX = int( abs(ceilingXEnd * ceilingTextureXscale + ceilingTextureOffset.x) / ceilingTextureScale.x ) % ceilingTextureDimensions.x; //int( mod(ceilingXEnd * ceilingTextureXscale, float(ceilingTextureDimensions.x) ) ); 
          int ceilingTileY = int( abs(ceilingYEnd * ceilingTextureYscale + ceilingTextureOffset.y) / ceilingTextureScale.y ) % ceilingTextureDimensions.y; //int( mod(ceilingYEnd * ceilingTextureYscale, float(ceilingTextureDimensions.y) ) );

          fragColor = renderPass(mix( getTexture(ceilingTextureIndex, ivec2(ceilingTileX, ceilingTileY)) + opacityColor * opacityColor.a, vec4(opacityColor.r, opacityColor.g, opacityColor.b, 1.), opacityColor.a), ceilingDiagonalDistance, 2);

        }

        for(int i = 0; i < wallCount; i++) {
          vec4 data1 = texelFetch(data, ivec2(gl_FragCoord.x, 1 + 3 * i ), 0);
          vec4 data2 = texelFetch(data, ivec2(gl_FragCoord.x, 2 + 3 * i ), 0);
          vec4 data3 = texelFetch(data, ivec2(gl_FragCoord.x, 3 + 3 * i ), 0);

          float distance = data1.a * 255.;
        
          float y = resolution.y - data1.r * 255.;
          float height = -(data1.g * 255.);

          if(gl_FragCoord.y >= y || gl_FragCoord.y <= y + height - 1.) {
            continue;
          }

          int materialIndex = int(data3.a);

          vec2 textureScale = vec2(materialProperties[materialIndex * 13], materialProperties[materialIndex * 13 + 1]);
          vec2 textureOffset = vec2(materialProperties[materialIndex * 13 + 2], materialProperties[materialIndex * 13 + 3]);
          vec2 textureDimensions = vec2(materialProperties[materialIndex * 13 + 4], materialProperties[materialIndex * 13 + 5]);
          bool textureLoaded = materialProperties[materialIndex * 13 + 6] == 1.;
          vec3 materialColor = vec3(materialProperties[materialIndex * 13 + 7], materialProperties[materialIndex * 13 + 8], materialProperties[materialIndex * 13 + 9]);
          int textureIndex = int(materialProperties[materialIndex * 13 + 10]);

          if(textureLoaded) {
            float textureHeight = data3.b;

            int closestYCoord = int(round( ((textureHeight) / (-height+4.)) * (-height+1. - (gl_FragCoord.y-(y + height))) ));

            //int textureIndex = int(data3.a);

            ivec2 closestTextureCoord = ivec2( mod((vec2(data3.g, closestYCoord) + textureOffset) / textureScale, textureDimensions));

            fragColor = renderPass( mix(data2.b * vec4(data1.b, data2.r, data2.g, 1.) + getTexture(textureIndex, closestTextureCoord), vec4(opacityColor.r, opacityColor.g, opacityColor.b, 1.), opacityColor.a), distance, 0);
            return;
          }

          //vec4 color = vec4(data1.b, data2.r, data2.g, data2.b);

          fragColor = renderPass(mix(vec4(materialColor.rgb, 1.), vec4(opacityColor.r, opacityColor.g, opacityColor.b, 1.), opacityColor.a), distance, 0);
          return;
        }
        
      }
    `;

  const program = createProgramFromSources(gl, [vs, fs2]);

  program.dataLocation = gl.getUniformLocation(program, "data");
  program.spriteDataLocation = gl.getUniformLocation(program, "spriteData");

  program.materialPropertiesLocation = gl.getUniformLocation(
    program,
    "materialProperties"
  );

  program.floorAndCeilingDataLocation = gl.getUniformLocation(
    program,
    "floorAndCeilingData"
  );

  program.loadedTextureLocation = gl.getUniformLocation(program, "textures");
  program.cameraPositionLocation = gl.getUniformLocation(
    program,
    "cameraPosition"
  );
  program.floorTextureLocation = gl.getUniformLocation(program, "floorTexture");
  program.ceilingTextureLocation = gl.getUniformLocation(
    program,
    "ceilingTexture"
  );

  program.ceilingTextureScaleLocation = gl.getUniformLocation(
    program,
    "ceilingTextureScale"
  );
  program.floorTextureScaleLocation = gl.getUniformLocation(
    program,
    "floorTextureScale"
  );

  program.ceilingTextureOffsetLocation = gl.getUniformLocation(
    program,
    "ceilingTextureOffset"
  );
  program.floorTextureOffsetLocation = gl.getUniformLocation(
    program,
    "floorTextureOffset"
  );
  program.spriteCountLocation = gl.getUniformLocation(program, "spriteCount");

  program.projectionPlaneCenterLocation = gl.getUniformLocation(
    program,
    "projectionPlaneCenter"
  );

  program.distanceToProjectionPlaneLocation = gl.getUniformLocation(
    program,
    "distanceToProjectionPlane"
  );

  program.resolutionLocation = gl.getUniformLocation(program, "resolution");

  program.levelDimensionLocation = gl.getUniformLocation(
    program,
    "levelDimensions"
  );

  program.floorTextureLoadedLocation = gl.getUniformLocation(
    program,
    "floorTextureLoaded"
  );
  program.ceilingTextureLoadedLocation = gl.getUniformLocation(
    program,
    "ceilingTextureLoaded"
  );

  return program;
}

export { createProgram };
