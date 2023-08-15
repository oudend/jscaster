import { Vector2 } from "../math/vector2.js";
import { LineSegment } from "../primitives/lineSegment.js";
import { Polygon } from "../primitives/polygon.js";
import { TextureLoader } from "../loaders/textureLoader.js";
import { Color } from "../primitives/color.js";
import { BasicMaterial } from "../materials/basicMaterial.js";
import { v4 as uuidv4 } from "../../lib/uuid/dist/esm-browser/index.js";

/**
 * Class that represents a level.
 *
 * @class Level
 * @typedef {Level}
 */
class Level {
  /**
   * Creates an instance of Level.
   *
   * @constructor
   * @param {number} width - Width of the level in 2d space.
   * @param {number} height - Height of the level in 2d space.
   * @param {number} [ceilingHeight=100] - Height of the level in "3d" space.
   */
  constructor(width, height, ceilingHeight = 100, cellSize = 100) {
    this.width = width;
    this.height = height;
    this.ceilingHeight = ceilingHeight;

    this.uuid = uuidv4();

    this.grid = [];
    this.cellSize = cellSize;

    //! added through materials.
    this.materials = [];
    this.materialProperties = [];
    this.textures = [];
    this.textureUsers = [];

    this.#createGrid();

    this.walls = new Polygon(
      [
        new Vector2(0, 0),
        new Vector2(width, 0),
        new Vector2(width, height),
        new Vector2(0, height),
      ],
      ceilingHeight
    );

    this.polygons = [];
    this.sprites = [];
    this.lights = [];
    this.debug = [];

    this.addPolygon(this.walls);

    const material = new BasicMaterial(new Color(255, 0, 255, 255));

    this.floorMaterial = material;
    this.ceilingMaterial = material;

    this.floorMaterial.addToLevel(this);
    this.ceilingMaterial.addToLevel(this);

    this.updateTextures = true; //? this property will be accessed by the renderer which will update the loaded textures
  }

  /**
   * Forces material properties to reload and may occassionally fix material and texture issues
   */
  reloadMaterialProperties() {
    this.materialProperties = [];
    for (const material of this.materials) {
      this.materialProperties.push(...material.properties(this));
    }
  }

  /**
   * Updates the material properties for the specified material, used internally by materials.
   *
   * @param {*} material
   */
  updateMaterialProperties(material) {
    const materialIndex = this.materials.indexOf(material);

    this.materialProperties.splice(
      materialIndex * 13,
      13,
      ...material.properties(this)
    );
  }

  /**
   * Removes the specified material from the level and unloads any textures that aren't used by other materials.
   *
   * @param {*} material
   */
  removeMaterial(material) {
    const texture = material.texture;

    const textureIndex = this.textures.indexOf(texture);

    const materialIndex = this.materials.indexOf(material);

    const textureUsers = this.textureUsers[textureIndex];

    if (materialIndex === -1) return;

    if (textureIndex !== -1 && textureUsers === 1) {
      this.removeTexture(texture);
    } else if (textureIndex !== -1) textureUsers[textureIndex]--;

    for (let x = 0; x < this.materials.length; x++) {
      const material2 = this.materials[x];
      const materialTextureIndex = material2.getTextureIndex(this);
      const materialMaterialIndex = this.materials.indexOf(material2);
      if (materialTextureIndex > textureIndex && textureUsers === 1) {
        material2.setTextureIndex(this, materialTextureIndex - 1);
      }

      if (materialMaterialIndex > materialIndex) {
        material2.setMaterialIndex(this, materialMaterialIndex - 1);
      }
    }

    this.materials.splice(materialIndex, 1);
    this.materialProperties.splice(materialIndex * 13, 13);
  }

  /**
   * Removes the specified texture from the level.
   *
   * @param {*} texture
   */
  removeTexture(texture) {
    const textureIndex = this.textures.indexOf(texture);

    this.textures.splice(textureIndex, 1);
    this.textureUsers.splice(textureIndex, 1);
    this.updateTextures = true;
  }

  /**
   * Switches the texture for a specified material.
   *
   * @param {*} material
   * @param {*} texture
   */
  switchTexture(material, texture) {
    const textureIndex = material.getTextureIndex(this);
    this.textures[textureIndex] = texture;
    this.updateTextures = true;
  }

