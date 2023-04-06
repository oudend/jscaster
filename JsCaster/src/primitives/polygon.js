import { TextureLoader } from "../loaders/textureLoader.js";
import { Vector2 } from "../math/vector2.js";
import { Color } from "./color.js";
import { LineSegment } from "./lineSegment.js";
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
   */
  constructor(points, height = 100) {
    if (points.length < 3)
      throw new Error("Invalid number of points, must be more than 2");

    this.points = points;

    this.segments = LineSegment.PolygonToLineSegments(this);

    this.height = height; //In the future maybe add support for height to each point so when computing the height will be blended between them.

    this.color = new Color(0, 0, 200);

    this.textureLoader = undefined;

    this.segmentOffsets = [];

    this.totalLength = this.segments.reduce(
      function (accumulator, segment) {
        this.segmentOffsets.push(accumulator + segment.length);
        return accumulator + segment.length;
      }.bind(this),
      0
    );
  }

  // addPoint(point) {
  //   this.points.push(point);
  //   this.segments = LineSegment.PolygonToLineSegments(this);
  //   this.totalLength = this.segments.reduce(function (accumulator, segment) {
  //     return accumulator + segment.length;
  //   }, 0);
  // }

  /**
   * Sets the texture loader of the polygon which dictates the texture and how it is handled for the polygon.
   *
   * @param {TextureLoader} textureLoader
   * @returns {this}
   */
  setTextureLoader(textureLoader) {
    this.textureLoader = textureLoader;
    return this;
  }

  /**
   * Returns the textureLoader instance of the polygon.
   *
   * @readonly
   * @type {*}
   */
  get texture() {
    return this.textureLoader;
  }

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
}

Polygon.circle = function (center, radius = 60, edges = 5) {
  var points = [];

  var n_angles = (2 * Math.PI) / edges;
  for (let i = 0; i < edges; i++) {
    let x = center.x + radius * Math.cos(i * n_angles);
    let y = center.y + radius * Math.sin(i * n_angles);
    points.push(new Vector2(x, y));
  }

  return new Polygon(points);
};

Polygon.square = function (center, radius) {
  var points = [];

  points.push(new Vector2(center.x - radius, center.y + radius));
  points.push(new Vector2(center.x - radius, center.y - radius));
  points.push(new Vector2(center.x + radius, center.y - radius));
  points.push(new Vector2(center.x + radius, center.y + radius));

  return new Polygon(points);
};

export { Polygon };
