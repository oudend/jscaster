import { Vector2 } from "../math/vector2.js";

/**
 * Class for representing a line segment between two points.
 *
 * @class LineSegment
 * @typedef {LineSegment}
 */
class LineSegment {
  /**
   * Creates an instance of LineSegment.
   *
   * @constructor
   * @param {Vector2} [start=new Vector2()] - First point of the line segment.
   * @param {Vector2} [end=new Vector2()] - Second point of the line segment.
   * @param {number} [index=undefined] - Index of the line segment, used internally to wrap textures around polygons.
   */
  constructor(start = new Vector2(), end = new Vector2(), index = undefined) {
    this.start = start;
    this.end = end;
    this.index = index;

    // this.center = Vector2.add(
    //   this.start,
    //   Vector2.divide(Vector2.subtract(this.end, this.start), new Vector2(2, 2))
    // );

    this.center = Vector2.divide(Vector2.add(this.start, this.end), 2);

    this.dx = this.end.x - this.start.x;
    this.dy = this.end.y - this.start.y;

    //TODO! these should be normalized lol

    this.length = Vector2.distance(this.start, this.end);
  }

  /**
   * Description placeholder
   *
   * @readonly
   * @type {*}
   */
  // get length() {
  //   return Vector2.distance(this.start, this.end);
  // }

  /**
   * Converts a polygon to a list of line segments.
   *
   * @static
   * @param {Polygon} polygon
   * @returns {[]}
   */
  static PolygonToLineSegments(polygon) {
    const segments = [];

    //segments.push(new LineSegment(polygon.points[0], polygon.points[1]));

    for (var i = 0; i < polygon.points.length - 1; i++) {
      segments.push(
        new LineSegment(polygon.points[i], polygon.points[i + 1], i)
      );
    }

    segments.push(
      new LineSegment(
        polygon.points[polygon.points.length - 1],
        polygon.points[0],
        polygon.points.length - 1
      )
    );

    return segments;
  }
}

export { LineSegment };