  /**
   * Adds the specified to the level which means it can be accessed by the renderer. Used internally by materials.
   *
   * @param {*} texture
   * @returns {Number}
   */
  addTexture(texture) {
    if (!texture) {
      return -1;
    }

    const textureIndex = this.textures.indexOf(texture);

    //? the exact same texture has already been added.
    if (textureIndex !== -1) {
      this.textureUsers[textureIndex]++;
      return textureIndex;
    }

    this.textures.push(texture);
    this.textureUsers.push(1);

    this.updateTextures = true;
    return this.textures.length - 1; //? index to access the texture
  }

  /**
   * Adds the specified material to the level. Used internally by materials.
   *
   * @param {*} material
   * @returns {{}}
   */
  addMaterial(material) {
    const texture = material.texture;

    const materialIndex = this.materials.indexOf(material);

    const textureIndex = this.addTexture(texture);

    if (materialIndex !== -1) return [textureIndex, materialIndex];

    this.materials.push(material);
    this.materialProperties.push(...[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

    return [textureIndex, this.materials.length - 1];
  }

  /**
   * Initializes the grid.
   */
  #createGrid() {
    for (let x = 0; x < Math.floor(this.width / this.cellSize) + 1; x++) {
      this.grid.push([]);
      for (let y = 0; y < Math.floor(this.height / this.cellSize) + 1; y++) {
        this.grid[x].push({ polygons: [], lineSegments: [], polygonIndex: [] });
      }
    }
  }

  /**
   * Adds a polygon to the grid.
   *
   * @param {*} polygon
   */
  #addPolygonToGrid(polygon) {
    for (let i = 0; i < polygon.segments.length; i++) {
      this.#addLineSegmentToGrid(polygon.segments[i], polygon);
    }
  }

