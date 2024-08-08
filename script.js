import * as PIXI from 'pixi.js';
import TWEEN from 'tween.js';


const colors = {
  red: 0xd1191f,
  yellow: 0xffc841,
};


const gameWidth = 800;
const gameHeight = 600;
const parkingSpotWidth = 100;
const parkingSpotHeight = 100;
const parkingSpotMargin = 50;
const carSize = 50;
const handSize = 50;
const handSpeed = 2;
const lineThickness = 10;
const lineColor = 0xffffff;
const failImage = 'fail.png';
const finalSceneDuration = 2000;
const fadeInDuration = 500;
const fadeOutDuration = 500;
const playNowUrl = 'https://roasup.com';


let app;
let redCar;
let yellowCar;
let redHand;
let yellowHand;
let redLine;
let yellowLine;
let redTrajectory = [];
let yellowTrajectory = [];
let finalSceneTimeout;

function initializeGame() {
  // Initialize Pixi.js app
  app = new PIXI.Application({
    width: gameWidth,
    height: gameHeight,
    backgroundColor: 0x545454,
    resolution: window.devicePixelRatio || 1,
    antialias: true,
  });
  document.body.appendChild(app.view);

  // Initialize cars
  redCar = new PIXI.Sprite.from('car_red.png');
  redCar.anchor.set(0.5);
  redCar.x = parkingSpotMargin;
  redCar.y = parkingSpotMargin;
  redCar.interactive = true;
  redCar.buttonMode = true;
  redCar.on('pointerdown', onCarClicked);
  app.stage.addChild(redCar);

  yellowCar = new PIXI.Sprite.from('car_yellow.png');
  yellowCar.anchor.set(0.5);
  yellowCar.x = gameWidth - parkingSpotMargin - parkingSpotWidth;
  yellowCar.y = parkingSpotMargin;
  yellowCar.interactive = true;
  yellowCar.buttonMode = true;
  yellowCar.on('pointerdown', onCarClicked);
  app.stage.addChild(yellowCar);

  // Initialize hands
  redHand = new PIXI.Sprite.from('hand_red.png');
  redHand.anchor.set(0.5);
  redHand.x = redCar.x;
  redHand.y = redCar.y;
  redHand.visible = false;
  app.stage.addChild(redHand);

  yellowHand = new PIXI.Sprite.from('hand_yellow.png');
  yellowHand.anchor.set(0.5);
  yellowHand.x = yellowCar.x;
  yellowHand.y = yellowCar.y;
  yellowHand.visible = false;
  app.stage.addChild(yellowHand);

  // Initialize lines
  redLine = new PIXI.Graphics();
  redLine.lineStyle(lineThickness, lineColor);
  redLine.visible = false;
  app.stage.addChild(redLine);

  yellowLine = new PIXI.Graphics();
  yellowLine.lineStyle(lineThickness, lineColor);
  yellowLine.visible = false;
  app.stage.addChild(yellowLine);

  // Initialize final scene elements
   // Initialize final scene elements
   const finalSceneBackground = new PIXI.Sprite.from('final_scene_background.png');
   finalSceneBackground.alpha = 0;
   app.stage.addChild(finalSceneBackground);
 
   const failImageSprite = new PIXI.Sprite.from(failImage);
   failImageSprite.alpha = 0;
   failImageSprite.x = gameWidth / 2;
   failImageSprite.y = gameHeight / 2;
   app.stage.addChild(failImageSprite);
 
   const logoSprite = new PIXI.Sprite.from('logo.png');
   logoSprite.alpha = 0;
   logoSprite.x = gameWidth / 2;
   logoSprite.y = gameHeight / 2 + 100;
   app.stage.addChild(logoSprite);
 
   const playNowButton = new PIXI.Sprite.from('play_now_button.png');
   playNowButton.alpha = 0;
   playNowButton.x = gameWidth / 2;
   playNowButton.y = gameHeight / 2 + 200;
   playNowButton.interactive = true;
   playNowButton.buttonMode = true;
   playNowButton.on('pointerdown', () => {
     window.location.href = playNowUrl;
   });
   app.stage.addChild(playNowButton);
 
   // Initialize game loop
   app.ticker.add(() => {
     TWEEN.update();
   });
 
   // Start game loop
   animate();
 }
 
 function onCarClicked(event) {
   const car = event.target;
   const hand = car === redCar ? redHand : yellowHand;
   const line = car === redCar ? redLine : yellowLine;
   const trajectory = car === redCar ? redTrajectory : yellowTrajectory;
 
   hand.visible = true;
   hand.x = car.x;
   hand.y = car.y;
 
   app.stage.on('pointermove', (event) => {
     hand.x = event.data.global.x;
     hand.y = event.data.global.y;
     trajectory.push({ x: hand.x, y: hand.y });
     line.clear();
     line.lineStyle(lineThickness, lineColor);
     line.moveTo(trajectory[0].x, trajectory[0].y);
     for (let i = 1; i < trajectory.length; i++) {
       line.lineTo(trajectory[i].x, trajectory[i].y);
     }
   });
 
   app.stage.on('pointerup', () => {
     app.stage.off('pointermove');
     app.stage.off('pointerup');
     hand.visible = false;
     line.visible = true;
 
     const parkingSpot = car === redCar ? redParkingSpot : yellowParkingSpot;
     if (isTrajectoryValid(trajectory, parkingSpot)) {
       car.x = parkingSpot.x;
       car.y = parkingSpot.y;
       car.interactive = false;
     } else {
       line.visible = false;
       trajectory.length = 0;
     }
 
     if (!redCar.interactive && !yellowCar.interactive) {
       showFinalScene();
     }
   });
 }
 
 function isTrajectoryValid(trajectory, parkingSpot) {
   const lastPoint = trajectory[trajectory.length - 1];
   return Math.abs(lastPoint.x - parkingSpot.x) < parkingSpotWidth / 2 &&
     Math.abs(lastPoint.y - parkingSpot.y) < parkingSpotHeight / 2;
 }
 
 function showFinalScene() {
   clearTimeout(finalSceneTimeout);
   finalSceneTimeout = setTimeout(() => {
     TWEEN.removeAll();
     finalSceneBackground.alpha = 1;
     failImageSprite.alpha = 1;
     logoSprite.alpha = 1;
     playNowButton.alpha = 1;
   }, finalSceneDuration);
 }
 
 function animate() {
   requestAnimationFrame(animate);
   TWEEN.update();
 }
 
 initializeGame();