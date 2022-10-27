import { Level, Vector2, Polygon } from "../src/jscaster.js";

const exampleLevel = new Level(500, 500);

exampleLevel.addPolygon(
  new Polygon([new Vector2(0, 0), new Vector2(10, 20), new Vector2(40, 10)])
);

exampleLevel.addPolygon(
  new Polygon([
    new Vector2(100, 0),
    new Vector2(100, 20),
    new Vector2(400, 20),
    new Vector2(400, 0),
  ])
);

export { exampleLevel };
