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
  LineSegment,
} from "../../src/jscaster.js";

//!documentation build --document-exported ./JsCaster/src/jscaster.js -f html -o ./JsCaster/docs

import { degrees_to_radians } from "../../src/utils.js";

import { mainmenuLevel } from "../levels/mainmenu.js";

import Stats from "../../lib/stats.module.js";

const camera = new Camera(new Vector2(800, 300), 180, 70, 1000);

const renderer = new WebglRenderer(450, 450, camera, document.body);

const gunIdleImage = document.getElementById("gun_idle");
const gunShootImage = document.getElementById("gun_shoot");

//renderer.canvas.style.width = `${200}px`;
//renderer.canvas.style.height = `${300}px`;

renderer.dom = document.body;

// renderer.canvas.height = 500;
renderer.canvas.style.width = `${window.innerWidth}px`;
renderer.canvas.style.height = `${window.innerHeight}px`;

gunShootImage.style.visibility = "hidden";

var gunSize = Math.min(window.innerHeight / 2, window.innerWidth / 2);

gunIdleImage.style.width = `${gunSize}px`;
gunIdleImage.style.height = `${gunSize}px`;
gunShootImage.style.width = `${gunSize}px`;
gunShootImage.style.height = `${gunSize}px`;

var gunLeft = window.innerWidth / 2 - gunSize / 2;
var gunY = -20;

gunIdleImage.style.left = `${gunLeft}px`;
gunShootImage.style.left = `${gunLeft}px`;
gunIdleImage.style.bottom = `${gunY}px`;
gunShootImage.style.bottom = `${gunY}px`;

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

var gunShootCooldownDurationMinimum = 500; //1000 ms
var gunShootCooldownDurationMaximum = 800;

var gunShootCooldownDuration = 1000;
var gunShootCooldown = false;
var gunShootCooldownStart = 100; //1000 ms

var enemySpriteHurtAnimationDuration = 175; //1000 ms
var enemySpriteHurtAnimation = false;
var enemySpriteHurtAnimationStart = 100;

var gunDamage = 15;

var speed = 3;

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
    gunY = -20;
    gunIdleImage.style.bottom = `${gunY}px`;
    gunShootImage.style.bottom = `${gunY}px`;
  }

  if (
    gunShootCooldown &&
    Date.now() - gunShootCooldownStart > gunShootCooldownDuration
  ) {
    gunShootCooldown = false;
    gunShootCooldownDuration = Math.floor(
      Math.random() *
        (gunShootCooldownDurationMaximum -
          gunShootCooldownDurationMinimum +
          1) +
        gunShootCooldownDurationMinimum
    );
  }

  handleEnemy();

  stats.end();

  if (run) requestAnimationFrame(animate);
}

const enemySpeed = 1.5;
const deathDistance = 2;

var headBobValue = 0;
var headBobIntensity = 0.1;
var headBobMultiplier = 2;

function gameOver() {
  run = false; //? oldschool cool
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

  if (distance < deathDistance) {
    gameOver();
  }

  const dx = (camera.position.x - enemySprite.position.x) / distance;
  const dy = (camera.position.y - enemySprite.position.y) / distance;

  enemySprite.position.x += dx * enemySpeed;
  enemySprite.position.y += dy * enemySpeed;
}

//? left, right, up, down
const boxSize = 10;

function getCameraCollisionBox(camera) {
  //? right, left, bottom, up
  return [
    new LineSegment(
      Vector2.add(camera.position, new Vector2(boxSize / 2, boxSize / 2)),
      Vector2.add(camera.position, new Vector2(boxSize / 2, -boxSize / 2))
    ),
    new LineSegment(
      Vector2.add(camera.position, new Vector2(-boxSize / 2, boxSize / 2)),
      Vector2.add(camera.position, new Vector2(-boxSize / 2, -boxSize / 2))
    ),
    new LineSegment(
      Vector2.add(camera.position, new Vector2(boxSize / 2, boxSize / 2)),
      Vector2.add(camera.position, new Vector2(-boxSize / 2, boxSize / 2))
    ),
    new LineSegment(
      Vector2.add(camera.position, new Vector2(boxSize / 2, -boxSize / 2)),
      Vector2.add(camera.position, new Vector2(-boxSize / 2, -boxSize / 2))
    ),
  ];
}

