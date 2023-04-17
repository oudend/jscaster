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

import { degrees_to_radians } from "../../src/utils.js";
import { mainmenuLevel } from "../levels/mainmenu.js";
import Stats from "../../lib/stats.module.js";
import { SimpleEnemy } from "./simpleEnemy.js";

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

const enemyTextureLoaderIdle = new TextureLoader("../../assets/enemy/Idle.png");

const enemyTextureLoaderHurt1 = new TextureLoader(
  "../../assets/enemy/Take Hit1.png"
);
const enemyTextureLoaderHurt2 = new TextureLoader(
  "../../assets/enemy/Take Hit2.png"
);
const enemyTextureLoaderHurt3 = new TextureLoader(
  "../../assets/enemy/Take Hit3.png"
);

const enemyTextureLoaderDeath1 = new TextureLoader(
  "../../assets/enemy/Death1.png"
);
const enemyTextureLoaderDeath2 = new TextureLoader(
  "../../assets/enemy/Death2.png"
);
const enemyTextureLoaderDeath3 = new TextureLoader(
  "../../assets/enemy/Death3.png"
);

const enemyTextureLoaderAttack3 = new TextureLoader(
  "../../assets/enemy/Attack3.png"
);
const enemyTextureLoaderAttack4 = new TextureLoader(
  "../../assets/enemy/Attack4.png"
);
const enemyTextureLoaderAttack5 = new TextureLoader(
  "../../assets/enemy/Attack5.png"
);

const enemyTextureLoader = new MultiTextureLoader([
  enemyTextureLoaderIdle,
  enemyTextureLoaderHurt1,
  enemyTextureLoaderHurt2,
  enemyTextureLoaderHurt3,
  enemyTextureLoaderDeath1,
  enemyTextureLoaderDeath2,
  enemyTextureLoaderDeath3,
  enemyTextureLoaderAttack3,
  enemyTextureLoaderAttack4,
  enemyTextureLoaderAttack5,
]);

const enemySprite = mainmenuLevel.addSprite(
  new Sprite(enemyTextureLoader, new Vector2(200, 200), 0, 33, 70, true)
);

const enemy = new SimpleEnemy(
  enemySprite,
  cameraTarget(camera),
  100,
  1.5,
  10,
  onEnemyDeath.bind(this)
);

enemy.update();

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

// var gunShootAudio = new Audio("../../assets/sounds/gun.mp3");

//var enemySpriteHurtAnimationDuration = 175; //1000 ms
// var enemySpriteHurtAnimation = false;
// var enemySpriteAnimationIndex = 0;
// var enemySpriteHurtAnimationStart = 100;

enemy.addAnimation(
  "took_damage",
  [
    { duration: 100, animationIndex: 1 },
    { duration: 205, animationIndex: 2 },
    { duration: 100, animationIndex: 3 },
    { duration: 0, animationIndex: 0 },
  ],
  () => {
    if (!enemy.isDead) enemy.target = cameraTarget(camera);
  }
);

enemy.addAnimation(
  "death",
  [
    { duration: 100, animationIndex: 4 },
    { duration: 205, animationIndex: 5 },
    { duration: 1000, animationIndex: 6 },
  ],
  () => {
    console.log("enemy dead");
    mainmenuLevel.removeSprite(enemy.sprite);
  }
);

enemy.addAnimation(
  "attack",
  [
    { duration: 100, animationIndex: 7 },
    { duration: 205, animationIndex: 8 },
    { duration: 200, animationIndex: 9 },
    { duration: 0, animationIndex: 0 },
  ],
  () => (playerHealth -= enemy.damage)
); //TODO: FLASH THE SCREEN RED OR SOMETHING TO INDICATE DAMAGE

//removeSprite(sprite)

var gunDamage = 15;
var playerHealth = 100;

var speed = 2.15;

var run = true;

requestAnimationFrame(animate);

function animate() {
  stats.begin();
  moveCamera();
  renderer.render(mainmenuLevel);
  rendererHelper.render();
  handleGunAnimations();
  enemy.update();
  handleEnemies();
  stats.end();

  if (playerHealth <= 0) {
    return;
  }

  requestAnimationFrame(animate);
}

function handleEnemies() {
  if (Vector2.distance(enemy.sprite.position, camera.position) < 16) {
    enemy.startAnimation("attack", false);
  }
}

function cameraTarget(camera) {
  //TODO! does not need to be a function
  const target = {
    get position() {
      return Vector2.add(
        camera.position,
        Vector2.fromAngle(degrees_to_radians(camera.angle)).multiply(10)
      );
    },
  };

  console.log(target);

  return target;
}

