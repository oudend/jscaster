"use strict";

import Stats from "./stats.module.js";

var stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

function ValueNoise(values) {
  this.values = Array.isArray(values) ? values : this.generateValues();
  this.smooth = this.interpolate;
}
ValueNoise.prototype = {
  generateValues: function () {
    var result = [];
    for (var i = 0; i < 1234; i++) {
      result.push(Math.random() * 2 - 1); //Output is between -1.. 1
    }
    return result;
  },
  smoothstep: function (a, b, f) {
    var f = f * f * (3 - 2 * f);
    return a + f * (b - a);
  },
  interpolate: function (a, b, f) {
    var f = 0.5 - Math.cos(f * Math.PI) * 0.5;
    return a + f * (b - a);
  },
  getValue: function (x) {
    let max = this.values.length,
      ix = Math.floor(x),
      fx = x - ix, // "gradient"
      i1 = ((ix % max) + max) % max,
      i2 = (i1 + 1) % max;
    return this.smooth(this.values[i1], this.values[i2], fx);
  },
  getValueOctaves: function (x, octaves) {
    if (octaves < 2) {
      return this.getValue(x);
    }
    let result = 0,
      m,
      io,
      c,
      maxo = 1 << octaves,
      fract = 1 / (maxo - 1);
    for (var i = 1; i <= octaves; i++) {
      io = i - 1;
      m = fract * (1 << (octaves - i));
      result += this.getValue(x * (1 << io) + io * 0.1234) * m;
    }
    return result;
  },
};

var perlin = new ValueNoise();
//var y1 = perlin.getValue(x);
//var y2 = perlin.getValueOctaves(x, 4);

function storeDataInTexture(
  gl,
  data,
  width = 100,
  height = 1,
  activeTexture, // = gl.TEXTURE0,
  internalFormat, // = gl.R16F,
  format // = gl.RED
) {
  var texture = gl.createTexture();

  // use texture unit 0
  gl.activeTexture(activeTexture + 0);

  // bind to the TEXTURE_2D bind point of texture unit 0
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // fill texture with 3x2 pixels

  const level = 0;
  // const internalFormat = gl.R16F;
  //const width = data.length;
  //const height = 1;
  const border = 0;
  // const format = gl.RED;
  const type = gl.FLOAT;
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.texImage2D(
    gl.TEXTURE_2D,
    level,
    internalFormat,
    width,
    height,
    border,
    format,
    type,
    data
  );

  // set the filtering so we don't need mips
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  return texture;
}

function loadImage(url, callback) {
  var image = new Image();
  image.src = url;
  image.onload = callback;
  return image;
}

const glsl = (x) => x;

function main() {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  const canvas = document.getElementById("glcanvas");
  const gl = canvas.getContext("webgl2");
  if (!gl) {
    console.warn("Webgl is not supported by this device or browser");
    return;
  }

  const rayLength = 100; //16384;

  var rays = Float32Array.from({ length: rayLength }, () => Math.random());

  var raysRound = Float32Array.from({ length: rayLength }, () =>
    Math.round(Math.random())
  );

  var rays2 = Float32Array.from(
    { length: rayLength * 3 },
    (v, i) => (perlin.getValue(i) + 1) / 2
  );

  //console.log(rays2);

  canvas.style.width = `${rays.length}px`;
  canvas.style.height = `500px`;

  var vs = glsl`#version 300 es
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

  var fs = glsl`#version 300 es

    precision highp float;

    uniform float u_time;
    uniform vec2 u_resolution;
 
    // The texture.
    uniform sampler2D u_texture;
    uniform sampler2D u_texture2;

    out vec4 fragColor;
    in vec2 fragCoord;

    //uniform sampler2D

    void main() {
      // gl_FragColor is a special variable a fragment shader
      // is responsible for setting

      vec2 uv = gl_FragCoord.xy / u_resolution;

      //int test = int(gl_FragCoord.x);

      //vec3 col = 0.5 + 0.5*cos(u_time+uv.xyx+vec3(0,2,4));

      //float test2 = testArray[test];

      vec4 test3 = texelFetch(u_texture2, ivec2(gl_FragCoord.x, 0), 0);

      fragColor = vec4(vec3(test3.rgb), 1.); // return reddish-purpl

      //fragColor = vec4(col, 1); // return reddish-purple
    }
  `;

  storeDataInTexture(gl, rays, rays.length, 1, gl.TEXTURE0, gl.R16F, gl.RED);

  storeDataInTexture(
    gl,
    rays2,
    rays2.length / 3,
    1,
    gl.TEXTURE1,
    gl.RGB16F,
    gl.RGB
  );

  // fs = `#version 300 es

  //     // fragment shaders don't have a default precision so we need
  //     // to pick one. highp is a good default. It means "high precision"
  //     precision highp float;

  //     // we need to declare an output for the fragment shader
  //     out vec4 outColor;

  //     void main() {
  //       // Just set the output to a constant reddish-purple
  //       outColor = vec4(1, 0, 0.5, 1);
  //     }
  //   `;

  // setup GLSL program
  const program = webglUtils.createProgramFromSources(gl, [vs, fs]);

  const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  const timeLocation = gl.getUniformLocation(program, "u_time");
  const textureLocation = gl.getUniformLocation(program, "u_texture");
  const texture2Location = gl.getUniformLocation(program, "u_texture2");

  // look up where the vertex data needs to go.
  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");

  // Create a buffer to put three 2d clip space points in
  const positionBuffer = gl.createBuffer();

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // fill it with a 2 triangles that cover clipspace
  gl.bufferData(
    gl.ARRAY_BUFFER,
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
    gl.STATIC_DRAW
  );

  function render(time) {
    time *= 0.1;
    stats.begin();

    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
    gl.uniform1f(timeLocation, time);
    gl.uniform1i(textureLocation, 0);
    gl.uniform1i(texture2Location, 1);

    // Turn on the attribute
    gl.enableVertexAttribArray(positionAttributeLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    gl.vertexAttribPointer(
      positionAttributeLocation,
      2, // 2 components per iteration
      gl.FLOAT, // the data is 32bit floats
      false, // don't normalize the data
      0, // 0 = move forward size * sizeof(type) each iteration to get the next position
      0 // start at the beginning of the buffer
    );

    gl.drawArrays(
      gl.TRIANGLES,
      0, // offset
      6 // num vertices to process
    );

    // var rays2 = Float32Array.from({ length: rayLength * 3 }, () =>
    //   Math.random()
    // );

    var rays2 = Float32Array.from({ length: rayLength * 3 }, (v, i) =>
      perlin.getValue(Math.floor(i / 3 + time))
    );

    storeDataInTexture(
      gl,
      rays2,
      rays2.length / 3,
      1,
      gl.TEXTURE1,
      gl.RGB16F,
      gl.RGB
    );

    stats.end();

    window.requestAnimationFrame(render);
  }

  render(1);
}

main();
