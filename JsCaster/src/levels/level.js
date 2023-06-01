import { Vector2 } from "../math/vector2.js";
import { LineSegment } from "../primitives/lineSegment.js";
import { Polygon } from "../primitives/polygon.js";
import { TextureLoader } from "../loaders/textureLoader.js";

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

    this.grid = [];
    this.cellSize = cellSize;

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

    this.floorTextureScale = new Vector2(1, 1);
    this.ceilingTextureScale = new Vector2(1, 1);

    this.floorTextureOffset = new Vector2(0, 0);
    this.ceilingTextureOffset = new Vector2(0, 0);

    this.floorTexture = {};
    this.ceilingTexture = {};
  }

  #createGrid() {
    for (let x = 0; x < Math.floor(this.width / this.cellSize) + 1; x++) {
      this.grid.push([]);
      for (let y = 0; y < Math.floor(this.height / this.cellSize) + 1; y++) {
        this.grid[x].push({ polygons: [], lineSegments: [], polygonIndex: [] });
      }
    }
  }

  #addPolygonToGrid(polygon) {
    for (let i = 0; i < polygon.segments.length; i++) {
      this.#addLineSegmentToGrid(polygon.segments[i], polygon);
    }
  }

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
      if (!polygon.texture) continue;
      if (!polygon.texture.loaded) return false;
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

  //? will load the json produced by the toJSON function and create a level from it.
  static fromJSON(json) {
    const level = new Level();

    //? loop through all values in the json object and assign the level to it.
    for (var key in json) {
      level[key] = json[key];
    }

    return level;
  }

  //? will produce json that stores the entire level in it and can be loaded by fromJSON.
  toJSON() {
    return {
      width: this.width,
      height: this.height,
      ceilingHeight: this.ceilingHeight,
      cellSize: this.cellSize,
      floorTexture: this.floorTexture,
      floorTextureScale: this.floorTextureScale,
      floorTextureOffset: this.floorTextureOffset,
      ceilingTexture: this.ceilingTexture,
      ceilingTextureScale: this.ceilingTextureScale,
      ceilingTextureOffset: this.ceilingTextureOffset,
      walls: this.walls,
      polygons: this.polygons,
      sprites: this.sprites,
      lights: this.lights,
    };
  }

  /**
   * Sets the floor texture of the level. If ignored no floor texture will be set.
   *
   * @param {string} src - Source of the image.
   * @param {Vector2} [scale=new Vector2(1, 1)] - Scale of the texture.
   */
  setFloorTexture(src, scale = new Vector2(1, 1), offset = new Vector2(0, 0)) {
    this.floorTexture = new TextureLoader(src);
    this.floorTextureScale = scale; //TODO: implement offset
    this.floorTextureOffset = offset;
  }

  /**
   * Sets the ceiling texture of the level. If ignored no floor texture will be set.
   *
   * @param {*} src - Source of the image.
   * @param {*} [scale=new Vector2(1, 1)] - Scale of the texture.
   */
  setCeilingTexture(
    src,
    scale = new Vector2(1, 1),
    offset = new Vector2(0, 0)
  ) {
    this.ceilingTexture = new TextureLoader(src);
    this.ceilingTextureScale = scale;
    this.ceilingTextureOffset = offset;
  }

  /**
   * Adds polygon to the level.
   *
   * @param {Polygon} polygon - Polygon to add.
   * @returns {Polygon}
   */
  addPolygon(polygon) {
    this.polygons.push(polygon);
    this.#addPolygonToGrid(polygon, this.polygons.length - 1);
    //console.log(this.grid);
    return polygon;
  }

  addSprite(sprite) {
    this.sprites.push(sprite);
    return sprite;
  }

  removePolygon(polygon) {
    const index = this.polygons.indexOf(polygon);
    if (index > -1) this.polygons.splice(index, 1);
    //this.#removePolygonFromGrid(polygon);
  }

  removeSprite(sprite) {
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
