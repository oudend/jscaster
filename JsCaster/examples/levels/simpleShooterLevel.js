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

const mainmenuLevel = new Level(1000, 1000, 100);

const defaultTextureLoader = new TextureLoader(
  "../../assets/bricks2.jpg",
  false,
  true,
  true,
  "repeat",
  new Vector2(0.5, 1)
);

var backgroundTextureLoader = new TextureLoader(
  "../../assets/bricks5.jpg",
  false,
  true,
  false,
  "repeat",
  new Vector2(0.5, 1.2)
);

mainmenuLevel.walls.textureLoader = backgroundTextureLoader;

// const secondaryTextureLoader = new TextureLoader(
//   "../../assets/bricks.jpg",
//   false,
//   true,
//   false,
//   "repeat",
//   new Vector2(1, 1)
// );

mainmenuLevel.setFloorTexture(
  "../../assets/bricks.jpg",
  new Vector2(1, 1),
  new Vector2(0, 0)
);
// mainmenuLevel.setCeilingTexture("../../assets/bricks.jpg", new Vector2(1, 1));

console.log(mainmenuLevel.sprites);

mainmenuLevel.addPolygon(
  new Polygon(
    [new Vector2(100, 500), new Vector2(10, 800), new Vector2(400, 600)],
    100
  ).setTextureLoader(defaultTextureLoader)
);

mainmenuLevel.addPolygon(
  new Polygon(
    [new Vector2(800, 500), new Vector2(610, 800), new Vector2(600, 500)],
    100
  ).setTextureLoader(defaultTextureLoader)
);

mainmenuLevel.addPolygon(
  Polygon.circle(new Vector2(100, 200), 50, 15, 100).setTextureLoader(
    defaultTextureLoader
  )
);

mainmenuLevel.addPolygon(
  Polygon.circle(new Vector2(600, 200), 50, 15, 100).setTextureLoader(
    defaultTextureLoader
  )
);

mainmenuLevel.addPolygon(
  Polygon.circle(new Vector2(400, 500), 60, 15, 100).setTextureLoader(
    defaultTextureLoader
  )
);

// mainmenuLevel.addPolygon(
//   new Polygon([
//     new Vector2(100, 0),
//     new Vector2(100, 20),
//     new Vector2(400, 20),
//     new Vector2(400, 0),
//   ]).setTextureLoader(defaultTextureLoader)
// );

// mainmenuLevel.addLight(new DirectionalLight(new Color(255, 0, 255), -90, 1));
//mainmenuLevel.addLight(new DirectionalLight(new Color(1, 255, 255), 90, 1));

export { mainmenuLevel };
