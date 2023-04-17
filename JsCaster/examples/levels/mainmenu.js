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

const mainmenuLevel = new Level(1000, 1000, 400);

const defaultTextureLoader = new TextureLoader(
  "../../assets/bricks2.jpg",
  false,
  true,
  true,
  "repeat",
  new Vector2(0.25, 1)
);

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
  new Vector2(0.5, 0.5),
  new Vector2(0, 0)
);
mainmenuLevel.setCeilingTexture(
  "../../assets/bricks.jpg",
  new Vector2(0.5, 0.5)
);

console.log(mainmenuLevel.sprites);

mainmenuLevel.addPolygon(
  new Polygon(
    [new Vector2(100, 500), new Vector2(10, 800), new Vector2(400, 600)],
    400
  ).setTextureLoader(defaultTextureLoader)
);

mainmenuLevel.addPolygon(
  new Polygon(
    [new Vector2(800, 500), new Vector2(610, 800), new Vector2(600, 500)],
    400
  ).setTextureLoader(defaultTextureLoader)
);

mainmenuLevel.addPolygon(
  Polygon.circle(new Vector2(100, 200), 50, 15, 400).setTextureLoader(
    defaultTextureLoader
  )
);

mainmenuLevel.addPolygon(
  Polygon.circle(new Vector2(600, 200), 50, 15, 400).setTextureLoader(
    defaultTextureLoader
  )
);

mainmenuLevel.addPolygon(
  Polygon.circle(new Vector2(400, 500), 60, 15, 400).setTextureLoader(
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
mainmenuLevel.addLight(new DirectionalLight(new Color(1, 255, 255), 90, 1));

export { mainmenuLevel };
