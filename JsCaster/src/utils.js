function degrees_to_radians(degrees) {
  var pi = Math.PI;
  return degrees * (pi / 180);
}

function normalizeRadian(a) {
  var circle = Math.PI * 2;
  a = a % circle;
  if (a < 0) {
    a += circle;
  }
  return a;
}

function synchronousSleep(ms) {
  const start = Date.now();
  let now = start;
  while (now - start < ms) {
    now = Date.now();
  }
}

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

function imageToTexture(gl, image, activeTexture) {
  var texture = gl.createTexture();

  gl.activeTexture(activeTexture + 0);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the parameters so we can render any size image.
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  // Upload the image into the texture.
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  // set the filtering so we don't need mips
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  // add the texture to the array of textures.
  return texture;
}

function imagedata_to_image(imagedata) {
  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d");
  canvas.width = imagedata.width;
  canvas.height = imagedata.height;
  ctx.putImageData(imagedata, 0, 0);

  var image = new Image();
  image.src = canvas.toDataURL();
  return image;
}

export {
  storeDataInTexture,
  degrees_to_radians,
  imagedata_to_image,
  normalizeRadian,
  synchronousSleep,
  imageToTexture,
};
