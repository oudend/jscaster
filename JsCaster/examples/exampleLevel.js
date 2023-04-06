import {
  Level,
  Vector2,
  Polygon,
  TextureLoader,
  DirectionalLight,
  Color,
} from "../src/jscaster.js";

const exampleLevel = new Level(1000, 1000, 100);

const defaultTextureLoader = new TextureLoader(
  "../assets/bricks2.jpg",
  false,
  true,
  true,
  "repeat",
  new Vector2(0.25, 1)
);

exampleLevel.setFloorTexture("../assets/shrek2.jpg", new Vector2(0.5, 0.5));
exampleLevel.setCeilingTexture("../assets/shrek2.jpg", new Vector2(0.5, 0.5));

// exampleLevel.addPolygon(
//   new Polygon(
//     [new Vector2(0, 0), new Vector2(10, 20), new Vector2(40, 10)],
//     200
//   ).setTextureLoader(defaultTextureLoader)
// );

exampleLevel.addPolygon(
  new Polygon.circle(new Vector2(100, 200), 50, 30).setTextureLoader(
    defaultTextureLoader
  )
);

exampleLevel.addPolygon(
  new Polygon.square(new Vector2(400, 200), 100).setTextureLoader(
    defaultTextureLoader
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
