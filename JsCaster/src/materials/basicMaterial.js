import { Color } from "../primitives/color.js";
import { Vector2 } from "../math/vector2.js";

/**
 * Class for materials.
 *
 * @class BasicMaterial
 * @typedef {BasicMaterial}
 */
class BasicMaterial {
  /**
   * Creates an instance of BasicMaterial.
   *
   * @constructor
   * @param {Color} [color=new Color(0, 0, 0, 255)]
   * @param {*} [texture=undefined]
   */
  constructor(
    color = new Color(0, 0, 0, 255),
    textureLoader = undefined,
    scale = new Vector2(1, 1),
    offset = new Vector2(0, 0),
    scaleToFit = false,
    wrap = false,
    useTexture = true
  ) {
    this.color = color;

    this.texture = undefined;

    this.textureLoaded = false;
    this.useTexture = useTexture;

    this.scale = scale;
    this.offset = offset;
    this.scaleToFit = scaleToFit;
    this.wrap = wrap;

    if (textureLoader) {
      this.setTextureLoader(textureLoader);
    }

    this.levels = []; //? shouldn't levels be specified in the constructor so you can load the material before adding to polygons?

    this.polygons = [];
    this.sprites = [];

    this.textureLevelIndex = {};

    this.crop = [new Vector2(0, 0), new Vector2(0, 0)];

    this.cropOverriden = false;

    this.data = undefined;

    //if (!this.texture) return;

    // for (const level of this.levels) {
    //   this.#addToLevel(level);
    // }

    //? maybe different textureLoader params for different textureLoaders? How would you switch between them then? Do materials even need different properties?
    //? Maybe the easiest solution is to just let textureLoaders handle polygons instead of the materials themselves.

    //! make textureLoaders ONLY load the textures and DO NOT pass them as an argument
    //! to anything. :) it will require a minor major rewrite. glhf

    //! make it possible to have multiple materials with the same texture but
    //! obviously only one texture needs to be loaded because they have the same one.
    //? maybe using a uuid for the texture object?
  }

  setTextureLoader(textureLoader) {
    this.textureLoaded = textureLoader.loaded;
    this.textureLoader = textureLoader;

    if (this.textureLoaded) {
      this.texture = textureLoader.textureImage;
      return;
    } else {
      textureLoader.listen((data, texture) => {
        //this.texture = textureLoader.textureImage;
        this.data = textureLoader.data;
        this.textureLoaded = true;
        this.setTexture(texture);
        //this.updateMaterialProperties();
      });
    }
  }

  //? maybe not the best solution?
  setColor(color) {
    this.color = color;
    this.updateMaterialProperties();
  }

  setScale(scale) {
    this.scale = scale;
    this.updateMaterialProperties();
  }

  setOffset(offset) {
    this.offset = offset;
    this.updateMaterialProperties();
  }

  setCrop(crop) {
    this.crop = crop;
    this.cropOverriden = true;
    this.updateMaterialProperties();
  }

  updateMaterialProperties() {
    for (const level of this.levels) {
      level.updateMaterialProperties(this);
      // // console.log(
      // //   level,
      // //   "updating material properties",
      // //   this.properties(level)
      // // );
      // // console.log(this.texture.width);
    }
  }

  properties(level) {
    //! add properties for using part of the texture and make the textureAtlas able to tell you what those parts are
    return [
      this.scale.x,
      this.scale.y,
      this.offset.x,
      this.offset.y, //this.crop[1].x
      this.textureLoaded ? this.crop[1].x : 0,
      this.textureLoaded ? this.crop[1].y : 0,
      this.textureLoaded && this.useTexture ? 1 : 0,
      this.color.r,
      this.color.g,
      this.color.b,
      this.textureLoaded ? this.getTextureIndex(level) : 0,
      this.crop[0].x,
      this.crop[0].y,
    ];
  }

  addPolygon(polygon) {
    this.polygons.push(polygon);
  }

  addSprite(sprite) {
    this.sprites.push(sprite);
  }

  removeSprite(sprite) {
    //? figure out which levels can be removed as they are no longer used.

    const levelsToRemove = [...this.levels];

    for (const subsprite of this.sprites) {
      if (subsprite === sprite) continue;

      for (const level of subsprite.levels) {
        const levelIndex = levelsToRemove.indexOf(level);
        levelsToRemove.splice(levelIndex, 1);
      }
    }

    for (const level of levelsToRemove) {
      this.removeFromLevel(level);
    }
  }

  removePolygon(polygon) {
    //? figure out which levels can be removed as they are no longer used.

    const polygonIndex = this.polygons.indexOf(polygon);

    if (polygonIndex === -1) {
      // console.log(polygon, this);
      throw new Error("polygon is not used by material");
    }

    //TODO? optimize eventually?
    const levelsToRemove = [...this.levels];

    for (const subpolygon of this.polygons) {
      if (subpolygon === polygon) continue;

      for (const level of subpolygon.levels) {
        const levelIndex = levelsToRemove.indexOf(level);
        levelsToRemove.splice(levelIndex, 1);
      }
    }

    console.log(levelsToRemove);

    for (const level of levelsToRemove) {
      this.removeFromLevel(level);
    }

    this.polygons.splice(polygonIndex, 1);
  }

  addToLevel(level) {
    //?console.log(level, this.textureLoaded, this);

    if (this.levels.indexOf(level) !== -1) {
      return;
    }

    this.levels.push(level);

    //if (this.textureLoaded)
    this.#addToLevel(level);
  }

  getTextureIndex(level) {
    return this.textureLevelIndex[level.uuid].texture;
  }

  setTextureIndex(level, value) {
    this.textureLevelIndex[level.uuid].texture = value;
  }

  getMaterialIndex(level) {
    return this.textureLevelIndex[level.uuid].material;
  }

  setMaterialIndex(level, value) {
    this.textureLevelIndex[level.uuid].material = value;
  }

  removeFromLevel(level) {
    const levelIndex = this.levels.indexOf(level);

    if (levelIndex === -1) {
      throw new Error("level does not exist");
    }

    this.levels.splice(levelIndex, 1);

    //if (this.textureLoaded)
    this.#removeFromLevel(level);
  }

  #removeFromLevel(level) {
    level.removeMaterial(this);

    //TODO? does it really need to do this?
    // // for (var key of Object.keys(this.textureLevelIndex)) {
    // //   if (this.textureLevelIndex[key] > this.textureLevelIndex[level.uuid])
    // //     this.textureLevelIndex[key]--;
    // // }

    delete this.textureLevelIndex[level.uuid];
  }

  #addToLevel(level) {
    const [textureIndex, materialIndex] = level.addMaterial(this);

    this.textureLevelIndex[level.uuid] = {
      texture: textureIndex,
      material: materialIndex,
    };

    level.updateMaterialProperties(this);
  }

  get textureImage() {
    return this.texture.image;
  }

  //? update
  setTexture(texture) {
    // const replaceTexture = !!this.texture;

    this.texture = texture;

    for (const level of this.levels) {
      //const replaceTexture =
      const replaceTexture =
        this.textureLevelIndex[level.uuid] !== undefined &&
        this.textureLevelIndex[level.uuid].texture !== -1;

      if (replaceTexture)
        level.switchTexture(this, texture); //this.removeFromLevel(level);
      else this.#addToLevel(level);
    }

    if (!this.cropOverriden)
      this.crop = [
        new Vector2(0, 0),
        new Vector2(this.texture.width, this.texture.height),
      ];
    this.updateMaterialProperties();
  }
}

export { BasicMaterial };
