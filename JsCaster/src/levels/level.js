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
  constructor(width, height, ceilingHeight = 100) {
    this.width = width;
    this.height = height;
    this.ceilingHeight = ceilingHeight;

    this.grid = [];
    this.cellSize = 10;

    this.#createGrid();

    this.walls = new Polygon(
      [
        new Vector2(0, 0),
        new Vector2(width, 0),
        new Vector2(width, height),
        new Vector2(0, height),
        //new LineSegment(new Vector2(0, height), new Vector2(0, 0)),
      ],
      ceilingHeight //this.height
    );

    this.polygons = [];
    this.sprites = [];
    this.lights = [];

    this.addPolygon(this.walls);

    // this.#addPolygonToGrid(this.walls, 0);

    //console.log(this.getClosestLineSegments(new Vector2(0, 0), 1000), "hello");

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

  // // const x = Math.floor(position.x / this.cellSize);
  // // const y = Math.floor(position.y / this.cellSize);
  // // this.

  //? add all the lineSegments in a polygon to the grid using the private function #addLineSegment
  #addPolygonToGrid(polygon) {
    //, polygonIndex) {
    for (let i = 0; i < polygon.segments.length; i++) {
      this.#addLineSegmentToGrid(polygon.segments[i], polygon); //i, polygonIndex);
    }
  }

  //? add all intersecting points to the grid of the line segment as an accessor to the line segment.
  #addLineSegmentToGrid(lineSegment, polygon) {
    const centerTile = this.tileVector(lineSegment.center);
    this.grid[centerTile.x][centerTile.y].polygons.push(polygon);
    this.grid[centerTile.x][centerTile.y].lineSegments.push(lineSegment);

    this.traverseGrid(lineSegment.start, lineSegment.end, (tile) => {
      this.grid[tile.x][tile.y].polygons.push(polygon);
      this.grid[tile.x][tile.y].lineSegments.push(lineSegment);
      //? this.grid[tile.x][tile.y].lineSegments.push({lineSegment: lineSegment, polygonIndex: polygonIndex});
    });
  }

  #getHelpers(position, direction) {
    const tile = Math.floor(position / this.cellSize);

    var dTile = 0;
    var dt = 0;

    if (direction > 0) {
      dTile = 1;
      dt = ((tile + 1) * this.cellSize - position) / direction;
    } else {
      dTile = -1;
      dt = (tile * this.cellSize - position) / direction;
    }

    return [dt, (dTile * this.cellSize) / direction];
  }

  /**
   * Traverse all grid cells intersecting with the path from start to end.
   *
   * @param {Vector2} start - Start position.
   * @param {Vector2} end - End position.
   * @param {function(tile): tile} callback - Function that gets called for each grid cell that is intersected with the path.
   */
  traverseGrid(start, end, callback) {
    //! make sure dx and dy are normalized or whatever they need to be.

    const tile = this.tileVector(start);
    const endTile = this.tileVector(end);

    const direction = Vector2.subtract(end, start);

    var [dtX, ddtX] = this.#getHelpers(start.x, direction.x);
    var [dtY, ddtY] = this.#getHelpers(start.y, direction.y);

    callback(tile);

    const dirSignX = direction.x > 0 ? 1 : -1;
    const dirSignY = direction.y > 0 ? 1 : -1;

    if (direction.x === 0) dtX = Infinity;
    if (direction.y === 0) dtY = Infinity;

    if (direction.x ** 2 + direction.y ** 2 === 0) return;

    while (true) {
      if (dtX < dtY) {
        tile.x += dirSignX;
        dtY -= dtX;
        dtX = ddtX; //(dirSignX * this.cellSize) / direction.x;
      } else {
        tile.y += dirSignY;
        dtX -= dtY;
        dtY = ddtY; //(dirSignY * this.cellSize) / direction.y;
      }

      if (
        tile.x < 0 ||
        tile.x > Math.floor(this.width / this.cellSize) ||
        tile.y < 0 ||
        tile.y > Math.floor(this.height / this.cellSize)
      )
        break;

      if (callback(tile)) break;

      if (Vector2.compare(tile, endTile)) break;
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
      Math.floor(position.x / this.cellSize),
      Math.floor(position.y / this.cellSize)
    );
  }

  /**
   * Returns whether or not the textures in the polygons of the level are fully loaded.
   *
   * @readonly
   * @type {boolean}
   */
  get texturesLoaded() {
    // console.log("hello");

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
