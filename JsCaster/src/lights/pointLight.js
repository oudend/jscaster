import { Vector2 } from "../math/vector2.js";
import { Color } from "../primitives/color.js";

/**
 * Class that represents a point light.
 *
 * @class PointLight
 * @typedef {PointLight}
 */
class PointLight {
  /**
   * Creates an instance of PointLight.
   *
   * @constructor
   * @param {Color} [color=new Color(255, 255, 255)] - The color of the light.
   * @param {Vector2} [position=new Vector2(0, 0)] - The position of the light.
   * @param {number} [intensity=0.1] - The intensity of the light.
   */
  constructor(
    color = new Color(255, 255, 255),
    position = new Vector2(0, 0),
    y = 0,
    intensity = 0.1
  ) {
    this.color = color;
    this.y = 0;
    this.position = position;
    this.intensity = intensity;
  }
}

export { PointLight };
