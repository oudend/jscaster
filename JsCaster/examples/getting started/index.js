//https://stackoverflow.com/questions/22842691/what-is-the-meaning-of-the-dist-directory-in-open-source-projects
import {
  CanvasRenderer,
  Camera,
  Vector2,
  LevelHelper,
  RendererHelper,
  WebglRenderer,
  Ray,
} from "../../src/jscaster.js";

//!documentation build --document-exported ./JsCaster/src/jscaster.js -f html -o ./JsCaster/docs

import { degrees_to_radians } from "../../src/utils.js";

import { exampleLevel } from "../levels/exampleLevel.js";

import Stats from "../../lib/stats.module.js";

const renderPass = /*glsl*/ `
return vec4( (vec3(min(1., 500./distance))) * color.rgb, color.a);
`;

const camera = new Camera(new Vector2(1, 1), 40, 120, 100000);

const renderer = new WebglRenderer(1200, 1200, camera, renderPass);

//renderer.canvas.style.width = `${200}px`;
//renderer.canvas.style.height = `${300}px`;

renderer.dom = document.body;

// renderer.canvas.height = 500;
renderer.canvas.style.width = `${window.innerWidth}px`;
renderer.canvas.style.height = `${window.innerHeight}px`;

const levelHelper = new LevelHelper(exampleLevel, true);
const rendererHelper = new RendererHelper(renderer, exampleLevel, true);

document.body.appendChild(levelHelper.canvas);

renderer.render(exampleLevel);

// levelHelper.render();
rendererHelper.render();

rendererHelper.canvas.classList.add("minimap");

var stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

var turnSpeed = 2;

var keys = {};

//var count = 0;

var speed = 0;

requestAnimationFrame(animate);

function animate() {
  renderer.render(exampleLevel);

  moveCamera();
  stats.begin();
  rendererHelper.render();
  stats.end();

  //exampleLevel.floorTextureOffset.add(new Vector2(1, 1));
  //exampleLevel.ceilingTextureOffset.subtract(new Vector2(1, 1));

  requestAnimationFrame(animate);
}

// console.clear();

function moveCamera() {
  Object.entries(keys).forEach(([key, value]) => {
    if (!value) return;

    speed = 2;

    switch (key) {
      case "w":
        camera.position.add(
          Vector2.fromAngle(degrees_to_radians(camera.angle)).multiply(speed)
        );
        break;
      case "s":
        camera.position.add(
          Vector2.fromAngle(degrees_to_radians(camera.angle - 180)).multiply(
            speed
          )
        );
        break;
      case "a":
        camera.position.add(
          Vector2.fromAngle(degrees_to_radians(camera.angle - 90)).multiply(
            speed
          )
        );
        break;
      case "d":
        camera.position.add(
          Vector2.fromAngle(degrees_to_radians(camera.angle + 90)).multiply(
            speed
          )
        );
        break;
      case " ":
        const rayData = Ray.castRay3(
          exampleLevel,
          new Ray(camera.position, camera.angle, 1000),
          camera.angle,
          undefined,
          undefined,
          false,
          true
        );
        console.log(rayData);
        break;
      case "ArrowRight":
        camera.angle += turnSpeed;
        break;
      case "ArrowLeft":
        camera.angle -= turnSpeed;
        if (camera.angle < 0) camera.angle = 359;
        break;
      case "ArrowUp":
        camera.verticalAngle += turnSpeed * 4;
        break;
      case "ArrowDown":
        camera.verticalAngle -= turnSpeed * 4;
        break;
      case "g":
        renderer.floorOffset -= 2;
        break;
      case "t":
        renderer.floorOffset += 2;
        break;
      case "h":
        camera.fov -= 1;
        renderer.recalculateDistanceToProjectionPlane();
        break;
      case "y":
        camera.fov += 1;
        renderer.recalculateDistanceToProjectionPlane();
        break;
      case "0":
        exampleLevel.sprites[0].textureLoader.setTextureLoader(0);
        break;
      case "1":
        exampleLevel.sprites[0].textureLoader.setTextureLoader(1);
        break;
      //! won't work correctly because things like directionToProjectionPLane in the renderer would need to be recalculated
    }

    camera.fov = Math.min(Math.max(camera.fov, 10), 170);

    camera.angle = camera.angle % 360;
  });
}

document.addEventListener("keydown", (event) => {
  var key = event.key;

  keys[key] = true;
});

document.addEventListener("keyup", (event) => {
  var key = event.key;

  keys[key] = false;
});

//! PLAN

//1. Move rayInformation from camera to ray.js if possible. ( At least make ray.js return only necessary information ).
//2. Clean up code in general.
//3. Darken color based on distance from camera.
//4. Figure out normal for ray hits and include in ray.js
//5. Darken color based on dot product between ray and its normal.

//! IMPORTANT

//NOW. Jsdoc for documentation
//NOW. Sample game.
//1. Make sure to only pass intersecting rays to the renderer so it doesn't have to sort through them all on its own.
//2. Prebaked lighting so the normal of a surface will influence the light based on a light direction (dot product again).
//3. Rename camera.verticalAngle as it is missleading and not really an angle

//! FUTURE IDEAS

//1. Possibly divide all polygons in a level to a grid or something, or put each point in a grid cell for more efficient raycasting with only necessary points.
//2. A multiTextureLoader with some index or something that lets you switch the textures of the objects assigned to the loader in real time.
