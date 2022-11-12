import { Vector2 } from "../math/vector2.js";

class LineSegment {
  constructor(start = new Vector2(), end = new Vector2(), index = undefined) {
    this.start = start;
    this.end = end;
    this.index = index;

    this.center = Vector2.add(
      this.start,
      Vector2.divide(Vector2.subtract(this.end, this.start), new Vector2(2, 2))
    );
  }

  get length() {
    return Vector2.distance(this.start, this.end);
  }

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
