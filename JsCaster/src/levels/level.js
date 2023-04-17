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
    this.cellSize = 30;

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

    this.polygons = [this.walls];
    this.sprites = [];
    this.lights = [];

    this.#addPolygonToGrid(this.walls, 0);

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
        this.grid[x].push([]);
      }
    }
  }

  // // const x = Math.floor(position.x / this.cellSize);
  // // const y = Math.floor(position.y / this.cellSize);
  // // this.

  //? add all the lineSegments in a polygon to the grid using the private function #addLineSegment
  #addPolygonToGrid(polygon, polygonIndex) {
    for (let i = 0; i < polygon.segments.length; i++) {
      this.#addLineSegmentToGrid(polygon.segments[i], i, polygonIndex);
    }
  }

  //? addPolygonToGrid but for sprites. Because it is dynamic maybe not actually..

  //? add all intersecting points to the grid of the line segment as an accessor to the line segment.
  #addLineSegmentToGrid(lineSegment, lineSegmentIndex, polygonIndex) {
    const x1 = Math.floor(lineSegment.start.x / this.cellSize);
    const y1 = Math.floor(lineSegment.start.y / this.cellSize);
    const x2 = Math.floor(lineSegment.end.x / this.cellSize);
    const y2 = Math.floor(lineSegment.end.y / this.cellSize);

    const normalizedDX = lineSegment.dx / lineSegment.length;
    const normalizedDY = lineSegment.dy / lineSegment.length;

    //? go through all cells that intersect the line segment and add the line segment to those cells.

    // // //?console.log(this.grid, x2, y2);
    // // for (let x = x1; x <= x2; x++) {
    // //   for (let y = y1; y <= y2; y++) {
    // //     this.grid[x][y].push({ lineSegmentIndex: lineSegmentIndex, polygonIndex: polygonIndex });
    // //   }
    // // }
  }

  //? Get all the line segments that might intersect with the ray based on the grid.
  getClosestLineSegmentsToRay(ray, searchRadius = 1) {
    //! DO NOT USE THIS CODE IT IS NOT COMPLETE
    const x1 = Math.floor(ray.lineSegment.start.x / this.cellSize);
    const y1 = Math.floor(ray.lineSegment.start.y / this.cellSize);
    const x2 = Math.floor(ray.lineSegment.end.x / this.cellSize);
    const y2 = Math.floor(ray.lineSegment.end.y / this.cellSize);

    if (searchRadius === 0) return this.grid[x1][y1];

    var lineSegments = [];

    for (let x = x1; x <= x2; x++) {
      for (let y = y1; y <= y2; y++) {
        //? loop through the searchRadius and get the surrounding line segments but don't check the same cells twice.
        lineSegments = [
          ...lineSegments,
          ...this.getClosestLineSegments(new Vector2(x, y), searchRadius),
        ];
      }
    }

    return lineSegments;

    //! DO NOT USE THIS CODE IT IS NOT COMPLETE
  }

  //? get all the closest line segment to the position using the grid.
  getClosestLineSegments(position, searchRadius = 1) {
    const x = Math.floor(position.x / this.cellSize);
    const y = Math.floor(position.y / this.cellSize);

    if (searchRadius === 0) return this.grid[x][y];

    var lineSegments = [];

    for (let i = -searchRadius; i <= searchRadius; i++) {
      for (let j = -searchRadius; j <= searchRadius; j++) {
        const x1 = x + i;
        const y1 = y + j;

        if (x1 < 0 || x1 >= this.grid.length) continue;
        if (y1 < 0 || y1 >= this.grid[x1].length) continue;

        lineSegments = [...lineSegments, ...this.grid[x1][y1]];

        //! I don't like this but I'll leave it for now
        // // for (let lineSegment of this.grid[x1][y1]) {
        // //   lineSegments.push(lineSegment.lineSegment);
        // // }
      }
    }

    return lineSegments;
    // }
    //   const x = Math.floor(position.x / this.cellSize);
    //   const y = Math.floor(position.y / this.cellSize);

    //   const lineSegments = this.grid[x][y];

    //   return lineSegments;
  }

  //? function for getting the closest polygon that uses the: getClosestLineSegments function.
  getClosestPolygons(position) {
    const lineSegments = this.getClosestLineSegments(position);

    const polygons = [];

    for (let lineSegment of lineSegments) {
      const polygon = this.polygons[lineSegment.index];
      if (polygon) polygons.push(polygon);
    }

    return polygons;
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
    //this.#addPolygonToGrid(polygon, this.polygons.length - 1);
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
