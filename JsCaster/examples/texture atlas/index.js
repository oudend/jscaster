import { TextureAtlas } from "../../src/jscaster.js";

const textureAtlas = new TextureAtlas(
  [
    "../../assets/bricks2.jpg",
    "../../assets/bricks.jpg",
    "../../assets/floor.jpg",
    "../../assets/shrek2.jpg",
    "../../assets/frame.jpg",
    "../../assets/space.jpg",
  ],
  100,
  4,
  4,
  () => {
    console.log("texture atlas loaded");
  }
);

document.body.appendChild(textureAtlas.canvas);
