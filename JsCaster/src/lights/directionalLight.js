import { Vector2 } from "../math/vector2.js";

class DirectionalLight {
  constructor(color = [0, 255, 0], degrees = 0, intensity = 0.1) {
    this.color = color;
    this.direction = degrees;
    this.intensity = intensity;
  }
}

export { DirectionalLight };
