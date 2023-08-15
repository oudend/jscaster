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
  TextureAtlas,
  TextureAtlasLoader,
  BasicMaterial,
  Color,
} from "../../src/jscaster.js";

import { degrees_to_radians } from "../../src/utils.js";
import { mainmenuLevel } from "../levels/simpleShooterLevel.js";
import Stats from "../../lib/stats.module.js";
import { SimpleEnemy } from "./simpleEnemy.js";

var settings = {
  resolution: { width: 500, height: 500 },
  minimap: { size: 200 },
  rendering: { imageRendering: "crisp-edges" },
};

var previousSettings = settings;

const renderPass = /*glsl*/ `
  vec3 gradient = mix(vec3(0.,0.,.7), vec3(.8,.8,.9), resolution.y / 2. / (gl_FragCoord.y) );
  if(renderType == 2 && false) {
    //mix( vec4(gradient, 1.), vec4(opacityColor.r, opacityColor.g, opacityColor.b, 1.), opacityColor.a);
    return vec4(gradient, 1.);
  }

  return vec4( (mix(vec3(.5,.5,1.), vec3(1.,1.,1.), vec3(min(1., 150./distance)))) * color.rgb, color.a);

  return color;
`;

const camera = new Camera(new Vector2(800, 300), 180, 90, 100000);
const renderer = new WebglRenderer(500, 500, camera, mainmenuLevel, renderPass);
const levelHelper = new LevelHelper(mainmenuLevel, true);
const rendererHelper = new RendererHelper(renderer, mainmenuLevel, true);

renderer.dom = document.body;
renderer.canvas.style.width = `${window.innerWidth}px`;
renderer.canvas.style.height = `${window.innerHeight}px`;

renderer.render();
levelHelper.render();
rendererHelper.render();
rendererHelper.canvas.classList.add("minimap");

rendererHelper.canvas.style.width = "200px";
rendererHelper.canvas.style.height = "200px";

const gunIdleImage = document.getElementById("gun_idle");
const gunShootImage = document.getElementById("gun_shoot");

const playerHealthElement = document.getElementById("health");
const playerDamageScreenElement = document.getElementById("dmgScreen");
const mainmenuElement = document.getElementById("mainmenu");

const mainMenuButtonContainer = document.getElementById("buttonContainer");
const mainMenuSettingsContainer = document.getElementById("settingsContainer");
const mainMenuControlsContainer = document.getElementById("controlsContainer");

//? gun setup
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
//? gun setup

//? button setup
const startButton = document.getElementById("startButton");
const settingButton = document.getElementById("settingButton");
const restartButton = document.getElementById("restartButton");
const exitButton = document.getElementById("exitButton");

const applyButton = document.getElementById("applyButton");
const backButton = document.getElementById("backButton");

const resolutionWidthSlider = document.getElementById("resolutionWidthSlider");
const resolutionWidthBox = document.getElementById("resolutionWidthBox");

const resolutionHeightSlider = document.getElementById(
  "resolutionHeightSlider"
);
const resolutionHeightBox = document.getElementById("resolutionHeightBox");

const minimapSizeSlider = document.getElementById("minimapSizeSlider");
const minimapSizeBox = document.getElementById("minimapSizeBox");

const imageRenderingSelect = document.getElementById("imageRenderingSelect");

var run = false;

function prerender() {
  renderer.render();
  rendererHelper.render();
  if (run === false) requestAnimationFrame(prerender);
}

requestAnimationFrame(prerender);

imageRenderingSelect.onchange = () => {
  settings.rendering.imageRendering = imageRenderingSelect.value;
  console.log(settings);
};

minimapSizeSlider.onchange = () => {
  minimapSizeBox.value = minimapSizeSlider.value;
  settings.minimap.size = parseInt(minimapSizeSlider.value);
};
minimapSizeBox.onchange = () => {
  minimapSizeSlider.value = minimapSizeBox.value;
  settings.minimap.size = parseInt(minimapSizeBox.value);
};

