import { Vector2 } from "../math/vector2.js";

class Sprite {
  constructor(
    position = new Vector2(0, 0),
    width = 100,
    height = 100,
    texture
  ) {
    this.position = position;
    this.texture = texture;
  }
}

export { Sprite };