function detectCollision(level, camera) {
  const collisionBox = getCameraCollisionBox(camera);

  for (let lineSegment of collisionBox) {
    const raycast = Ray.castRay(
      level,
      Ray.fromLineSegment(lineSegment),
      camera.angle
    );

    //console.log(raycast, lineSegment);

    if (raycast.object !== undefined) return true;
  }

  return false;
}

function moveCamera() {
  Object.entries(keys).forEach(([key, value]) => {
    if (!value) return;

    var movementVector = new Vector2(0, 0);

    switch (key) {
      case "w":
        let moveForward = Vector2.fromAngle(
          degrees_to_radians(camera.angle)
        ).multiply(speed);

        movementVector.add(moveForward);

        // camera.position = futurePosition;
        break;
      case "s":
        let moveBackward = Vector2.fromAngle(
          degrees_to_radians(camera.angle - 180)
        ).multiply(speed);

        movementVector.add(moveBackward);

        // camera.position.add(
        //   Vector2.fromAngle(degrees_to_radians(camera.angle - 180)).multiply(
        //     speed
        //   )
        // );
        break;
      case "a":
        let moveLeft = Vector2.fromAngle(
          degrees_to_radians(camera.angle - 90)
        ).multiply(speed);

        movementVector.add(moveLeft);
        // camera.position.add(
        //   Vector2.fromAngle(degrees_to_radians(camera.angle - 90)).multiply(
        //     speed
        //   )
        // );
        break;
      case "d":
        let moveRight = Vector2.fromAngle(
          degrees_to_radians(camera.angle + 90)
        ).multiply(speed);

        movementVector.add(moveRight);

        // camera.position.add(
        //   Vector2.fromAngle(degrees_to_radians(camera.angle + 90)).multiply(
        //     speed
        //   )
        // );
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

        gunY = -10;

        gunIdleImage.style.bottom = `${gunY}px`;
        gunShootImage.style.bottom = `${gunY}px`;

        //? raycast from the camera position in the shooting direction and check if it intersects with the sprites lineSegment

        const ray = new Ray(camera.position, camera.angle, 1000);

        if (
          Ray.castRay(mainmenuLevel, ray, camera.angle).object == enemySprite
        ) {
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

    if (movementVector.x == 0 && movementVector.y == 0) return;

    movementVector.normalize().multiply(speed);

    camera.position.add(new Vector2(movementVector.x, 0));
    //if (detectCollision(mainmenuLevel, camera)) {
    for (let i = 0; i < 10; i++) {
      if (!detectCollision(mainmenuLevel, camera)) continue;
      camera.position.subtract(new Vector2(movementVector.x / 10, 0));
    }

    camera.position.add(new Vector2(0, movementVector.y));
    //if (detectCollision(mainmenuLevel, camera)) {
    for (let i = 0; i < 10; i++) {
      if (!detectCollision(mainmenuLevel, camera)) continue;
      camera.position.subtract(new Vector2(0, movementVector.y / 10));
    }
  });

  if (
    Object.entries(keys).some(
      ([key, value]) => ["w", "a", "s", "d"].includes(key) && value === true
    )
  ) {
    headBobValue += headBobIntensity;

    let headBobSin =
      headBobMultiplier / 2 - Math.sin(headBobValue) * headBobMultiplier;
    let headBobCos =
      headBobMultiplier / 2 - Math.cos(headBobValue) * headBobMultiplier;

    gunIdleImage.style.bottom = `${headBobSin + gunY}px`;
    gunShootImage.style.bottom = `${headBobSin + gunY}px`;

    gunIdleImage.style.left = `${gunLeft + headBobCos}px`;
    gunShootImage.style.left = `${gunLeft + headBobCos}px`;

    // console.log("==!=!=!");
    // debugger;
  }
}

document.addEventListener("keydown", (event) => {
  var key = event.key;

  keys[key] = true;
});

document.addEventListener("keyup", (event) => {
  var key = event.key;

  keys[key] = false;
});
