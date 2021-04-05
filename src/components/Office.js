import React, { Component } from "react";
import * as PIXI from 'pixi.js';
import { ALPHA_MODES, Container, Sprite } from "pixi.js";

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function keyboard(value) {
  let key = {};
  key.value = value;
  key.isDown = false;
  key.isUp = true;
  key.press = undefined;
  key.release = undefined;
  //The `downHandler`
  key.downHandler = event => {
    if (event.key === key.value) {
      if (key.isUp && key.press) key.press();
      key.isDown = true;
      key.isUp = false;
      event.preventDefault();
    }
  };

  //The `upHandler`
  key.upHandler = event => {
    if (event.key === key.value) {
      if (key.isDown && key.release) key.release();
      key.isDown = false;
      key.isUp = true;
      event.preventDefault();
    }
  };

  //Attach event listeners
  const downListener = key.downHandler.bind(key);
  const upListener = key.upHandler.bind(key);
  
  window.addEventListener(
    "keydown", downListener, false
  );
  window.addEventListener(
    "keyup", upListener, false
  );
  
  // Detach event listeners
  key.unsubscribe = () => {
    window.removeEventListener("keydown", downListener);
    window.removeEventListener("keyup", upListener);
  };
  
  return key;
}
function contain(sprite, container) {
  //Left
  if (sprite.x < container.x) {
    sprite.x = container.x;
    return "left";
  }

  //Top
  if (sprite.y < container.y) {
    sprite.y = container.y;
    return "top";
  }

  //Right
  if (sprite.x + sprite.width > container.width) {
    sprite.x = container.width - sprite.width;
    return "right";
  }

  //Bottom
  if (sprite.y + sprite.height > container.height) {
    sprite.y = container.height - sprite.height;
    return "bottom";
  }
}


function hitTestRectangle(r1, r2) {
  r1.centerX = r1.x + r1.width / 2;
  r1.centerY = r1.y + r1.height / 2;
  r2.centerX = r2.x + r2.width / 2;
  r2.centerY = r2.y + r2.height / 2;

  r1.halfWidth = r1.width / 2;
  r1.halfHeight = r1.height / 2;
  r2.halfWidth = r2.width / 2;
  r2.halfHeight = r2.height / 2;

  const vx = r1.centerX - r2.centerX;
  const vy = r1.centerY - r2.centerY;
  const combineHalfWidths = r1.halfWidth + r2.halfWidth;
  const combileHalfHeights = r1.halfHeight + r2.halfHeight;

  return Math.abs(vx) < combineHalfWidths && Math.abs(vy) < combileHalfHeights;
}


export default class TreasureHunter extends Component {
  constructor(props) {
    super(props);
    this.app = new PIXI.Application({
      width: 512,
      height: 512,
      antialias: true,
      backgroundAlpha: 0.5,
      backgroundColor: 0x061639,
      resolution: 1,
    });

    this.gameScene = new Container();
    this.app.stage.addChild(this.gameScene);

    this.gameOverScene = new Container();
    this.app.stage.addChild(this.gameOverScene);

    this.app.loader.add('assets/office.json')
      .load(() => this.setup());
  }

