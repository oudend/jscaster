import { Ray } from "../math/ray.js";
import { LineSegment } from "../primitives/lineSegment.js";
import { Vector2 } from "../math/vector2.js";
import { degrees_to_radians } from "../utils.js";

/**
 * A class for representing a camera.
 *
 * @class Camera
 * @typedef {Camera}
 */
class Camera {
  /**
   * Creates an instance of Camera.
   *
   * @constructor
   * @param {Vector2} position - The 2d position of the camera.
   * @param {number} [angle=90] - The 2d angle of the camera in degrees.
   * @param {number} [fov=60] - The Field of View of the camera.
   */
  constructor(
    position,
    angle = 90, //TODO! switch to radians
    //verticalAngle = 0, //? remove. verticalOffset in renderer instead?
    fov = 60,
    far = 10000
  ) {
    this.position = position;

    this.far = far; //far;
    this.angle = angle;
    this.verticalAngle = 0; //verticalAngle;
    this.fov = fov;

    this.heightSort = false;
  }

  /**
   * cast rays from camera.
   *
   * @param {Level} level
   * @param {Rays} rays
   * @param {function} onrayhit
   * @returns {[]}
   */
  castRays(level, rays, onrayhit) {
    const start = this.angle - this.fov / 2;
    const end = this.angle + this.fov / 2;

    const forwardLength = rays / 2 / Math.tan(degrees_to_radians(this.fov / 2));

    const increment = (end - start) / rays;

    const rayHits = [];

    this.intersectionPoints = [];

    const polygons = level.polygons;
    const sprites = level.sprites;

    if (polygons.length === 0) return;

    for (var i = 0; i < rays; i++) {
      const direction = start + increment * i;

      const direction2 = Math.atan((-rays / 2 + i) / forwardLength);

      const angle = this.angle + direction2 * (180 / Math.PI);

      const ray = new Ray(this.position, angle, this.far);

      var rayInformation = {
        origin: this.position,
        direction: direction,
        intersects: false,
        hit: undefined,
        angle: direction2,
        finalangle: angle,
        closest: true,
        distance: undefined,
        ray: ray,
        normals: [],
        polygon: undefined,
        lineSegment: undefined,
        x: i,
        canvasWall: false,
        spriteInfo: [],
        heightPass: [],
      };

      var closestHitDistance = Infinity;

      var transparencyData = [];
      var heightCandidates = [];
      //var heightSort = false;

      Ray.castRay3(
        level,
        ray,
        this.angle,
        (lineSegmentData, debugTs) => {
          const polygon = lineSegmentData.polygon;
          const lineSegment = lineSegmentData.lineSegment;
          const intersection = lineSegmentData.intersection;
          const distance = lineSegmentData.distance;

          this.intersectionPoints.push(...debugTs);

          const lineSegmentRayInformation = {
            origin: this.position,
            direction: direction,
            intersects: true,
            hit: intersection.point,
            angle: direction2,
            finalangle: angle,
            closest: true,
            distance: distance,
            ray: ray,
            normal: intersection.normal,
            polygon: polygon,
            lineSegment: lineSegment,
            x: i,
            spriteInfo: [],
            heightPass: [],
          };

          transparencyData.push(lineSegmentRayInformation);
          heightCandidates.push(lineSegmentRayInformation);

          if (distance > rayInformation.distance && rayInformation.intersects)
            return;

          if (distance > closestHitDistance) return;

          rayInformation = lineSegmentRayInformation;

          closestHitDistance = distance;
        },
        (spriteData) => {
          const sprite = spriteData.sprite;
          const lineSegment = spriteData.lineSegment;
          const intersection = spriteData.intersection;
          const distance = spriteData.distance;

          if (distance < closestHitDistance) {
            rayInformation.spriteInfo.push({
              distance: distance,
              hit: intersection.point,
              lineSegment: lineSegment,
              sprite: sprite,
            });
          }
        },
        false,
        !this.heightSort
      );

      if (rayInformation.spriteInfo.length > 1) {
        rayInformation.spriteInfo = rayInformation.spriteInfo.sort(
          (a, b) => a.distance - b.distance
        );
      }
      // here all the sprites will be sorted based on distance.

      const transparentPass = transparencyData.sort(
        (a, b) => b.distance - a.distance
      );

      if (!rayInformation.intersects) continue;

      //TODO: implement properly

      if (this.heightSort === true) {
        const heightPrePass = heightCandidates.sort(
          (a, b) => a.distance - b.distance
        );

        const heightPass = [heightPrePass[0]];

        for (var j = 1; j < heightPrePass.length; j++) {
          if (
            heightPrePass[j].polygon.height >
              heightPass[heightPass.length - 1].polygon.height &&
            heightPrePass[j].polygon.height > rayInformation.polygon.height
          )
            heightPass.push(heightPrePass[j]);
        }

        rayInformation.heightPass = heightPass;
      }

      if (onrayhit) onrayhit(level, rayInformation);
      rayHits.push(rayInformation);
    }
    return rayHits;
  }
}

export { Camera };
