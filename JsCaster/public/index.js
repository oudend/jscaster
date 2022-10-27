//https://stackoverflow.com/questions/22842691/what-is-the-meaning-of-the-dist-directory-in-open-source-projects
import {
  CanvasRenderer,
  Camera,
  Vector2,
  LevelHelper,
  RendererHelper,
} from "../src/jscaster.js";
import { exampleLevel } from "../examples/exampleLevel.js";

import Stats from "../lib/stats.module.js";

const camera = new Camera(new Vector2(55, 900), -90, 70, 1000);

const renderer = new CanvasRenderer(window.innerWidth, camera, document.body);

renderer.dom = document.body;

// renderer.canvas.height = 500;
// renderer.canvas.style.width = `${window.innerWidth}px`;
// renderer.canvas.style.height = `${window.innerHeight}px`;

const levelHelper = new LevelHelper(exampleLevel);
const rendererHelper = new RendererHelper(renderer, exampleLevel);

document.body.appendChild(levelHelper.canvas);

renderer.render(exampleLevel);

levelHelper.render();
rendererHelper.render();

var stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

var FPS = 20;

//requestAnimationFrame(animate);

var count = 0;

function animate() {
  renderer.render(exampleLevel);

  camera.position.y -= 1;

  stats.begin();

  if (count++ % 20 == 0) camera.angle += 1;

  if (camera.position.y <= 10) camera.position.y = 900;

  //levelHelper.render();
  rendererHelper.render();

  stats.end();

  requestAnimationFrame(animate);
  //setTimeout(() => requestAnimationFrame(animate), 1000 / FPS);
}

//! PLAN

//1. Move rayInformation from camera to ray.js if possible. ( At least make ray.js return only necessary information ).
//2. Clean up code in general.
//3. Darken color based on distance from camera.
//4. Figure out normal for ray hits and include in ray.js
//5. Darken color based on dot product between ray and its normal.

//! IMPORTANT

//1. Make sure to only pass intersecting rays to the renderer so it doesn't have to sort through them all on its own.
//2. Prebaked lighting so the normal of a surface will influence the light based on a light direction (dot product again).

//! FUTURE IDEAS

//1. Possibly divide all polygons in a level to a grid or something, or put each point in a grid cell for more efficient raycasting with only necessary points.
