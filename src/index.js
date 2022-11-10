"use strict";

import * as THREE from "./three.module.js";
import { getHeightmapData } from "./utils.js";
import TextureSplattingMaterial from "./TextureSplattingMaterial.js";
import {getModel, loadModel, LODModel} from "../models/ModelLoader.js";
import {OrbitControls} from "./OrbitControls.js";
import {Water} from "./Water.js";


const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("canvas"),
    antialias: true,
});
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;

const white = new THREE.Color(THREE.Color.NAMES.white);
renderer.setClearColor(white, 1.0);

const scene = new THREE.Scene();

//Camera for vr
const vrCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
vrCamera.position.set( 0, 10, 0); // set the initial position entering VR
//When entering VR
renderer.xr.addEventListener(`sessionstart`, function (){
  scene.add(vrCamera);
  vrCamera.add(camera);
})
//When exiting VR
renderer.xr.addEventListener(`sessionend`, function (){
  scene.remove(vrCamera);
  camera.remove(vrCamera);
})

const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);

const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set( -12, 20, -20 );
camera.lookAt(-10,0,-10);
controls.update();

scene.add(camera);
//Camera end


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
const height = 4;
const geometry = new THREE.PlaneGeometry(200, 200, size-1, size-1);

//LIGHT
const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
hemiLight.color.setHSL(0.6,1,0.6);
hemiLight.groundColor.setHSL(0.095,1,0.75);
hemiLight.position.set(0,50,0);
scene.add(hemiLight);

const hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 10);
//scene.add(hemiLightHelper);

const dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
dirLight.color.setHSL( 0.1, 1, 0.95 );
dirLight.position.set( - 1, 1.75, 1 );
dirLight.position.multiplyScalar( 10 );
scene.add( dirLight );

dirLight.castShadow = true;

dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;

const d = 50;

dirLight.shadow.camera.left = - d;
dirLight.shadow.camera.right = d;
dirLight.shadow.camera.top = d;
dirLight.shadow.camera.bottom = - d;

dirLight.shadow.camera.far = 3500;
dirLight.shadow.bias = - 0.0001;

//const dirLightHelper = new THREE.DirectionalLightHelper( dirLight, 10 );
//scene.add( dirLightHelper );



geometry.rotateX((Math.PI / 180)*-90);
const terrainImage = new Image();



terrainImage.onload = () => {
  const data = getHeightmapData(terrainImage,size);

  for(let i = 0; i < data.length; i++){
    geometry.attributes.position.setY(i, data[i] * height);

  }

  const mesh = new THREE.Mesh(geometry,material);

  mesh.receiveShadow = true;

  scene.add(mesh);
};

let done = 0;

let building0 = new THREE.Object3D();
let building1 = new THREE.Object3D();
let building2 = new THREE.Object3D();
let building3 = new THREE.Object3D();
done--;
getModel('models/building/building0_0.glb', (gltf)=>{
  gltf.scene.traverse(function (node) {
    if (node.isMesh) {
      node.receiveShadow = true;
      node.castShadow = true;
    }
  });
  building0.add(gltf.scene.children[0]);
  done++;
});
done--;
getModel('models/building/building0_1.glb', (gltf)=>{
  gltf.scene.traverse(function (node) {
    if (node.isMesh) {
      node.receiveShadow = true;
      node.castShadow = true;
    }
  });
  building1.add(gltf.scene.children[0]);
  done++;
});
done--;
getModel('models/building/building0_2.glb', (gltf)=>{
  gltf.scene.traverse(function (node) {
    if (node.isMesh) {
      node.receiveShadow = true;
      node.castShadow = true;
    }
  });
  building2.add(gltf.scene.children[0]);
  done++;
});
done--;
getModel('models/building/building0_3.glb', (gltf)=>{
  gltf.scene.traverse(function (node) {
    if (node.isMesh) {
      node.receiveShadow = true;
      node.castShadow = true;
    }
  });
  building3.add(gltf.scene.children[0]);
  done++;
});

// x = [-26 , -8]
// y = [-28 ,-10]

// max x [-95,95]
// max y [-95,95]

let x = -95;
let y = -95;

function waitForElement() {
  if(done !== 0){
    setTimeout(waitForElement,250);
  } else {

    while(x < 90){
      while(y < 90) {
        if(y < -11 && y > -29 && x < -9 && x > -27){
          y = -11;
        }
        y += 4;
        const lod = LODModel([
              building0.clone(),
              building1.clone(),
              building2.clone(),
              building3.clone()],
            scene,
            0.04,
            x + Math.random()*2 -1,2.05,y + Math.random()*2 -1
        );
        scene.add(lod);
      }
      x+=4;
      y=-95;
    }
  }
}
waitForElement(done);

//Water
const waterGeometry = new THREE.PlaneGeometry(2048,2048);

let water = new Water(waterGeometry,
    {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: new THREE.TextureLoader().load('images/waternormals.jpg',(texture) => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }),
      sunDirection: new THREE.Vector3(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
      fog: scene.fog !== undefined
    });
water.rotation.x = -Math.PI / 2;
water.position.setY(1.8);
scene.add(water);


getModel('models/empire_state/empireState.glb',(model) => {
  model.scene.position.set(0,2.05,0);
  model.scene.scale.set(0.04,0.04,0.04);
  model.scene.traverse(function (node) {
    if (node.isMesh) {
      node.receiveShadow = true;
      node.castShadow = true;
    }
  });
  scene.add(model.scene);
});

terrainImage.src = 'images/HeightMap.png';

const road = new THREE.TextureLoader().load('images/road/road_12.jpg');
const grass = new THREE.TextureLoader().load('images/grass.png');
const alpha = new THREE.TextureLoader().load('images/terrain.png');

grass.wrapS = THREE.RepeatWrapping;
grass.wrapT = THREE.RepeatWrapping;


road.wrapS = THREE.RepeatWrapping;
road.wrapT = THREE.RepeatWrapping;

road.repeat.multiplyScalar(500);
grass.repeat.multiplyScalar(100);

const material = new TextureSplattingMaterial({
  color: THREE.Color.NAMES.grey,
  colorMaps: [road,grass],
  alphaMaps: [alpha]
});

material.wireframe = false;

scene.fog = new THREE.FogExp2(0xffffff,0.01);


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
  //console.log(lod.getCurrentLevel());
  //console.log(scene.children);
  //console.log(lod.getCurrentLevel());

  water.material.uniforms['time'].value += 1.0/240.0;

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(loop);
