import { Vector2 } from "../math/vector2.js";
import { LineSegment } from "../primitives/lineSegment.js";
import { degrees_to_radians } from "../utils.js";
import { BasicMaterial } from "../materials/basicMaterial.js";
import { Color } from "../primitives/color.js";

class Sprite {
  constructor(
    material = new BasicMaterial(new Color(0, 0, 0, 0)),
    position = new Vector2(0, 0),
    y = 10,
    width = 100,
    height = 100,
    transparent = false
  ) {
    this.position = position;
    this.y = y;
    this.material = material;
    this.width = width;
    this.height = height;
    this.transparent = transparent;

    this.levels = [];
  }

  /**
   * Switches the material of the sprite.
   *
   * @param {*} material
   */
  setMaterial(material) {
    this.material.removeSprite();

    material.addSprite(this);

    for (const level of this.levels) {
      if (material.indexOf(level) === -1) {
        material.addLevel(level);
      }
    }
    this.material = material;
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

  // get texture() {
  //   return this.textureLoader;
  // }
}

export { Sprite };
