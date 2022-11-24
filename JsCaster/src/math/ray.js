import { Vector2 } from "./vector2.js";
import { LineSegment } from "../primitives/lineSegment.js";

class Ray {
  // it will be able to shoot a ray from one position to another and check if it collides with a polygon
  constructor(origin = new Vector2(), angle = new Vector2(), length = 100) {
    //produce a line segment

    this.angle = angle;
    this.length = length;

    const endx =
      origin.x + this.length * Math.cos((this.angle * Math.PI) / 180);
    const endy =
      origin.y + this.length * Math.sin((this.angle * Math.PI) / 180);

    const end = new Vector2(endx, endy);

    this.lineSegment = new LineSegment(origin, end);
  }

  intersects(lineSegment) {
    const intersectionInformation = {
      intersects: false,
      point: undefined,
      normal: undefined,
    };

    const denom =
      (lineSegment.end.y - lineSegment.start.y) *
        (this.lineSegment.end.x - this.lineSegment.start.x) -
      (lineSegment.end.x - lineSegment.start.x) *
        (this.lineSegment.end.y - this.lineSegment.start.y);
    if (denom == 0) {
      return intersectionInformation;
    }
    const ua =
      ((lineSegment.end.x - lineSegment.start.x) *
        (this.lineSegment.start.y - lineSegment.start.y) -
        (lineSegment.end.y - lineSegment.start.y) *
          (this.lineSegment.start.x - lineSegment.start.x)) /
      denom;
    const ub =
      ((this.lineSegment.end.x - this.lineSegment.start.x) *
        (this.lineSegment.start.y - lineSegment.start.y) -
        (this.lineSegment.end.y - this.lineSegment.start.y) *
          (this.lineSegment.start.x - lineSegment.start.x)) /
      denom;

    intersectionInformation.point = new Vector2(
      this.lineSegment.start.x +
        ua * (this.lineSegment.end.x - this.lineSegment.start.x),
      this.lineSegment.start.y +
        ua * (this.lineSegment.end.y - this.lineSegment.start.y)
    );

    intersectionInformation.intersects =
      ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;

    //https://stackoverflow.com/questions/1243614/how-do-i-calculate-the-normal-vector-of-a-line-segment

    // const dx = lineSegment.end.x - lineSegment.start.x;
    // const dy = lineSegment.end.y - lineSegment.start.y;

    //(-dy, dx) and (dy, -dx)

    const normal1 = new Vector2(-lineSegment.dy, lineSegment.dx);
    const normal2 = new Vector2(lineSegment.dy, -lineSegment.dx);

    var normal = normal1;

    if (
      Math.abs(normal1.degrees + this.angle) >
      Math.abs(normal2.degrees + this.angle)
    ) {
      normal = normal2;
    }

    intersectionInformation.normal = normal; //[normal1, normal2];

    // console.log(
    //   Math.abs(normal1.degrees - this.angle),
    //   Math.abs(normal2.degrees - this.angle)
    // );
    // throw new Error("herror");

    return intersectionInformation;
  }
}

export { Ray };
