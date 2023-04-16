import {
  Camera,
  Vector2,
  LevelHelper,
  RendererHelper,
  WebglRenderer,
  Sprite,
  MultiTextureLoader,
  TextureLoader,
  Ray,
} from "../../src/jscaster.js";

//!documentation build --document-exported ./JsCaster/src/jscaster.js -f html -o ./JsCaster/docs

import { degrees_to_radians } from "../../src/utils.js";

import { mainmenuLevel } from "../levels/mainmenu.js";

import Stats from "../../lib/stats.module.js";

const camera = new Camera(new Vector2(1, 1), 40, 70, 1000);

const renderer = new WebglRenderer(300, 600, camera, document.body);

const gunIdleImage = document.getElementById("gun_idle");
const gunShootImage = document.getElementById("gun_shoot");

//renderer.canvas.style.width = `${200}px`;
//renderer.canvas.style.height = `${300}px`;

renderer.dom = document.body;

// renderer.canvas.height = 500;
renderer.canvas.style.width = `${window.innerWidth}px`;
renderer.canvas.style.height = `${window.innerHeight}px`;

gunShootImage.style.visibility = "hidden";

gunIdleImage.style.left = `${window.innerWidth / 2 - 200}px`;
gunShootImage.style.left = `${window.innerWidth / 2 - 200}px`;

const levelHelper = new LevelHelper(mainmenuLevel, true);
const rendererHelper = new RendererHelper(renderer, mainmenuLevel, true);

// document.body.appendChild(levelHelper.canvas);

const enemyTextureLoaderIdle = new TextureLoader(
  "../../assets/enemy/Idle.png",
  false,
  true,
  false,
  "repeat",
  new Vector2(1, 1)
);

const enemyTextureLoaderHurt = new TextureLoader(
  "../../assets/enemy/Take Hit.png",
  false,
  true,
  false,
  "repeat",
  new Vector2(1, 1)
);

const enemyTextureLoader = new MultiTextureLoader([
  enemyTextureLoaderIdle,
  enemyTextureLoaderHurt,
]);

const enemySprite = mainmenuLevel.addSprite(
  new Sprite(enemyTextureLoader, new Vector2(200, 200), 0, 43, 70, true)
);
var enemyHp = 100;

renderer.render(mainmenuLevel);

levelHelper.render();

rendererHelper.render();

rendererHelper.canvas.classList.add("minimap");

var stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

var turnSpeed = 2;

var keys = {};

//! very ugly code but the engine is what needs to look good anyways

//var count = 0;

var gunShootAnimationDuration = 100; //1000 ms
var gunShootAnimation = false;
var gunShootAnimationStart = 0;

var gunShootCooldownDuration = 1000; //1000 ms
var gunShootCooldown = false;
var gunShootCooldownStart = 100; //1000 ms

var enemySpriteHurtAnimationDuration = 300; //1000 ms
var enemySpriteHurtAnimation = false;
var enemySpriteHurtAnimationStart = 100;

var gunDamage = 10;

var speed = 0;

var run = true;

requestAnimationFrame(animate);

function animate() {
  stats.begin();
  moveCamera();
  renderer.render(mainmenuLevel);
  rendererHelper.render();

  if (
    gunShootAnimation &&
    Date.now() - gunShootAnimationStart > gunShootAnimationDuration
  ) {
    gunShootAnimation = false;
    gunShootImage.style.visibility = "hidden";
    gunShootCooldown = true;
    gunShootCooldownStart = Date.now();
  }

  if (
    gunShootCooldown &&
    Date.now() - gunShootCooldownStart > gunShootCooldownDuration
  ) {
    gunShootCooldown = false;
  }

  handleEnemy();

  stats.end();

  if (run) requestAnimationFrame(animate);
}

const enemySpeed = 1;

function gameOver() {
  run = false;
}

function handleEnemy() {
  //? enemy should constantly move towards the player.

  if (
    enemySpriteHurtAnimation &&
    Date.now() - enemySpriteHurtAnimationStart >
      enemySpriteHurtAnimationDuration
  ) {
    enemySpriteHurtAnimation = false;
    enemyTextureLoader.setTextureLoader(0);
  }

  if (enemyHp <= 0) {
    enemyHp = 100;
    //? reset enemy position to random point inside level

    enemySprite.position = new Vector2(
      Math.random() * mainmenuLevel.width,
      Math.random() * mainmenuLevel.height
    );
  }

  const distance = Vector2.distance(camera.position, enemySprite.position);

  if (distance < 1.5) {
    gameOver();
  }

  const dx = (camera.position.x - enemySprite.position.x) / distance;
  const dy = (camera.position.y - enemySprite.position.y) / distance;

  enemySprite.position.x += dx * enemySpeed;
  enemySprite.position.y += dy * enemySpeed;
}

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
      case "ArrowRight":
        camera.angle += turnSpeed;
        break;
      case "ArrowLeft":
        camera.angle -= turnSpeed;
        if (camera.angle < 0) camera.angle = 359;
        break;
      case " ":
        if (gunShootAnimation || gunShootCooldown) break;

        gunShootImage.style.visibility = "visible";
        gunShootAnimation = true;
        gunShootAnimationStart = Date.now();

        //? raycast from the camera position in the shooting direction and check if it intersects with the sprites lineSegment

        const ray = new Ray(camera.position, camera.angle, 1000);

        if (
          ray.intersects(enemySprite.getLineSegment(camera.angle)).intersects
        ) {
          //? can shoot straight through walls at the moment
          console.log("hit");
          enemyTextureLoader.setTextureLoader(1);
          enemyHp -= gunDamage;
          enemySpriteHurtAnimation = true;
          enemySpriteHurtAnimationStart = Date.now();
        }

        break;
      // case "ArrowUp":
      //   camera.verticalAngle += turnSpeed * 4;
      //   break;
      // case "ArrowDown":
      //   camera.verticalAngle -= turnSpeed * 4;
      //   break;
      // case "g":
      //   renderer.floorOffset -= 2;
      //   break;
      // case "t":
      //   renderer.floorOffset += 2;
      //   break;
    }
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
