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
  2,
  3,
  () => {
    console.log("texture atlas loaded");
  }
);

document.body.appendChild(textureAtlas.canvas);

const textureAtlas2 = new TextureAtlas(
  [
    "../../assets/bricks3.jpg",
    "../../assets/bricks4.jpg",
    "../../assets/gun_idle.png",
    "../../assets/oskar.png",
    "../../assets/background.png",
    "../../assets/gun_shoot.png",
  ],
  100,
  2,
  3,
  () => {
    console.log("second texture atlas loaded");
  }
);

document.body.appendChild(textureAtlas2.canvas);

const combinedTextureAtlas = TextureAtlas.combineTextureAtlases(
  [textureAtlas, textureAtlas2],
  undefined,
  undefined,
  () => {
    console.log("combined texture atlas loaded");
  }
);

document.body.appendChild(combinedTextureAtlas.canvas);
