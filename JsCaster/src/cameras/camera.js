import { Ray } from "../math/ray.js";
import { LineSegment } from "../primitives/lineSegment.js";
import { Vector2 } from "../math/vector2.js";

class Camera {
  constructor(position, angle = 0, fov = 120, far = 1000) {
    this.position = position;

    this.far = far;
    this.angle = angle;
    this.fov = fov;
  }

  castRays(level, rays) {
    //raycount is the same a resolution.
    const start = this.angle - this.fov / 2;
    const end = this.angle + this.fov / 2;

    const increment = (end - start) / rays;

    const rayHits = [];

    const polygons = level.polygons;

    for (var i = 0; i < rays; i++) {
      const direction = start + increment * i;

      const ray = new Ray(this.position, direction, this.far);

      const rayInformation = {
        origin: this.position,
        direction: direction,
        intersects: false,
        hit: undefined,
        distance: undefined,
        ray: ray,
        normals: [],
        polygon: undefined,
        lineSegment: undefined,
        x: i,
      };

      //rayHits[i] = rayInformation;

      if (polygons.length === 0) continue;

      for (var j = 0; j < polygons.length; j++) {
        const polygon = polygons[j];
        const lineSegments = LineSegment.PolygonToLineSegments(polygon);

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

          rayInformation.polygon = polygon;
          rayInformation.lineSegment = lineSegment;

          rayInformation.intersects = true;
          rayInformation.hit = intersection.point;
          rayInformation.distance = distance;
          rayInformation.normals = intersection.normals; // a line segment has two sides and therefore two normals pointing in opposite directions
        }

        //return rayHits;
      }

      if (rayInformation.intersects) rayHits.push(rayInformation);
    }

    return rayHits;
  }
}

export { Camera };

//TODO: in renderer consider the normal of hitting rays and light them darker the higher the dot product is.
