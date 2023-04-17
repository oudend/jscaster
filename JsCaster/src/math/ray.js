import { Vector2 } from "./vector2.js";
import { LineSegment } from "../primitives/lineSegment.js";

/**
 * Class for representing a ray.
 *
 * @class Ray
 * @typedef {Ray}
 */
class Ray {
  // it will be able to shoot a ray from one position to another and check if it collides with a polygon
  /**
   * Creates an instance of Ray.
   *
   * @constructor
   * @param {Vector2} [origin=new Vector2()] - Start of ray.
   * @param {Vector2} [angle=0] - angle of ray in degrees.
   * @param {number} [length=100] - Length of ray / how far it will shoot.
   */
  constructor(origin = new Vector2(), angle = 0, length = 100) {
    //produce a line segment

    this.origin = origin;
    this.angle = angle;
    this.length = length;

    const endx =
      origin.x + this.length * Math.cos((this.angle * Math.PI) / 180);
    const endy =
      origin.y + this.length * Math.sin((this.angle * Math.PI) / 180);

    const end = new Vector2(endx, endy);

    this.lineSegment = new LineSegment(origin, end);
  }

  static fromLineSegment(lineSegment) {
    const angle = Vector2.angleBetween(lineSegment.start, lineSegment.end);
    const length = Vector2.distance(lineSegment.start, lineSegment.end);

    return new Ray(lineSegment.start, angle, length);
  }

  /**
   * Checks where and if the ray intersects a lineSegment object.
   *
   * @param {LineSegment} lineSegment
   * @returns {{ intersects: boolean; point: Vector2; normal: number; }}
   */
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

  //TODO: eventually make the camera use this.
  //! This is pretty horribly unoptimized but after the
  //! grid implementation it will be fine(r).
  static castRay(level, ray, cameraAngle) {
    // const polygonsHit = [];
    // const spritesHit = [];

    var closestObject = undefined;
    var closestHitDistance = Infinity;
    var closestIntersection = undefined;

    for (var i = 0; i < level.polygons.length; i++) {
      const polygon = level.polygons[i];
      const lineSegments = polygon.segments;

      for (var j = 0; j < lineSegments.length; j++) {
        const lineSegment = lineSegments[j];

        const intersection = ray.intersects(lineSegment);

        if (!intersection.intersects) continue;

        //console.log(ray);

        const distance = Vector2.distance(intersection.point, ray.origin);

        //! might be important
        // if (distance > rayInformation.distance && rayInformation.intersects)
        //   continue;
        //! might be important

        if (distance > closestHitDistance) continue;

        closestObject = polygon;

        closestHitDistance = distance;
        closestIntersection = intersection;
      }
    }

    for (var j = 0; j < level.sprites.length; j++) {
      const sprite = level.sprites[j];

      const lineSegment = sprite.getLineSegment(cameraAngle);

      const intersection = ray.intersects(lineSegment);

      if (!intersection.intersects) continue;

      const distance = Vector2.distance(intersection.point, ray.origin);

      if (distance > closestHitDistance) continue;

      closestObject = sprite;

      closestIntersection = intersection;
      closestHitDistance = distance;
    }

    return {
      object: closestObject,
      distance: closestHitDistance,
      intersection: closestIntersection,
    };
  }
}

export { Ray };
