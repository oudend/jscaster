import { Vector2 } from "../../src/jscaster.js";

class SimpleEnemy {
  constructor(sprite, target, health, speed, damage, onDeath) {
    this.sprite = sprite;
    this.health = health;
    this.speed = speed;
    this.damage = damage;
    this.target = target;

    this.onDeath = onDeath;
    this.isDead = false;

    this.animations = {};

    this.stopDistance = 2;

    this.animationRunning = false;
    this.currentAnimation = "";
  }

  addAnimation(name, timings, onFinish) {
    // exampleTimings = [
    //     { duration: 100, animationIndex: 1 },
    //     { duration: 205, animationIndex: 2 },
    //     { duration: 100, animationIndex: 3 },
    //     { duration: 0, animationIndex: 0 },
    //   ];

    this.animations[name] = {
      timings: timings,
      running: false,
      current: 0,
      index: 0,
      onFinish: onFinish,
    };
  }

  //TODO: add a loop parameter
  startAnimation(name, cancelCurrent = true) {
    if (!cancelCurrent && this.animationRunning) return;

    if (this.animationRunning) {
      this.animations[this.currentAnimation].running = false;
    }

    //console.log(name, this.animations);

    this.currentAnimation = name;
    this.animationRunning = true;

    this.animations[name].running = true;
    this.animations[name].current = Date.now();
    this.sprite.material.setCrop(
      this.sprite.material.textureLoader.crops[
        this.animations[name].timings[0].animationIndex
      ]
    );
    // this.sprite.textureLoader.setTextureLoader(
    //   this.animations[name].timings[0].animationIndex
    // );
  }

  cancelAnimation() {
    if (!this.animationRunning) return;
    //console.log(this.animations[this.currentAnimation], this.animationRunning);
    const name = this.currentAnimation;

    this.animations[name].running = false;
    this.animations[name].index = 0;
    this.animationRunning = false;
    this.currentAnimation = "";
  }

  #handleAnimations() {
    for (let animation of Object.values(this.animations)) {
      if (!animation.running) continue;

      const timing = animation.timings[animation.index];

      if (Date.now() - animation.current < timing.duration) continue;

      if (animation.index + 1 >= animation.timings.length) {
        animation.running = false;
        animation.index = 0;
        this.animationRunning = false;
        this.currentAnimation = "";
        //this.sprite.textureLoader.setTextureLoader(timing.animationIndex);
        this.sprite.material.setCrop(
          this.sprite.material.textureLoader.crops[timing.animationIndex]
        );
        if (animation.onFinish) animation.onFinish();
        continue;
      }

      animation.current = Date.now();

      animation.index++;

      this.sprite.material.setCrop(
        this.sprite.material.textureLoader.crops[timing.animationIndex]
      );
      // this.sprite.textureLoader.setTextureLoader(
      //   animation.timings[animation.index].animationIndex
      // );
    }
  }

  #handleChase() {
    if (!this.target) return;

    const distance = Vector2.distance(
      this.target.position,
      this.sprite.position
    );

    if (distance < this.stopDistance) return;

    const direction = Vector2.subtract(
      this.target.position,
      this.sprite.position
    ).divide(distance);

    this.sprite.position.x += direction.x * this.speed;
    this.sprite.position.y += direction.y * this.speed;
  }

  //chase the target
  update() {
    this.#handleAnimations();
    this.#handleChase();

    if (this.health <= 0 && !this.isDead) {
      if (this.onDeath) this.onDeath();
      this.isDead = true;
    }
  }
}

export { SimpleEnemy };
