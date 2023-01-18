import { Vector2 } from "../math/vector2.js";
import { Color } from "../primitives/color.js";

class DirectionalLight {
  constructor(color = new Color(255, 255, 255), degrees = 0, intensity = 0.1) {
    this.color = color;
    this.direction = degrees;
    this.intensity = intensity;
  }
}

export { DirectionalLight };
