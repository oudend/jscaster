import { Vector2 } from "../math/vector2.js";

class WebglRenderer {
  constructor(resolution = 100, camera) {
    this.resolution = resolution;
    this.camera = camera;

    this.canvas = document.createElement("canvas");
    this.gl = this.canvas.getContext("webgl");

    this.gl.imageSmoothingEnabled = false;

    this.canvas.width = resolution;

    this.floor = "grey";
    this.background = "orange";

    this.rays = null;

    // domElement.appendChild(this.canvas);

    // Set clear color to black, fully opaque
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // Clear the color buffer with specified clear color
    this.gl.clear(gl.COLOR_BUFFER_BIT);
  }
}

export { WebglRenderer };
