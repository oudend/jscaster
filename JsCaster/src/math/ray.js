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

    return intersectionInformation;
  }

  /**
   * Casts a ray and checks if it collides with a polygon or sprite.
   *
   * @static
   * @param {Level} level - Level to cast ray in.
   * @param {Ray} ray - Ray to cast.
   * @param {number} cameraAngle - Camera angle in degrees. Used to calculate line segments of sprites.
   * @param {function} polygonCallback - Callback for polygon collisions.
   * @param {function} spriteCallback - Callback for sprite collisions.
   * @param {boolean} [ignoreSprites=false] -  If true, ignores sprites.
   * @param {boolean} [limited=true] - If true, stops checking after collision in cell. (recommended)
   * @returns {{ polygon: { closest: { polygon: any; lineSegment: any; intersection: any; }; considered: {}; }; sprite: { ...; }; closest: any; }}
   */
  static castRay3(
    level,
    ray,
    cameraAngle,
    polygonCallback,
    spriteCallback,
    ignoreSprites = false,
    limited = true
  ) {
    const data = {
      polygon: {
        closest: {
          polygon: undefined,
          lineSegment: undefined,
          intersection: undefined,
        },
        considered: [],
      },
      sprite: {
        closest: {
          sprite: undefined,
          lineSegment: undefined,
          intersection: undefined,
        },
        considered: [],
      },
      closest: undefined,
    };

    var closestHitDistance = Infinity;

    // var direction = Vector2.fromAngle(ray.angle);
    // // console.log(level.grid);

    // direction = new Vector2(ray.lineSegment.dx, ray.lineSegment.dy).divide(
    //   ray.lineSegment.length
    // );

    const debugTs = [];

    var step = 0;

    var moveStep = false;

    level.traverseGrid(
      ray.origin,
      ray.lineSegment.end,
      (tile, debugT, debugC) => {
        const cell = level.grid[tile.x][tile.y];

        const lineSegments = cell.lineSegments;

        debugTs.push(debugT, debugC);

        if (lineSegments.length === 0) return false;

        var intersection = false;

        //? check the distance and select the actual closest thing

        Ray.rayCollides2(
          lineSegments,
          ray,
          (intersectionInformation, lineSegment, i) => {
            const polygon = cell.polygons[i];

            intersection = true;

            const distance = Vector2.distance(
              intersectionInformation.point,
              ray.origin
            );

            const lineSegmentData = {
              polygon: polygon,
              lineSegment: lineSegment,
              intersection: intersectionInformation,
              distance: distance,
            };

            debugTs.push(intersectionInformation.point, debugC);

            if (polygonCallback) polygonCallback(lineSegmentData, debugTs);

            data.polygon.considered.push(lineSegmentData);

            if (distance > closestHitDistance) return;

            data.polygon.closest = lineSegmentData;

            closestHitDistance = distance;
          }
        );

        if (closestHitDistance !== Infinity) {
          const intersectionPointTile = level
            .tileVector(data.polygon.closest.intersection.point)
            .subtract(1);

          //? if the intersection point isn't in the same tile then keep going.

          if (
            intersectionPointTile.x !== tile.x ||
            intersectionPointTile.y !== tile.y
          )
            return false;
        }

        //? temp
        // // if (intersection) moveStep = true;

        // // if (moveStep) step++;

        if (intersection && limited) {
          return true;
        }

        return false;
      }
    );

    data.closest = data.polygon.closest;

    if (ignoreSprites === true) return data;

    closestHitDistance = Infinity;

    for (var i = 0; i < level.sprites.length; i++) {
      const sprite = level.sprites[i];

      const lineSegment = sprite.getLineSegment(cameraAngle);

      const intersectionInformation = ray.intersects(lineSegment);

      if (!intersectionInformation.intersects) continue;

      const distance = Vector2.distance(
        intersectionInformation.point,
        ray.origin
      );

      const spriteData = {
        sprite: sprite,
        lineSegment: lineSegment,
        intersection: intersectionInformation,
        distance: distance,
      };

      if (spriteCallback) spriteCallback(spriteData);

      data.sprite.considered.push(spriteData);

      if (distance > closestHitDistance) continue;

      data.sprite.closest = spriteData;

      closestHitDistance = distance;
    }

    if (
      data.sprite.closest.distance < data.polygon.closest.distance ||
      data.polygon.closest.polygon === undefined
    )
      data.closest = data.sprite.closest;

    return data;
  }

  static rayCollides2(lineSegments, ray, callback) {
    for (var i = 0; i < lineSegments.length; i++) {
      const lineSegment = lineSegments[i];

      const intersectionInformation = ray.intersects(lineSegment);

      if (!intersectionInformation.intersects) continue;

      callback(intersectionInformation, lineSegment, i);
    }
  }

  static castRay2(level, ray, cameraAngle, ignoreSprites = false) {
    const currentPosition = ray.origin;
    const dirX = ray.lineSegment.dx;
    const dirY = ray.lineSegment.dy;
    //! make sure dx and dy are normalized or whatever they need to be.

    const endTile = level.tileVector(ray.lineSegment.end);

    const tile = level.tileVector(currentPosition);

    const dirSignX = dirX < 0 ? -1 : 1;
    const dirSignY = dirY < 0 ? -1 : 1;

    const tileOffsetX = dirX < 0 ? -1 : 0;
    const tileOffsetY = dirX < 0 ? -1 : 0;

    var dtX =
      ((tile.x + tileOffsetX) * level.cellSize - currentPosition.x) / dirX;
    var dtY =
      ((tile.y + tileOffsetY) * level.cellSize - currentPosition.y) / dirY;

    while (true) {
      var dt = 0;
      if (dtX < dtY) {
        dt = dtX;
        tile.x += dirSignX;
        dtX += (dirSignX * level.cellSize) / dirX - dt;
        dtY -= dt;
      } else {
        dt = dtY;
        tile.y += dirSignY;
        dtX += (dirSignY * level.cellSize) / dirY - dt;
        dtX -= dt;
      }

      if (
        tile.x < 0 ||
        tile.x > Math.floor(level.width / level.cellSize) ||
        tile.y < 0 ||
        tile.y > Math.floor(level.height / level.cellSize) ||
        Vector2.compare(tile, endTile)
      )
        break;

      const polygons = level.grid[tile.x][tile.y].polygons;

      const collision = Ray.rayCollides(
        ignoreSprites ? [] : level.sprites,
        polygons,
        cameraAngle,
        ray
      );

      if (collision.object !== undefined) {
        return collision;
      }
    }

    return undefined;
  }

  //?function that takes in an array of sprites and walls and a ray and returns what the ray intersects with.
  static rayCollides(sprites, polygons, cameraAngle, ray) {
    var closestObject = undefined;
    var closestHitDistance = Infinity;
    var closestIntersection = undefined;

    for (var i = 0; i < polygons.length; i++) {
      const polygon = polygons[i];
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
    if (sprites.length === 0) {
      return {
        object: closestObject,
        distance: closestHitDistance,
        intersection: closestIntersection,
      };
    }

    for (var j = 0; j < sprites.length; j++) {
      const sprite = sprites[j];

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

  //TODO: eventually make the camera use this.
  //! This is pretty horribly unoptimized but after the
  //! grid implementation it will be fine(r).
  /**
   * Description placeholder
   *
   * @static
   * @deprecated
   * @param {*} level
   * @param {*} ray
   * @param {*} cameraAngle
   * @param {boolean} [ignoreSprites=false]
   * @returns {{ object: any; distance: any; intersection: any; }}
   */
  static castRay(level, ray, cameraAngle, ignoreSprites = false) {
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

    if (ignoreSprites) {
      return {
        object: closestObject,
        distance: closestHitDistance,
        intersection: closestIntersection,
      };
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
