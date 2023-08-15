import {
  Level,
  Vector2,
  Polygon,
  TextureLoader,
  MultiTextureLoader,
  DirectionalLight,
  Color,
  Sprite,
  BasicMaterial,
  TextureAtlas,
  TextureAtlasLoader,
} from "../../src/jscaster.js";

const exampleLevel = new Level(1000, 1000, 300);

const defaultTextureLoader = new TextureLoader(
  "../../assets/bricks2.jpg",
  "repeat",
  new Vector2(0.25, 1),
  undefined,
  undefined
);

const defaultTextureLoader2 = new TextureLoader("../../assets/frame.jpg");

var defaultMaterial = new BasicMaterial(
  new Color(255, 0, 50),
  defaultTextureLoader,
  undefined,
  undefined,
  true,
  true
);

var defaultMaterial2 = new BasicMaterial(
  new Color(255, 0, 50),
  defaultTextureLoader2,
  undefined,
  undefined,
  true
);

// defaultMaterial2.setScale(new Vector2(0.5, 0.5));

exampleLevel.setFloorMaterial(defaultMaterial2);
exampleLevel.setCeilingMaterial(defaultMaterial2);

// // const temporaryTextureLoader = new TextureLoader(
// //   "../../assets/bricks.jpg",
// //   false,
// //   true,
// //   false,
// //   "repeat",
// //   new Vector2(1, 1)
// // );

// // const spriteTextureLoader = new TextureLoader("../../assets/Shrek.png");

// // const spriteTextureLoader2 = new MultiTextureLoader([
// //   new TextureLoader("../../assets/Shrek.png"),
// //   new TextureLoader("../../assets/shrek3.png"),
// // ]);

// exampleLevel.setFloorTexture(
//   "../../assets/bricks.jpg",
//   new Vector2(0.5, 0.5),
//   new Vector2(0, 0)
// );
// exampleLevel.setCeilingTexture(
//   "../../assets/bricks.jpg",
//   new Vector2(0.5, 0.5)
// );

const testTextureLoader = new TextureAtlasLoader(
  [
    "../../assets/frame.jpg",
    "../../assets/bricks4.jpg",
    "../../assets/gun_idle.png",
    "../../assets/oskar.png",
    "../../assets/background.png",
    "../../assets/gun_shoot.png",
  ],
  100,
  3,
  3,
  () => {
    testMaterial.setCrop(testTextureLoader.crops[4]);
  }
);

var testMaterial = new BasicMaterial(
  new Color(255, 0, 50),
  testTextureLoader,
  undefined,
  undefined,
  true
);

exampleLevel.debugMaterial = defaultMaterial; //testMaterial; //

//console.log(testTextureLoader, testMaterial);

exampleLevel.addSprite(
  new Sprite(testMaterial, new Vector2(200, 300), 0, 100, 100, true)
);

console.log(exampleLevel); //TODO: remove

// // exampleLevel.addSprite(
// //   new Sprite(spriteTextureLoader, new Vector2(400, 400), 0, 100, 100, true)
// // );

//console.log(exampleLevel.sprites);

// exampleLevel.addPolygon(
//   new Polygon(
//     [new Vector2(0, 0), new Vector2(10, 20), new Vector2(40, 10)],
//     200
//   ).setTextureLoader(defaultTextureLoader)
// );

const circleGon = Polygon.circle(new Vector2(100, 200), 50, 10);

circleGon.setMaterial(defaultMaterial);

exampleLevel.addPolygon(circleGon);

//? exampleLevel.addPolygon(Polygon.square(new Vector2(400, 200), 100));

// exampleLevel.addPolygon(
//   new Polygon([
//     new Vector2(100, 0),
//     new Vector2(100, 20),
//     new Vector2(400, 20),
//     new Vector2(400, 0),
//   ]).setTextureLoader(defaultTextureLoader)
// );

// exampleLevel.addLight(new DirectionalLight(new Color(255, 0, 255), -90, 1));
exampleLevel.addLight(new DirectionalLight(new Color(255, 255, 255), 90, 1));

export { exampleLevel };