resolutionWidthSlider.onchange = () => {
  resolutionWidthBox.value = resolutionWidthSlider.value;
  settings.resolution.width = parseInt(resolutionWidthSlider.value);
};
resolutionWidthBox.onchange = () => {
  resolutionWidthSlider.value = resolutionWidthBox.value;
  settings.resolution.width = parseInt(resolutionWidthBox.value);
};

resolutionHeightSlider.onchange = () => {
  resolutionHeightBox.value = resolutionHeightSlider.value;
  settings.resolution.height = parseInt(resolutionHeightSlider.value);
};
resolutionHeightBox.onchange = () => {
  resolutionHeightSlider.value = resolutionHeightBox.value;
  settings.resolution.height = parseInt(resolutionHeightBox.value);
};

startButton.onclick = () => {
  requestAnimationFrame(animate);
  run = true;
  startButton.innerText = "CONTINUE";
  mainmenuElement.style.visibility = "hidden";
};
settingButton.onclick = () => {
  mainMenuButtonContainer.style.visibility = "hidden";
  mainMenuControlsContainer.style.visibility = "hidden";
  mainMenuSettingsContainer.style.visibility = "inherit";
};
backButton.onclick = () => {
  mainMenuSettingsContainer.style.visibility = "hidden";
  mainMenuButtonContainer.style.visibility = "inherit";
  mainMenuControlsContainer.style.visibility = "inherit";

  settings = previousSettings;
};
applyButton.onclick = () => {
  mainMenuSettingsContainer.style.visibility = "hidden";
  mainMenuButtonContainer.style.visibility = "inherit";
  mainMenuControlsContainer.style.visibility = "inherit";
  previousSettings = settings;

  // renderer.width = parseInt(resolutionWidthBox.value);
  // renderer.height = parseInt(resolutionHeightBox.value);

  renderer.setDimensions(
    parseInt(settings.resolution.width),
    parseInt(settings.resolution.width)
  );

  rendererHelper.canvas.style.width = `${settings.minimap.size}px`;
  rendererHelper.canvas.style.height = `${settings.minimap.size}px`;

  renderer.canvas.style.imageRendering = settings.rendering.imageRendering;
};
restartButton.onclick = () => {
  requestAnimationFrame(animate);
  restart();
  run = true;
  mainmenuElement.style.visibility = "hidden";
};
exitButton.onclick = () => window.close();
//? gun setup

var enemyMaterial;

const enemyTextureLoader = new TextureAtlasLoader(
  [
    "../../assets/enemy/Idle.png",
    "../../assets/enemy/Take Hit1.png",
    "../../assets/enemy/Take Hit2.png",
    "../../assets/enemy/Take Hit3.png",
    "../../assets/enemy/Death1.png",
    "../../assets/enemy/Death2.png",
    "../../assets/enemy/Death3.png",
    "../../assets/enemy/Attack1.png",
    "../../assets/enemy/Attack2.png",
    "../../assets/enemy/Attack3.png",
    "../../assets/enemy/Attack4.png",
    "../../assets/enemy/Attack5.png",
    "../../assets/enemy/Run1.png",
    "../../assets/enemy/Run2.png",
  ],
  100,
  5,
  5,
  () => {
    //enemyMaterial.setCrop(enemyTextureLoader.crops[0]);
    enemy.startAnimation("run", true);
  }
);

enemyMaterial = new BasicMaterial(
  new Color(255, 0, 50),
  enemyTextureLoader,
  undefined,
  undefined,
  true
);

//? enemy setup
const enemySprite = mainmenuLevel.addSprite(
  new Sprite(enemyMaterial, new Vector2(200, 200), 0, 33, 70, true)
);

const cameraTarget = {
  get position() {
    return Vector2.add(
      camera.position,
      Vector2.fromAngle(degrees_to_radians(camera.angle)).multiply(10)
    );
  },
};

const enemy = new SimpleEnemy(
  enemySprite,
  cameraTarget,
  100,
  1.5,
  10,
  onEnemyDeath.bind(this)
);

