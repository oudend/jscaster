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
import { degrees_to_radians } from "../../src/utils.js";
import { exampleLevel } from "../levels/exampleLevel.js";
import Stats from "../../lib/stats.module.js";

const renderPass = /*glsl*/ `
return vec4( (vec3(min(1., 500./distance))) * color.rgb, color.a);
`;

const camera = new Camera(new Vector2(1, 1), 40, 120, 100000);
const renderer = new WebglRenderer(300, 300, camera, renderPass);

renderer.dom = document.body;
renderer.canvas.style.width = `${window.innerWidth}px`;
renderer.canvas.style.height = `${window.innerHeight}px`;

const button = document.getElementById("button");

button.requestPointerLock =
  button.requestPointerLock ||
  button.mozRequestPointerLock ||
  button.webkitRequestPointerLock;

// button.onClick = addEventListener(
//   "click",
//   function (event) {
//     button.requestPointerLock();
//   },
//   false
// );

button.onclick = function () {
  button.requestPointerLock();
};

var previousCursorPositionX = 0;
var previousCursorPositionY = 0;

document.addEventListener(
  "mousemove",
  (event) => {
    camera.angle += event.movementX / 10;
    camera.verticalAngle -= event.movementY / 5;

    camera.angle = camera.angle % 360;

    if (camera.verticalAngle > 160) {
      camera.verticalAngle = 160;
    }
    if (camera.verticalAngle < -160) {
      camera.verticalAngle = -160;
    }

    previousCursorPositionX = event.clientXdw;
    previousCursorPositionY = event.clientY;

    //? clamp angles
  },
  false
);

// Ask the browser to release the pointer
document.exitPointerLock =
  document.exitPointerLock ||
  document.mozExitPointerLock ||
  document.webkitExitPointerLock;
//? document.exitPointerLock();

var keys = {};

var speed = 0;

var stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

requestAnimationFrame(animate);

function animate() {
  stats.begin();
  renderer.render(exampleLevel);
  moveCamera();
  stats.end();

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
      // case " ":
      //   const rayData = Ray.castRay3(
      //     exampleLevel,
      //     new Ray(camera.position, camera.angle, 1000),
      //     camera.angle,
      //     undefined,
      //     undefined,
      //     false,
      //     true
      //   );
      //   console.log(rayData);
      //   break;
      // case "ArrowRight":
      //   camera.angle += turnSpeed;
      //   break;
      // case "ArrowLeft":
      //   camera.angle -= turnSpeed;
      //   if (camera.angle < 0) camera.angle = 359;
      //   break;
      // case "ArrowUp":
      //   camera.verticalAngle += turnSpeed * 4;
      //   break;
      // case "ArrowDown":
      //   camera.verticalAngle -= turnSpeed * 4;
      //   break;
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
