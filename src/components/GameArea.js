import React, { Component } from "react";
import * as PIXI from 'pixi.js';
import { ALPHA_MODES } from "pixi.js";

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

function hitTestRecctangle(r1, r2) {
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


export default class GameArea extends Component {
  constructor(props) {
    super(props);
    // this.state = this.play;
  }

  // play(delta) {

  // }

  render() {
    const app = new PIXI.Application({
      width: 512,
      height: 512,
      antialias: true,
      backgroundAlpha: 0.5,
      backgroundColor: 0x061639,
      resolution: 1,
    });
    // app.renderer.view.style.position = "absolute";
    // app.renderer.view.style.display = "block";
    // app.renderer.resize(window.innerWidth, window.innerHeight);


    // app.loader
    //   .add("assets/cat.png")
    //   .add("assets/tileset.png")
    //   .load(() => {
    //     const cat = new PIXI.Sprite(
    //       app.loader.resources["assets/cat.png"].texture
    //     );
    //     cat.position.set(96, 96);
    //     cat.scale.set(0.5, 0.5);
    //     // cat.anchor.set(0.5, 0.5);
    //     cat.pivot.set(32, 32);
    //     cat.rotation = 0.5;

    //     const texture = PIXI.utils.TextureCache["assets/tileset.png"];
    //     texture.frame = new PIXI.Rectangle(192, 128, 64, 64);
    //     const rocket = new PIXI.Sprite(texture);
    //     rocket.position.set(32, 32);


    //     app.stage.addChild(cat);
    //     app.stage.addChild(rocket);
    //   });

    
    app.loader
      .add("assets/treasureHunter.json")
      .load(() => {
        const id = app.loader.resources["assets/treasureHunter.json"].textures;
        app.stage.addChild(new PIXI.Sprite(id["dungeon.png"]));

        const explorer = new PIXI.Sprite(
          id["explorer.png"]
        );
        explorer.position.set(
          68, 
          app.stage.height / 2 - explorer.height / 2);
        explorer.vx = explorer.vy = 0;
        app.stage.addChild(explorer);

        const treasure = new PIXI.Sprite(id["treasure.png"])
        treasure.position.set(
          app.stage.width - treasure.width - 48, 
          app.stage.height / 2 - treasure.height / 2);
        app.stage.addChild(treasure);

        const door = new PIXI.Sprite(id["door.png"]);
        door.position.set(32, 0);
        app.stage.addChild(door);

        const numberOfBlobs = 6,
          spacing = 48,
          xOffset = 150;
        for (let i = 0; i < numberOfBlobs; i++) {
          const blob = new PIXI.Sprite(id["blob.png"]);
          blob.position.set(
            spacing * i + xOffset,
            randomInt(32, app.stage.height - blob.height - 32)
          );
          
          app.stage.addChild(blob);
        }

        const rectangle = new PIXI.Graphics();
        rectangle.beginFill(0xDDDDDD);
        rectangle.alpha = 0.8;
        rectangle.lineStyle(2, 0x000000, 0.8);
        rectangle.drawRoundedRect(0, 0, 64, 32);
        rectangle.position.set(explorer.x - 32, explorer.y - 32);
        rectangle.endFill();
        app.stage.addChild(rectangle);

        const message = new PIXI.Text(" ㅎㅇㅎㅇ ", {
          // fontFamily: "Arial",
          fontSize: 16,
          fill: "black",
          // stroke: '#ff3300',
          // strokeThickness: 4,
          // dropShadow: true,
          dropShadowColor: "#000000",
          dropShadowBlur: 4,
          dropShadowAngle: Math.PI / 6,
          dropShadowDistance: 6,
          wordWrap: true,
          wordWrapWidth: 100,
          align: "center",
        });
        message.position.set(rectangle.x, rectangle.y);
        app.stage.addChild(message);
        rectangle.width = 100;

        let tick = 0;
        

        // Keyvoard Inputs
        let left = keyboard("ArrowLeft"),
          up = keyboard("ArrowUp"),
          right = keyboard("ArrowRight"),
          down = keyboard("ArrowDown");
        
        // Left
        left.press = () => {
          explorer.vx = -2;
          explorer.vy = 0;
        }
        left.release = () => {
          if (!right.isDown && explorer.vy === 0) {
            explorer.vx = 0;
          }      
        }

        // Up
        up.press = () => {
          explorer.vy = -2;
          explorer.vx = 0;
        };
        up.release = () => {
          if (!down.isDown && explorer.vx === 0) {
            explorer.vy = 0;
          }
        };
      
        // Right
        right.press = () => {
          explorer.vx = 2;
          explorer.vy = 0;
        };
        right.release = () => {
          if (!left.isDown && explorer.vy === 0) {
            explorer.vx = 0;
          }
        };
      
        // Down
        down.press = () => {
          explorer.vy = 2;
          explorer.vx = 0;
        };
        down.release = () => {
          if (!up.isDown && explorer.vx === 0) {
            explorer.vy = 0;
          }
        };

        explorer.vx = 1;
        app.ticker.add(delta => {
          // this.state(delta);
          explorer.x += explorer.vx;
          explorer.y += explorer.vy;
          rectangle.position.set(explorer.x - 32, explorer.y - 32);
          message.position.set(rectangle.x, rectangle.y);

          tick += 1;
          if (tick > 180) {
            rectangle.visible = false;
            message.visible = false;
          }
          if (tick > 360) {
            message.text += message.text;
            tick = 0;
            rectangle.visible = true;
            message.visible = true;
          }
        });
      });


    let pixiContainer = null;
    return (
      <div ref={(element) => {
        pixiContainer = element;
        if(pixiContainer) {
          pixiContainer.appendChild(app.view);
          // this.setup();
        }
      }} />
    )


  }

}