enemy.addAnimation(
  "run",
  [
    //{ duration: 50, animationIndex: 12 },
    { duration: 100, animationIndex: 12 },
    { duration: 0, animationIndex: 13 },
    { duration: 100, animationIndex: 13 },
  ],
  () => {
    enemy.startAnimation("run", false);
  }
);

enemy.addAnimation(
  "took_damage",
  [
    { duration: 30, animationIndex: 1 },
    { duration: 60, animationIndex: 2 },
    { duration: 200, animationIndex: 3 },
    { duration: 10, animationIndex: 0 },
  ],
  () => {
    enemy.startAnimation("run", true);
    if (!enemy.isDead) enemy.target = cameraTarget;
  }
);

enemy.addAnimation(
  "death",
  [
    { duration: 100, animationIndex: 4 },
    { duration: 205, animationIndex: 5 },
    { duration: 2000, animationIndex: 6 },
  ],
  () => {
    console.log("enemy dead");

    enemy.health = 100;
    enemy.isDead = false;

    enemy.startAnimation("run", true);
    //enemyMaterial.setCrop(enemyTextureLoader.crops[0]);

    //enemy.sprite.textureLoader.setTextureLoader(0);

    enemy.sprite.position = new Vector2(
      Math.random() * mainmenuLevel.width,
      Math.random() * mainmenuLevel.height
    );

    enemy.target = cameraTarget;
  }
);

enemy.addAnimation(
  "attack",
  [
    { duration: 70, animationIndex: 7 },
    { duration: 75, animationIndex: 8 },
    { duration: 70, animationIndex: 9 },
    { duration: 70, animationIndex: 10 },
    { duration: 100, animationIndex: 11 },
    { duration: 10, animationIndex: 0 },
  ],
  () => {
    enemy.startAnimation("run", true);
    playerHealth -= enemy.damage;
    playerHealthElement.innerText = playerHealth;
    playerDamageScreenStart = Date.now();
    playerDamageScreenElement.style.visibility = "visible";
  }
);
//? enemy setup

//? player parameters
var playerDamageScreenDuration = 300;
var playerDamageScreenStart = 0;

var gunShootAnimationDuration = 100; //1000 ms
var gunShootAnimation = false;
var gunShootAnimationStart = 0;

var gunShootCooldownDurationMinimum = 500; //1000 ms
var gunShootCooldownDurationMaximum = 800;

var gunShootCooldownDuration = 1000;
var gunShootCooldown = false;
var gunShootCooldownStart = 100; //1000 ms

var gunDamage = 15;
var playerHealth = 100;

var playerSpeed = 2.15;

var turnplayerSpeed = 2;

var gunBobValue = 0;
var gunBobIntensity = 0.1;
var gunBobMultiplier = 2;

var gunRecoil = 20;
//? player parameters

var stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

function animate() {
  if (run) requestAnimationFrame(animate);

  stats.begin();
  moveCamera();
  renderer.render();
  rendererHelper.render();
  handleGunAnimations();
  enemy.update();
  handleEnemies();

  if (Date.now() - playerDamageScreenStart > playerDamageScreenDuration) {
    playerDamageScreenElement.style.visibility = "hidden";
  }

  stats.end();

  if (playerHealth <= 0) {
    restart();
  }
}

function restart() {
  enemy.sprite.position = new Vector2(200, 200);
  enemy.isDead = false;
  enemy.health = 100;

  enemy.cancelAnimation();
  enemy.startAnimation("run", true);
  //enemyMaterial.setCrop(enemyTextureLoader.crops[0]);

  //enemy.sprite.textureLoader.setTextureLoader(0);

  enemy.target = cameraTarget;

  camera.position = new Vector2(800, 300);
  camera.angle = 180;

  playerHealth = 100;
  playerHealthElement.innerText = playerHealth;
}

function handleEnemies() {
  if (Vector2.distance(enemy.sprite.position, camera.position) < 16) {
    if (playerHealth > 0 && enemy.currentAnimation !== "attack")
      enemy.startAnimation("attack", true);
  }
}

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

