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

const mainmenuLevel = new Level(1000, 1000, 100);

const defaultTextureLoader = new TextureLoader("../../assets/stargr1.png");

const floorTextureLoader = new TextureLoader("../../assets/floor2.png");

var backgroundTextureLoader = new TextureLoader("../../assets/gray1.png");

var defaultMaterial = new BasicMaterial(
  new Color(255, 0, 50),
  defaultTextureLoader,
  new Vector2(0.3, 1),
  undefined,
  true,
  true
);

var floorMaterial = new BasicMaterial(
  new Color(255, 0, 50),
  floorTextureLoader,
  new Vector2(0.5, 0.5),
  undefined
);

console.log(defaultMaterial, mainmenuLevel);
console.log(mainmenuLevel);

var backgroundMaterial = new BasicMaterial(
  new Color(255, 0, 50),
  backgroundTextureLoader,
  new Vector2(0.16, 1),
  undefined,
  true,
  false
);

//! the previous material does not get replaced and is causing bug
//! this is somehow fucking up the material properties or something because floor and ceiling are not assigned to this material originally
mainmenuLevel.walls.setMaterial(backgroundMaterial);

mainmenuLevel.setFloorMaterial(floorMaterial);
mainmenuLevel.setCeilingMaterial(floorMaterial);

//mainmenuLevel.walls.textureLoader = backgroundTextureLoader;

// const secondaryTextureLoader = new TextureLoader(
//   "../../assets/bricks.jpg",
//   false,
//   true,
//   false,
//   "repeat",
//   new Vector2(1, 1)
// );

// mainmenuLevel.setFloorTexture(
//   "../../assets/bricks.jpg",
//   new Vector2(1, 1),
//   new Vector2(0, 0)
// );
// mainmenuLevel.setCeilingTexture("../../assets/bricks.jpg", new Vector2(1, 1));

console.log(mainmenuLevel.sprites);

mainmenuLevel.addPolygon(
  new Polygon(
    [new Vector2(100, 500), new Vector2(10, 800), new Vector2(400, 600)],
    100,
    defaultMaterial
  )
);

mainmenuLevel.addPolygon(
  new Polygon(
    [new Vector2(800, 500), new Vector2(610, 800), new Vector2(600, 500)],
    100,
    defaultMaterial
  )
);

mainmenuLevel.addPolygon(
  Polygon.circle(new Vector2(100, 200), 50, 15, 100, defaultMaterial)
);

mainmenuLevel.addPolygon(
  Polygon.circle(new Vector2(600, 200), 50, 15, 100, defaultMaterial)
);

mainmenuLevel.addPolygon(
  Polygon.circle(new Vector2(400, 500), 60, 15, 100, defaultMaterial)
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
