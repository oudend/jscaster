import { Vector2 } from "../math/vector2.js";
import { Color } from "../primitives/color.js";

/**
 * Class that represents a directional light.
 *
 * @class DirectionalLight
 * @typedef {DirectionalLight}
 */
class DirectionalLight {
  /**
   * Creates an instance of DirectionalLight.
   *
   * @constructor
   * @param {Color} [color=new Color(255, 255, 255)] - The color of the light.
   * @param {number} [degrees=0] - The direction of the light in degrees.
   * @param {number} [intensity=0.1] - The intensity of the light.
   */
  constructor(color = new Color(255, 255, 255), degrees = 0, intensity = 0.1) {
    this.color = color;
    this.direction = degrees;
    this.intensity = intensity;
  }
}

export { DirectionalLight };
