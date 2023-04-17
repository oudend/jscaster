import { Vector2 } from "../math/vector2.js";
import { LineSegment } from "../primitives/lineSegment.js";
import { degrees_to_radians } from "../utils.js";

class Sprite {
  constructor(
    textureLoader,
    position = new Vector2(0, 0),
    y = 10,
    width = 100,
    height = 100,
    transparent = false
  ) {
    this.position = position;
    this.y = y;
    this.textureLoader = textureLoader;
    this.width = width;
    this.height = height;
    this.transparent = transparent;
  }

  getLineSegment(angle) {
    const leftDirection = Vector2.fromAngle(
      degrees_to_radians((angle - 90) % 360)
    );

    return new LineSegment(
      Vector2.multiply(leftDirection, this.width / 2).add(this.position),
      Vector2.multiply(leftDirection, -this.width / 2).add(this.position)
    );
  }

  get texture() {
    return this.textureLoader;
  }
}

export { Sprite };
