import { Vector2 } from "../jscaster.js";
import { LineSegment } from "../primitives/lineSegment.js";
import { Texture } from "../primitives/texture.js";
import { imagedata_to_image } from "../utils.js";

class TextureLoader {
  constructor(
    src,
    // polygon,
    transparent = false,
    scaleToFit = true,
    wrap = false,
    repeat = "no-repeat",
    scale = new Vector2(1, 1),
    transform = new Vector2(0, 0),
    angle = 0
  ) {
    this.src = src;
    this.scaleToFit = scaleToFit;
    this.wrap = wrap;
    // this.polygon = polygon;

    this.transparent = transparent;

    this.textureImage = undefined;
    this.texture = new Texture(
      this.src,
      undefined,
      undefined,
      this.#onload.bind(this),
      repeat,
      new DOMMatrix([
        Math.cos(angle) * scale.x,
        Math.sin(angle) * scale.x,
        -Math.sin(angle) * scale.y,
        Math.cos(angle) * scale.y,
        transform.x,
        transform.y,
      ])
    );

    this.data = null;

    this.loaded = false;
  }

  #onload(image) {
    this.textureImage = image;

    this.loaded = true;
  }
}

export { TextureLoader };