// const enemySpeed = 1.5;
// const deathDistance = 2;

var headBobValue = 0;
var headBobIntensity = 0.1;
var headBobMultiplier = 2;

function onEnemyDeath() {
  enemy.target = undefined;

  enemy.startAnimation("death", true);
}

function handleGunAnimations() {
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
}

// function gameOver() {
//   run = false; //? oldschool cool
// }

// function handleEnemy() {
//   //? enemy should constantly move towards the player.

//   let enemySpriteAnimationTiming =
//     enemySpriteHurtAnimationTimings[enemySpriteAnimationIndex];

//   if (
//     enemySpriteHurtAnimation &&
//     Date.now() - enemySpriteHurtAnimationStart >
//       enemySpriteAnimationTiming.duration
//   ) {
//     if (
//       enemySpriteAnimationIndex + 1 >=
//       enemySpriteHurtAnimationTimings.length
//     ) {
//       enemySpriteAnimationIndex = 0;
//       enemySpriteHurtAnimation = false;
//       enemyTextureLoader.setTextureLoader(0);
//     } else {
//       let textureLoaderIndex =
//         enemySpriteHurtAnimationTimings[enemySpriteAnimationIndex + 1]
//           .animationIndex;

//       enemySpriteAnimationIndex++;

//       enemySpriteHurtAnimationStart = Date.now();

//       enemyTextureLoader.setTextureLoader(textureLoaderIndex);
//     }
//   }

//   if (enemyHp <= 0) {
//     enemyHp = 100;
//     //? reset enemy position to random point inside level

//     enemySprite.position = new Vector2(
//       Math.random() * mainmenuLevel.width,
//       Math.random() * mainmenuLevel.height
//     );
//   }

//   const distance = Vector2.distance(camera.position, enemySprite.position);

//   if (distance < deathDistance) {
//     gameOver();
//   }

//   if (enemySpriteHurtAnimation) return;

//   const direction = Vector2.subtract(
//     camera.position,
//     enemySprite.position
//   ).divide(distance);

//   // const dx = (camera.position.x - enemySprite.position.x) / distance;
//   // const dy = (camera.position.y - enemySprite.position.y) / distance;

//   enemySprite.position.x += direction.x * enemySpeed;
//   enemySprite.position.y += direction.y * enemySpeed;
// }

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
      camera.angle,
      true
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
        let moveForward = Vector2.fromAngle(degrees_to_radians(camera.angle));

        movementVector.add(moveForward);

        // camera.position = futurePosition;
        break;
      case "s":
        let moveBackward = Vector2.fromAngle(
          degrees_to_radians(camera.angle - 180)
        );

        movementVector.add(moveBackward);

        // camera.position.add(
        //   Vector2.fromAngle(degrees_to_radians(camera.angle - 180)).multiply(
        //     speed
        //   )
        // );
        break;
      case "a":
        let moveLeft = Vector2.fromAngle(degrees_to_radians(camera.angle - 90));

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
        );

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

        // // gunShootAudio.currentTime = 0;
        // // gunShootAudio.play();

        //? raycast from the camera position in the shooting direction and check if it intersects with the sprites lineSegment

        const ray = new Ray(camera.position, camera.angle, 1000);

        if (
          Ray.castRay(mainmenuLevel, ray, camera.angle).object == enemySprite
        ) {
          console.log("hit");

          // enemyTextureLoader.setTextureLoader(
          //   enemySpriteHurtAnimationTimings[enemySpriteAnimationIndex]
          //     .animationIndex
          // );

          if (enemy.isDead) break;

          enemy.target = undefined;
          enemy.startAnimation("took_damage");
          enemy.health -= gunDamage;

          // enemyTextureLoader.setTextureLoader(
          //   enemySpriteHurtAnimationTimings[enemySpriteAnimationIndex]
          //     .animationIndex
          // );

          // enemySpriteHurtAnimation = true;
          // enemySpriteHurtAnimationStart = Date.now();
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
    for (let i = 0; i < 20; i++) {
      if (!detectCollision(mainmenuLevel, camera)) continue;
      camera.position.subtract(new Vector2(movementVector.x / 20, 0));
    }

    camera.position.add(new Vector2(0, movementVector.y));
    //if (detectCollision(mainmenuLevel, camera)) {
    for (let i = 0; i < 20; i++) {
      if (!detectCollision(mainmenuLevel, camera)) continue;
      camera.position.subtract(new Vector2(0, movementVector.y / 20));
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
