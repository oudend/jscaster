import { TextureLoader } from "./textureLoader.js";

class MultiTextureLoader {
  constructor(textureLoaders) {
    this.textureLoaders = textureLoaders;
    this.currentTextureLoaderIndex = 0;
    this.isMultiTextureLoader = true;
  }

  setTextureLoader(index) {
    if (index < 0 || index > this.textureLoaders.length)
      throw new Error("Index out of bounds");
    this.currentTextureLoaderIndex = index;
  }

  get textureIndex() {
    return this.textureLoaders[this.currentTextureLoaderIndex].textureIndex;
  }

  get textureLoader() {
    return this.textureLoaders[this.currentTextureLoaderIndex];
  }

  get textureImage() {
    return this.textureLoaders[this.currentTextureLoaderIndex].textureImage;
  }

  get loaded() {
    for (let loader of this.textureLoaders) {
      if (!loader.loaded) return false;
    }
    return true;
  }
}

export { MultiTextureLoader };
