import {
  Level,
  Vector2,
  Polygon,
  TextureLoader,
  MultiTextureLoader,
  DirectionalLight,
  Color,
  Sprite,
} from "../../src/jscaster.js";

const exampleLevel = new Level(1000, 1000, 100);

const defaultTextureLoader = new TextureLoader(
  "../../assets/bricks2.jpg",
  false,
  true,
  true,
  "repeat",
  new Vector2(0.25, 1)
);

const temporaryTextureLoader = new TextureLoader(
  "../../assets/bricks.jpg",
  false,
  true,
  false,
  "repeat",
  new Vector2(1, 1)
);

const spriteTextureLoader = new TextureLoader("../../assets/Shrek.png");

const spriteTextureLoader2 = new MultiTextureLoader([
  new TextureLoader("../../assets/Shrek.png"),
  new TextureLoader("../../assets/shrek3.png"),
]);

exampleLevel.setFloorTexture(
  "../../assets/bricks.jpg",
  new Vector2(0.5, 0.5),
  new Vector2(0, 0)
);
exampleLevel.setCeilingTexture(
  "../../assets/bricks.jpg",
  new Vector2(0.5, 0.5)
);

//! add floorTexture offset btw

exampleLevel.addSprite(
  new Sprite(spriteTextureLoader2, new Vector2(200, 300), 0, 100, 100, true)
);

//! small disclaimer that everything will break if there are more than 10 textures :)

exampleLevel.addSprite(
  new Sprite(spriteTextureLoader, new Vector2(400, 400), 0, 100, 100, true)
);

console.log(exampleLevel.sprites);

// exampleLevel.addPolygon(
//   new Polygon(
//     [new Vector2(0, 0), new Vector2(10, 20), new Vector2(40, 10)],
//     200
//   ).setTextureLoader(defaultTextureLoader)
// );

exampleLevel.addPolygon(
  new Polygon.circle(new Vector2(100, 200), 50, 10).setTextureLoader(
    defaultTextureLoader
  )
);

exampleLevel.addPolygon(
  new Polygon.square(new Vector2(400, 200), 100).setTextureLoader(
    temporaryTextureLoader
  )
);

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