  setup() {
    //Create the `gameScene` group
    //Create the `door` sprite
    //Create the `player` sprite
    //Create the `treasure` sprite
    //Make the enemies
    //Create the health bar
    //Add some text for the game over message
    //Create a `gameOverScene` group
    //Assign the player's keyboard controllers
  
    this.gameOverScene.visible = false;

    // Create an alias for the texture atlas frame ids
    const id = this.app.loader.resources["assets/office.json"].textures;

    // apartment
    const nycApartment = new PIXI.Sprite(id["nyc_apartment.png"]);
    this.gameScene.addChild(nycApartment);

    // Door
    this.door = new PIXI.Sprite(id["door.png"]);
    this.door.position.set(32, 0);
    this.gameScene.addChild(this.door);

    // Explorer
    this.explorer = new PIXI.Sprite(id["explorer.png"]);
    this.explorer.x = 68;
    this.explorer.y = this.gameScene.height / 2 - this.explorer.height / 2;
    this.explorer.vx = 0;
    this.explorer.vy = 0;
    this.gameScene.addChild(this.explorer);

    // Treasure
    this.treasure = new PIXI.Sprite(id["treasure.png"]);
    this.treasure.x = this.gameScene.width - this.treasure.width - 48;
    this.treasure.y = this.gameScene.height / 2 - this.treasure.height / 2;
    this.gameScene.addChild(this.treasure);



    const numberOfCats = 6;
    const spacing = 48;
    const xOffset = 150
    const speed = 2;
    let direction = 1;
    this.cats = [];
    for (let i = 0; i < numberOfCats; i++) {
      //Make a cat
      const cat = new Sprite(id["cat.png"]);

      //Space each cat horizontally according to the `spacing` value.
      //`xOffset` determines the point from the left of the screen
      //at which the first cat should be added
      const x = spacing * i + xOffset;

      //Give the cat a random `y` position
      const y = randomInt(0, this.app.stage.height - cat.height);

      //Set the cat's position
      cat.x = x;
      cat.y = y;

      //Set the cat's vertical velocity. `direction` will be either `1` or
      //`-1`. `1` means the enemy will move down and `-1` means the cat will
      //move up. Multiplying `direction` by `speed` determines the cat's
      //vertical direction
      cat.vy = speed * direction;

      //Reverse the direction for the next cat
      direction *= -1;

      //Push the cat into the `cats` array
      this.cats.push(cat);

      //Add the cat to the `gameScene`
      this.gameScene.addChild(cat);
    }
    //Create the health bar
    this.healthBar = new PIXI.Container();
    this.healthBar.position.set(this.app.stage.width - 170, 4)
    this.gameScene.addChild(this.healthBar);

    //Create the black background rectangle
    const innerBar = new PIXI.Graphics();
    innerBar.beginFill(0x000000);
    innerBar.drawRect(0, 0, 128, 8);
    innerBar.endFill();
    this.healthBar.addChild(innerBar);

    //Create the front red rectangle
    const outerBar = new PIXI.Graphics();
    outerBar.beginFill(0xFF3300);
    outerBar.drawRect(1, 1, 126, 6);
    outerBar.endFill();
    this.healthBar.addChild(outerBar);

    this.healthBar.outer = outerBar;

    this.message = new PIXI.Text("The End!", {
      fontFamily: "Futura",
      fontSize: 64,
      fill: "white"
    });
    this.message.x = 120;
    this.message.y = this.app.stage.height / 2 - 32;
    this.gameOverScene.addChild(this.message);


        // Keyvoard Inputs
        const left = keyboard("ArrowLeft"),
          up = keyboard("ArrowUp"),
          right = keyboard("ArrowRight"),
          down = keyboard("ArrowDown");
        
        // Left
        left.press = () => {
          this.explorer.vx = -2;
          this.explorer.vy = 0;
        }
        left.release = () => {
          if (!right.isDown && this.explorer.vy === 0) {
            this.explorer.vx = 0;
          }      
        }

        // Up
        up.press = () => {
          this.explorer.vy = -2;
          this.explorer.vx = 0;
        };
        up.release = () => {
          if (!down.isDown && this.explorer.vx === 0) {
            this.explorer.vy = 0;
          }
        };
      
        // Right
        right.press = () => {
          this.explorer.vx = 2;
          this.explorer.vy = 0;
        };
        right.release = () => {
          if (!left.isDown && this.explorer.vy === 0) {
            this.explorer.vx = 0;
          }
        };
      
        // Down
        down.press = () => {
          this.explorer.vy = 2;
          this.explorer.vx = 0;
        };
        down.release = () => {
          if (!up.isDown && this.explorer.vx === 0) {
            this.explorer.vy = 0;
          }
        };
      
    //set the game state to `play`
    this.state = this.play;
  
    //Start the game loop 
    this.app.ticker.add(delta => this.gameLoop(delta));
  }

  gameLoop(delta) {
    this.state(delta);
  }

  play(delta) {
    this.explorer.x += this.explorer.vx;
    this.explorer.y += this.explorer.vy;
  
    let explorerHit = false;
    this.cats.forEach((cat) => {

      //Move the cat
      cat.y += cat.vy;
    
      //Check the cat's screen boundaries
      let catHitsWall = contain(cat, {x: 28, y: 10, width: 488, height: 480});
    
      //If the cat hits the top or bottom of the stage, reverse
      //its direction
      if (catHitsWall === "top" || catHitsWall === "bottom") {
        cat.vy *= -1;
      }
    
      //Test for a collision. If any of the enemies are touching
      //the explorer, set `explorerHit` to `true`
      if(hitTestRectangle(this.explorer, cat)) {
        explorerHit = true;
      }

      if(explorerHit) {
        this.explorer.alpha = 0.5;
        this.healthBar.outer.width -= 1;
      } else {
        this.explorer.alpha = 1;
      }

      

      if (hitTestRectangle(this.explorer, this.treasure)) {
        this.treasure.x = this.explorer.x + 8;
        this.treasure.y = this.explorer.y + 8;
      }

      if (this.healthBar.outer.width < 0) {
        this.state = this.end;
        this.message.text = "You lost!";
      }
    
      if (hitTestRectangle(this.treasure, this.door)) {
        this.state = this.end;
        this.message.text = "You won!";
      }    
    });
  }

  end() {
    this.gameOverScene.visible = true
  }

  render() {
    let pixiContainer = null;
    return (
      <div ref={(element) => {
        pixiContainer = element;
        if(pixiContainer) {
          pixiContainer.appendChild(this.app.view);
          // this.setup();
        }
      }} />
    )
  }
}