const collisionBoxSize = 10;

function getCameraCollisionBox(camera, boxSize) {
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

function detectCollision(level, camera, boxSize) {
  const collisionBox = getCameraCollisionBox(camera, boxSize);

  for (let lineSegment of collisionBox) {
    const raycast = Ray.castRay(
      level,
      Ray.fromLineSegment(lineSegment),
      camera.angle,
      true
    );

    const data = Ray.castRay3(
      mainmenuLevel,
      Ray.fromLineSegment(lineSegment),
      camera.angle,
      undefined,
      undefined,
      true,
      true
    );

    if (data.polygon.closest.polygon !== undefined) return true;
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
        break;
      case "s":
        let moveBackward = Vector2.fromAngle(
          degrees_to_radians(camera.angle - 180)
        );
        movementVector.add(moveBackward);
        break;
      case "a":
        let moveLeft = Vector2.fromAngle(degrees_to_radians(camera.angle - 90));
        movementVector.add(moveLeft);
        break;
      case "d":
        let moveRight = Vector2.fromAngle(
          degrees_to_radians(camera.angle + 90)
        );
        movementVector.add(moveRight);
        break;
      case "ArrowRight":
        camera.angle += turnplayerSpeed;
        break;
      case "ArrowLeft":
        camera.angle -= turnplayerSpeed;
        if (camera.angle < 0) camera.angle = 359;
        break;
      case " ":
        if (gunShootAnimation || gunShootCooldown) break;

        gunShootImage.style.visibility = "visible";
        gunShootAnimation = true;
        gunShootAnimationStart = Date.now();

        gunY = gunY + gunRecoil;

        gunIdleImage.style.bottom = `${gunY}px`;
        gunShootImage.style.bottom = `${gunY}px`;
        const ray = new Ray(camera.position, camera.angle, 1000);

        const data = Ray.castRay3(
          mainmenuLevel,
          ray,
          camera.angle,
          undefined,
          undefined,
          false,
          true
        );

        if (data.closest.sprite === enemySprite) {
          if (enemy.isDead) break;

          enemy.target = undefined;
          enemy.startAnimation("took_damage");
          enemy.health -= gunDamage;
        }
        break;
      case "Escape":
        run = false;
        mainmenuElement.style.visibility = "visible";
        break;
    }

    camera.angle = camera.angle % 360;

    if (movementVector.x == 0 && movementVector.y == 0) return;

    movementVector.normalize().multiply(playerSpeed);

    camera.position.add(new Vector2(movementVector.x, 0));
    for (let i = 0; i < 20; i++) {
      if (!detectCollision(mainmenuLevel, camera, collisionBoxSize)) continue;
      camera.position.subtract(new Vector2(movementVector.x / 20, 0));
    }

    camera.position.add(new Vector2(0, movementVector.y));
    for (let i = 0; i < 20; i++) {
      if (!detectCollision(mainmenuLevel, camera, collisionBoxSize)) continue;
      camera.position.subtract(new Vector2(0, movementVector.y / 20));
    }
  });

  if (
    Object.entries(keys).some(
      ([key, value]) => ["w", "a", "s", "d"].includes(key) && value === true
    )
  ) {
    gunBobValue += gunBobIntensity;

    let headBobSin =
      gunBobMultiplier / 2 - Math.sin(gunBobValue) * gunBobMultiplier;
    let headBobCos =
      gunBobMultiplier / 2 - Math.cos(gunBobValue) * gunBobMultiplier;

    gunIdleImage.style.bottom = `${headBobSin + gunY}px`;
    gunShootImage.style.bottom = `${headBobSin + gunY}px`;

    gunIdleImage.style.left = `${gunLeft + headBobCos}px`;
    gunShootImage.style.left = `${gunLeft + headBobCos}px`;
  }
}

var keys = {};
document.addEventListener("keydown", (event) => {
  var key = event.key;

  keys[key] = true;
});

document.addEventListener("keyup", (event) => {
  var key = event.key;

  keys[key] = false;
});
