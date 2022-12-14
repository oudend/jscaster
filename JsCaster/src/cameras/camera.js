import { Ray } from "../math/ray.js";
import { LineSegment } from "../primitives/lineSegment.js";
import { Vector2 } from "../math/vector2.js";
import { degrees_to_radians } from "../utils.js";

class Camera {
  constructor(
    position,
    angle = 90, //TODO! switch to radians
    //verticalAngle = 0, //? remove. verticalOffset in renderer instead?
    fov = 60,
    far = 1000
  ) {
    this.position = position;

    this.far = far;
    this.angle = angle;
    this.verticalAngle = 0; //verticalAngle;
    this.fov = fov;
  }

  castRays(level, rays, onrayhit) {
    //raycount is the same a resolution.
    const start = this.angle - this.fov / 2;
    const end = this.angle + this.fov / 2;

    const forwardLength = rays / 2 / Math.tan(degrees_to_radians(this.fov / 2));

    const increment = (end - start) / rays;

    const rayHits = [];

    const polygons = level.polygons;

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
        distance: undefined,
        ray: ray,
        normals: [],
        polygon: undefined,
        lineSegment: undefined,
        x: i,
      };

      if (polygons.length === 0) break; //! test

      var closestHitDistance = Infinity;

      var transparencyData = [];
      var heightCandidates = [];
      var heightSort = false;

      for (var j = 0; j < polygons.length; j++) {
        const polygon = polygons[j];
        const lineSegments = polygon.segments;

        if (polygon.height != polygons[Math.max(0, j - 1)].height)
          heightSort = true;

        //return [];

        for (var k = 0; k < lineSegments.length; k++) {
          const lineSegment = lineSegments[k];

          const intersection = ray.intersects(lineSegment);

          if (!intersection.intersects) continue;

          const distance = Vector2.distance(intersection.point, this.position);

          const lineSegmentRayInformation = {
            origin: this.position,
            direction: direction,
            intersects: true,
            hit: intersection.point,
            angle: direction2,
            distance: distance,
            ray: ray,
            normal: intersection.normal,
            polygon: polygon,
            lineSegment: lineSegment,
            x: i,
          };

          transparencyData.push(lineSegmentRayInformation);
          heightCandidates.push(lineSegmentRayInformation);

          if (distance > rayInformation.distance && rayInformation.intersects)
            continue;

          if (distance > closestHitDistance) break;

          rayInformation = lineSegmentRayInformation;

          closestHitDistance = distance;
        }

        //if (rayInformation.intersects) rayHits.push(rayInformation);

        //return rayHits;
      }

      if (rayInformation.intersects) {
        if (rayInformation.polygon.texture.transparent) {
          const transparentPass = transparencyData.sort(
            (a, b) => b.distance - a.distance
          );

          for (var j = 0; j < transparentPass.length; j++) {
            var pass = transparentPass[j];

            if (onrayhit) onrayhit(level, pass);
            rayHits.push(pass);
          }
        } else if (heightSort) {
          const heightPrePass = heightCandidates.sort(
            (a, b) => a.distance - b.distance
          );

          const heightPass = [heightPrePass[0]];

          for (var j = 1; j < heightPrePass.length; j++) {
            if (
              heightPrePass[j].polygon.height >
              heightPass[heightPass.length - 1].polygon.height
            )
              heightPass.push(heightPrePass[j]);
          }

          for (var j = heightPass.length - 1; j > -1; j--) {
            var pass = heightPass[j];

            if (onrayhit) onrayhit(level, pass);
            rayHits.push(pass);
          }
        } else {
          if (onrayhit) onrayhit(level, rayInformation);
          rayHits.push(rayInformation);
        }
      }
    }

    return rayHits;
  }
}

export { Camera };

//TODO: in renderer consider the normal of hitting rays and light them darker the higher the dot product is.
