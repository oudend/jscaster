import { Level, Vector2, Polygon } from "../src/jscaster.js";
import { TextureLoader } from "../src/loaders/textureLoader.js";
import { DirectionalLight } from "../src/lights/directionalLight.js";

const exampleLevel = new Level(500, 500);

const defaultTextureLoader = new TextureLoader(
  "../assets/bricks2.jpg",
  false,
  true,
  true,
  "repeat",
  new Vector2(0.25, 1)
);

exampleLevel.addPolygon(
  new Polygon(
    [new Vector2(0, 0), new Vector2(10, 20), new Vector2(40, 10)],
    100
  ).setTextureLoader(defaultTextureLoader)
);

exampleLevel.addPolygon(
  new Polygon.circle(new Vector2(100, 200), 50, 100).setTextureLoader(
    defaultTextureLoader
  )
);

exampleLevel.addPolygon(
  new Polygon.square(new Vector2(400, 200), 100).setTextureLoader(
    defaultTextureLoader
  )
);

exampleLevel.addPolygon(
  new Polygon([
    new Vector2(100, 0),
    new Vector2(100, 20),
    new Vector2(400, 20),
    new Vector2(400, 0),
  ]).setTextureLoader(defaultTextureLoader)
);

exampleLevel.addLight(new DirectionalLight([255, 0, 255], -90, 1));
// exampleLevel.addLight(new DirectionalLight([0, 0, 255], 90, 2));

export { exampleLevel };
