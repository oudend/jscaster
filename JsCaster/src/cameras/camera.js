import { Ray } from "../math/ray.js";
import { LineSegment } from "../primitives/lineSegment.js";
import { Vector2 } from "../math/vector2.js";
import { degrees_to_radians } from "../utils.js";

class Camera {
  constructor(position, angle = 0, fov = 60, far = 1000) {
    this.position = position;

    this.far = far;
    this.angle = angle;
    this.fov = fov;

    //console.log(-(this.fov / 2) + 631);
  }

  castRays(level, rays, onrayhit) {
    //raycount is the same a resolution.
    const start = this.angle - this.fov / 2;
    const end = this.angle + this.fov / 2;

    const forwardLength = rays / 2 / Math.tan(degrees_to_radians(this.fov / 2));

    //console.log(forwardLength);

    const increment = (end - start) / rays;

    const rayHits = [];

    const polygons = level.polygons;

    for (var i = 0; i < rays; i++) {
      const direction = start + increment * i;

      const direction2 = Math.atan((-rays / 2 + i) / forwardLength);

      const angle = this.angle + direction2 * (180 / Math.PI);
      // console.log(-rays / 2 + i, i);

      const ray = new Ray(this.position, angle, this.far);

      const rayInformation = {
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

      //rayHits[i] = rayInformation;

      if (polygons.length === 0) continue;

      var closestHitDistance = Infinity;

      for (var j = 0; j < polygons.length; j++) {
        const polygon = polygons[j];
        const lineSegments = polygon.segments;

        //return [];

        for (var k = 0; k < lineSegments.length; k++) {
          const lineSegment = lineSegments[k];

          const intersection = ray.intersects(lineSegment);

          if (!intersection.intersects) {
            //! rayInformation.intersects = false; //IMPORTANT AS FUCK MAYBE?
            //rayHits[i] = rayInformation;
            continue;
          }

          const distance = Vector2.distance(intersection.point, this.position);

          if (distance > rayInformation.distance && rayInformation.intersects)
            continue;

          if (distance > closestHitDistance) break;

          rayInformation.polygon = polygon;
          rayInformation.lineSegment = lineSegment;

          rayInformation.intersects = true;
          rayInformation.hit = intersection.point;
          rayInformation.distance = distance;
          rayInformation.normals = intersection.normals; // a line segment has two sides and therefore two normals pointing in opposite directions

          closestHitDistance = distance;

          //if (onrayhit) onrayhit(level, rayInformation);

          //break;
        }

        //if (rayInformation.intersects) rayHits.push(rayInformation);

        //return rayHits;
      }

      if (rayInformation.intersects) {
        if (onrayhit) onrayhit(level, rayInformation);
        rayHits.push(rayInformation);
      }

      //if (rayInformation.intersects) rayHits.push(rayInformation);
    }

    return rayHits;
  }
}

export { Camera };

//TODO: in renderer consider the normal of hitting rays and light them darker the higher the dot product is.
