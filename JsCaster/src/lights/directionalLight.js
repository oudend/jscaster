import { Vector2 } from "../math/vector2.js";

class DirectionalLight {
  constructor(position, direction, intensity) {
    this.position = position;
    this.direction = direction;
    this.intensity = intensity;
  }
}
