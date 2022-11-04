"use strict";

import * as THREE from "./three.module.js";
import { getHeightmapData } from "./utils.js";
import TextureSplattingMaterial from "./TextureSplattingMaterial.js";
import {getModel, loadModel} from "../models/ModelLoader.js";

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("canvas"),
  antialias: true,
});


const white = new THREE.Color(THREE.Color.NAMES.white);
renderer.setClearColor(white, 1.0);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
camera.position.z += 10;
camera.position.x += 10;
camera.position.y += 10;

camera.lookAt(0, 0, 0);

scene.add(camera);

const axesHelper = new THREE.AxesHelper(1);
scene.add(axesHelper);

const sun = new THREE.DirectionalLight(white, 1.0);
scene.add(sun);

const loader = new THREE.CubeTextureLoader();
const texture = loader.load([
  'images/Daylight_Right.jpg',
  'images/Daylight_Left.jpg',
  'images/Daylight_Top.jpg',
  'images/Daylight_Bottom.jpg',
  'images/Daylight_Front.jpg',
  'images/Daylight_Back.jpg',
]);
scene.background = texture;

// TODO: implement terrain.
const size = 1024;
const height = 1;
const geometry = new THREE.PlaneGeometry(50, 50, size-1, size-1);

const light = new THREE.SpotLight();
light.position.set(10,10,10);
scene.add(light);

geometry.rotateX((Math.PI / 180)*-90);
const terrainImage = new Image();

terrainImage.onload = () => {
  const data = getHeightmapData(terrainImage,size);

  for(let i = 0; i < data.length; i++){
    geometry.attributes.position.setY(i, data[i] * height);
  }

  const mesh = new THREE.Mesh(geometry,material);

  //scene.add(mesh);
};

getModel('models/building/building0_0.glb',(model) => {
  model.scene.position.set(-10,5,0);
  model.scene.scale.set(0.04,0.04,0.04);
  scene.add(model.scene);
});
getModel('models/building/building0_1.glb',(model) => {
  model.scene.position.set(-5,5,0);
  model.scene.scale.set(0.04,0.04,0.04);
  scene.add(model.scene);
});
getModel('models/building/building0_2.glb',(model) => {
  model.scene.position.set(0,5,0);
  model.scene.scale.set(0.04,0.04,0.04);
  scene.add(model.scene);
});
getModel('models/building/building0_3.glb',(model) => {
  model.scene.position.set(5,5,0);
  model.scene.scale.set(0.04,0.04,0.04);
  scene.add(model.scene);
});


terrainImage.src = 'images/City_Grid.png';

const rock = new THREE.TextureLoader().load('images/Park_Texture.png');
const grass = new THREE.TextureLoader().load('images/Park_Texture.png');
const alpha = new THREE.TextureLoader().load('images/Park_Heightmap.png');

grass.wrapS = THREE.RepeatWrapping;
grass.wrapT = THREE.RepeatWrapping;


rock.wrapS = THREE.RepeatWrapping;
rock.wrapT = THREE.RepeatWrapping;

rock.repeat.multiplyScalar(1);
grass.repeat.multiplyScalar(1);

const material = new TextureSplattingMaterial({
  color: THREE.Color.NAMES.grey,
  colorMaps: [grass,rock],
  alphaMaps: [alpha]
});

material.wireframe = false;


function updateRendererSize() {
  const { x: currentWidth, y: currentHeight } = renderer.getSize(
    new THREE.Vector2()
  );
  const width = renderer.domElement.clientWidth;
  const height = renderer.domElement.clientHeight;

  if (width !== currentWidth || height !== currentHeight) {
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
}

function loop() {
  updateRendererSize();
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(loop);