  /**
   * Adds a LineSegment to the grid, used by addPolygonToGrid.
   *
   * @param {*} lineSegment
   * @param {*} polygon
   */
  #addLineSegmentToGrid(lineSegment, polygon) {
    this.traverseGrid(
      lineSegment.start,
      lineSegment.end,
      (tile, gridIntersection, worldTile) => {
        this.grid[tile.x][tile.y].polygons.push(polygon);
        this.grid[tile.x][tile.y].lineSegments.push(lineSegment);

        this.debug.push(gridIntersection, worldTile);
      }
    );
  }

  /**
   * Traverse all grid cells intersecting with the path from start to end.
   *
   * @param {Vector2} start - Start position.
   * @param {Vector2} end - End position.
   * @param {function(tile): tile} callback - Function that gets called for each grid cell that is intersected with the path.
   */
  traverseGrid(start, end, callback) {
    var current = new Vector2(start.x, start.y);

    var tile = this.tileVector(start);
    var endTile = this.tileVector(end);

    const direction = Vector2.subtract(end, start)
      .normalize()
      .multiply(new Vector2(1, 1));

    const tileOffsetX =
      (direction.x > 0 ? 1 : 0) -
      (direction.degrees < 270 && direction.degrees > 90 ? 0 : 1);
    const tileOffsetY =
      (direction.y > 0 ? 1 : 0) -
      (direction.degrees < 360 && direction.degrees > 180 ? 0 : 1);
    var dtX = 0;
    var dtY = 0;

    if (
      callback(
        Vector2.subtract(tile, new Vector2(1, 1)),
        current,
        new Vector2((tile.x - 1) * this.cellSize, (tile.y - 1) * this.cellSize)
      )
    )
      return;

    var dirSignX = direction.x > 0 ? 1 : -1;
    var dirSignY = direction.y > 0 ? 1 : -1;

    var t = 0;
    var maxT = Vector2.distance(start, end);

    while (true) {
      dtX =
        ((tile.x - 1 + tileOffsetX) * this.cellSize -
          current.x +
          (direction.x > 0 ? 1 : -1) * (this.cellSize / 2)) /
        direction.x;
      dtY =
        ((tile.y - 1 + tileOffsetY) * this.cellSize -
          current.y +
          (direction.y > 0 ? 1 : -1) * (this.cellSize / 2)) /
        direction.y;

      if (direction.x == 0) {
        dirSignX = 0;
        dtX = Infinity;
      }

      if (direction.y == 0) {
        dirSignY = 0;
        dtY = Infinity;
      }

      if (dtX < dtY) {
        t += dtX;
        tile.x += dirSignX;
      } else if (dtY < dtX) {
        t += dtY;
        tile.y += dirSignY;
      } else {
        t += dtY + dtX;

        tile.x += dirSignX;
        tile.y += dirSignY;
      }

      if (t >= maxT) return;

      current = new Vector2(
        start.x + direction.x * t,
        start.y + direction.y * t
      );

      if (
        tile.x < 1 ||
        tile.x > Math.floor(this.width / this.cellSize) + 1 ||
        tile.y < 1 ||
        tile.y > Math.floor(this.height / this.cellSize) + 1
      )
        return;

      if (
        callback(
          Vector2.subtract(tile, new Vector2(1, 1)),
          current,
          new Vector2(
            (tile.x - 1) * this.cellSize,
            (tile.y - 1) * this.cellSize
          )
        )
      )
        return;

      if (tile.x == endTile.x && tile.y == endTile.y) return;
    }
  }

  /**
   * Convert a 2d vector from world space to grid cell.
   *
   * @param {Vector2} position - 2d world coordinates.
   * @returns {Vector2}
   */
  tileVector(position) {
    return new Vector2(
      Math.floor((position.x + this.cellSize / 2) / this.cellSize) + 1,
      Math.floor((position.y + this.cellSize / 2) / this.cellSize) + 1
    );
  }

  /**
   * Returns whether or not the textures in the polygons of the level are fully loaded.
   *
   * @readonly
   * @type {boolean}
   */
  get texturesLoaded() {
    for (var polygon of this.polygons) {
      if (!polygon.material) continue;
      if (!polygon.material.texture) continue;
      if (!polygon.material.texture.loaded) return false;
    }

    return true;
  }

  /**
   * Returns center of the level.
   *
   * @readonly
   * @type {Vector2}
   */
  get center() {
    return new Vector2(this.width / 2, this.height / 2);
  }

  /**
   * Sets the floor material for the level.
   *
   * @param {*} material
   */
  setFloorMaterial(material) {
    material.addToLevel(this);
    this.floorMaterial = material;
  }

  /**
   * Sets the ceiling material for the level.
   *
   * @param {*} material
   */
  setCeilingMaterial(material) {
    material.addToLevel(this);
    this.ceilingMaterial = material;
  }

  /**
   * Adds polygon to the level.
   *
   * @param {Polygon} polygon - Polygon to add.
   * @returns {Polygon}
   */
  addPolygon(polygon) {
    this.polygons.push(polygon);
    polygon.material.addToLevel(this);
    polygon.levels.push(this);
    this.#addPolygonToGrid(polygon, this.polygons.length - 1);
    return polygon;
  }

  /**
   * Adds sprite to the level.
   *
   * @param {Sprite} sprite
   * @returns {Sprite}
   */
  addSprite(sprite) {
    sprite.levels.push(this);
    sprite.material.addToLevel(this);
    this.sprites.push(sprite);
    return sprite;
  }

  /**
   * Removes polygon from the level.
   *
   * @param {Polygon} polygon
   */
  removePolygon(polygon) {
    const levelIndex = polygon.levels.indexOf(this);
    polygon.levels.splice(levelIndex, 1);
    polygon.material.removePolygon(polygon);
    const index = this.polygons.indexOf(polygon);
    if (index > -1) this.polygons.splice(index, 1);
    //TODO: make sure it gets removed from the grid
    //this.#removePolygonFromGrid(polygon);
  }

  /**
   * Removes sprite from the level.
   *
   * @param {Sprite} sprite
   */
  removeSprite(sprite) {
    const levelIndex = sprite.levels.indexOf(this);
    sprite.levels.splice(levelIndex, 1);
    sprite.material.removeSprite(sprite);
    const index = this.sprites.indexOf(sprite);
    if (index > -1) this.sprites.splice(index, 1);
  }

  /**
   * Adds light to the level.
   *
   * @param {*} light - The light to add. Currently only supports DirectionalLight.
   */
  addLight(light) {
    this.lights.push(light);
    return light;
  }
}

export { Level };
