/**
 * (c) Facebook, Inc. and its affiliates. Confidential and proprietary.
 */

//==============================================================================
// Welcome to scripting in Spark AR Studio! Helpful links:
//
// Scripting Basics - https://fb.me/spark-scripting-basics
// Reactive Programming - https://fb.me/spark-reactive-programming
// Scripting Object Reference - https://fb.me/spark-scripting-reference
// Changelogs - https://fb.me/spark-changelog
//
// For projects created with v87 onwards, JavaScript is always executed in strict mode.
//==============================================================================

// How to load in modules
const Scene = require('Scene');
const FaceTracking = require('FaceTracking');
const Animation = require('Animation');

// Use export keyword to make a symbol available in scripting debug console
export const Diagnostics = require('Diagnostics');

// Enables async/await in JS [part 1]
(async function() {

// To use variables and functions across files, use export/import keyword
// export const animationDuration = 10;

// Use import keyword to import a symbol from another file
// import { animationDuration } from './script.js'

// To access scene objects
 const [energyBar] = await Promise.all([
   Scene.root.findFirst('start_bar')
 ]);

 const [confetti] = await Promise.all([
  Scene.root.findFirst('confetti')
 ]);

 const [win] = await Promise.all([
  Scene.root.findFirst('win')
 ]);

 // const [lose] = await Promise.all([
  //Scene.root.findFirst('lose')
 //]);

// To access class properties
const faceX = FaceTracking.face(0).cameraTransform.position.x;
const faceY = FaceTracking.face(0).cameraTransform.position.y;
const faceZ = FaceTracking.face(0).cameraTransform.position.z;

const previousFaceX = FaceTracking.face(0).cameraTransform.position.x.history(3).at(2);
const previousFaceY = FaceTracking.face(0).cameraTransform.position.y.history(3).at(2);
const previousFaceZ = FaceTracking.face(0).cameraTransform.position.z.history(3).at(2);

const differenceX = faceX.sub(previousFaceX).abs();
const differenceY = faceY.sub(previousFaceY).abs();
const differenceZ = faceZ.sub(previousFaceZ).abs();

const difference = differenceX.add(differenceY).add(differenceZ);

const differenceParameters = {
  durationMilliseconds: 18000,
  loopCount: 1,
  mirror: false,
}

const differenceDriver = Animation.timeDriver(differenceParameters);
const differenceSampler = Animation.samplers.easeInOutQuad(10, 310);
const scaleAnimation = Animation.animate(differenceDriver, differenceSampler);
energyBar.transform.scaleX = scaleAnimation;

difference.monitor().subscribe(function(event){
  if (event.newValue > 0.0075){
    differenceDriver.start();
  }
  if (event.newValue <= 0.0075){
    differenceDriver.stop();
  }
  if (energyBar.transform.scaleX.pinLastValue() > 300){
    confetti.hidden = false;
    win.hidden = false;
    //lose.hidden = false;
  } else{
    confetti.hidden = true;
    win.hidden = true;
    //lose.hidden = false;
  }
}); 

// To log messages to the console
Diagnostics.watch("FaceX - ", faceX);
Diagnostics.watch("Difference - ", difference);
Diagnostics.watch("Scale - ", energyBar.transform.scaleX);

// Enables async/await in JS [part 2]
})();
