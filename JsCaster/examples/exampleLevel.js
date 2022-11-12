import { Level, Vector2, Polygon } from "../src/jscaster.js";

const exampleLevel = new Level(500, 500);

exampleLevel.addPolygon(
  new Polygon([
    new Vector2(0, 0),
    new Vector2(10, 20),
    new Vector2(40, 10),
  ]).loadTexture("../assets/shrek2.jpg")
);

// exampleLevel.addPolygon(
//   new Polygon.circle(new Vector2(100, 200), 100, 10).loadTexture(
//     "../assets/Shrek.png"
//   )
// );

exampleLevel.addPolygon(
  new Polygon.circle(new Vector2(100, 200), 100, 10).loadTexture(
    "../assets/Shrek.png",
    true,
    false,
    "repeat",
    new Vector2(0.5, 1)
  )
);

exampleLevel.addPolygon(
  new Polygon([
    new Vector2(100, 0),
    new Vector2(100, 20),
    new Vector2(400, 20),
    new Vector2(400, 0),
  ]).loadTexture("../assets/bricks.jpg", true, true)
);

export { exampleLevel };
