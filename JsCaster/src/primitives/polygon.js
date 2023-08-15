import { TextureLoader } from "../loaders/textureLoader.js";
import { Vector2 } from "../math/vector2.js";
import { Color } from "./color.js";
import { LineSegment } from "./lineSegment.js";
import { BasicMaterial } from "../materials/basicMaterial.js";

/**
 * Class for representing a polygon.
 *
 * @class Polygon
 * @typedef {Polygon}
 */
class Polygon {
  /**
   * Creates an instance of Polygon.
   *
   * @constructor
   * @param {[]} points - points that the polygon will consist of. Must have a minimum length of 3.
   * @param {number} [height=100] - Height of the polygon.
   * @param {*} material - Material of the polygon.
   */
  constructor(
    points,
    height = 100,
    material = new BasicMaterial(new Color(0, 0, 0, 0))
  ) {
    if (points.length < 3)
      throw new Error("Invalid number of points, must be more than 2");

    this.material = material;

    this.material.addPolygon(this);

    this.points = points;

    this.segments = LineSegment.PolygonToLineSegments(this);

    this.height = height; //In the future maybe add support for height to each point so when computing the height will be blended between them.

    this.textureLoader = undefined;

    this.segmentOffsets = [];

    this.levels = [];

    //! the fuck is this monstrosity???
    this.totalLength = this.segments.reduce(
      function (accumulator, segment) {
        this.segmentOffsets.push(accumulator + segment.length);
        return accumulator + segment.length;
      }.bind(this),
      0
    );
  }

  /**
   * Switches the material of the polygon.
   *
   * @param {*} material
   */

  //! BUGGED
  setMaterial(material) {
    this.material.removePolygon(this);

    material.addPolygon(this);

    for (const level of this.levels) {
      if (material.levels.indexOf(level) === -1) {
        material.addToLevel(level);
      }
    }

    this.material = material;
  }

  // addPoint(point) {
  //   this.points.push(point);
  //   this.segments = LineSegment.PolygonToLineSegments(this);
  //   this.totalLength = this.segments.reduce(function (accumulator, segment) {
  //     return accumulator + segment.length;
  //   }, 0);
  // }

  /**
   * Converts a list of line segments to a polygon.
   *
   * @static
   * @param {[LineSegment]} segments
   * @returns {*}
   */
  static fromLineSegments(segments) {
    const points = [];

    for (var i = 0; i < segments.length; i++) {
      points.push(segments[i].start);

      return segments;
    }
  }

  /**
   * Returns a polygon with a circle shape.
   *
   * @static
   * @param {Vector2} center - The center of the circle.
   * @param {number} [radius=60] - The radius of the circle.
   * @param {number} [edges=5] - The number of edges of the circle.
   * @param {number} [height=undefined] - The height of the polygon.
   * @returns {Polygon}
   */
  static circle(center, radius = 60, edges = 5, height = undefined, material) {
    var points = [];

    var n_angles = (2 * Math.PI) / edges;
    for (let i = 0; i < edges; i++) {
      let x = center.x + radius * Math.cos(i * n_angles);
      let y = center.y + radius * Math.sin(i * n_angles);
      points.push(new Vector2(x, y));
    }

    return new Polygon(points, height, material);
  }

  /**
   * Returns a polygon with a square shape.
   *
   * @static
   * @param {*} center - The center of the square.
   * @param {*} radius - The radius of the square.
   * @param {*} [height=undefined] - The height of the polygon.
   * @returns {Polygon}
   */
  static square(center, radius, height = undefined, material) {
    var points = [];

    points.push(new Vector2(center.x - radius, center.y + radius));
    points.push(new Vector2(center.x - radius, center.y - radius));
    points.push(new Vector2(center.x + radius, center.y - radius));
    points.push(new Vector2(center.x + radius, center.y + radius));

    return new Polygon(points, height, material);
  }
}

export { Polygon };
