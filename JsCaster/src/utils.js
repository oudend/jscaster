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

export { degrees_to_radians, imagedata_to_image, normalizeRadian, synchronousSleep };
