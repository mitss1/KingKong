"use strict";

import * as THREE from "./three.module.js";
import { getHeightmapData } from "./utils.js";
import TextureSplattingMaterial from "./TextureSplattingMaterial.js";
import {getModel, LODModel} from "../models/ModelLoader.js";
import {OrbitControls} from "./OrbitControls.js";
import {Water} from "./Water.js";
import {VRButton} from "../Common/VRButton.js"
import { addTreeSprite } from "./sprite.js";
import {GLTFLoader} from "./GLTFLoader.js";


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
renderer.xr.enabled = true; // Enable VR

document.body.appendChild(VRButton.createButton(renderer)); //VR button

const vrCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
vrCamera.position.set( 0, 13.5, -0.4); // set the initial position entering VR
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

//const hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 10);
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

const texLoad = new THREE.TextureLoader();
const texCube = texLoad.load('models/building/textures/buildingBase.png');

const cube1 = new THREE.Mesh(
    new THREE.BoxGeometry(30,300,30),
    new THREE.MeshPhongMaterial({
      map: texCube
    })
);
cube1.receiveShadow = true;
cube1.castShadow = true;

let done = 0;

let building0 = [new THREE.Object3D(),
  new THREE.Object3D(),
  new THREE.Object3D(),
  new THREE.Object3D(),
  new THREE.Object3D()];

let building1 = [new THREE.Object3D(),
  new THREE.Object3D()];

let buildings = [building0,building1];
const ranges = [[0.0,5.0,10.0,25.0,50.0],[0.0,50.0]];

const buildingl = 'models/building/building';
let total = 0;
let index = 0;

function doesFileExist(urlToFile) {
  const xhr = new XMLHttpRequest();
  xhr.open('HEAD', urlToFile, false);
  xhr.send();

  if (xhr.status == "404") {
    return false;
  } else {
    return true;
  }
}
while(doesFileExist(buildingl + '0_' + index +'.glb')){
  console.log(buildingl + '0_' + index +'.glb');
  getModel(buildingl + '0_' + index +'.glb', index,(gltf,ind)=>{
      gltf.scene.traverse(function (node) {
      if (node.isMesh) {
        node.receiveShadow = true;
        node.castShadow = true;
      }
    });
      building0[ind].add(gltf.scene.children[0]);
      done++;
  });
  index++;
}
building0[4].add(cube1.clone(true));
total = index;
index = 0;
while(doesFileExist(buildingl + '1_' + index +'.glb')){
  console.log(buildingl + '1_' + index +'.glb');
  getModel(buildingl + '1_' + index +'.glb', index,(gltf,ind)=>{
    gltf.scene.traverse(function (node) {
      if (node.isMesh) {
        node.receiveShadow = true;
        node.castShadow = true;
      }
    });
    gltf.scene.children[0].scale.set(15.0,1.5,15.0);
    building1[ind].add(gltf.scene.children[0]);
    done++;
  });
  index++;
}
building1[index].add(cube1.clone(true));

total += index;
//building4.add(cube1);

// x = [-26 , -8]
// y = [-28 ,-10]

// max x [-95,95]
// max y [-95,95]

let maxDist = 35;
let spacing = 4;

function waitForElement() {
  console.log(done);
  console.log(total);
  if(done < total){
    setTimeout(waitForElement,250);
  } else {
    let x = -maxDist;
    let y = -maxDist;
    while(x<maxDist){
      while(y<maxDist){
        if(Math.sqrt(x*x+y*y) < maxDist && (x < -26 || x > -8 || y < -28 || y > -10) && (x < -3 || x > 3 || y < -2 || y > 2)) {
          const i = Math.floor(Math.random()*buildings.length);
          console.log(i);
          const lod = LODModel(
              buildings[i].map((model) => model.clone(true)),
              scene,
              0.04,
              x + Math.random() * 3 - 1, 2.05, y + Math.random() * 3 - 1,
              ranges[i]
          );
          console.log(lod);
          scene.add(lod);
        }
        y += spacing;
      }
      y = -maxDist;
      x += spacing;
    }
  }
}
waitForElement();

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


getModel('models/empire_state/empireState.glb',0,(model) => {
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

scene.fog = new THREE.FogExp2(0xffffff,0.05);

// Implement a centerNode -- Add planes
const centerNode = new THREE.Group();

// Add centerNode to scene
scene.add(centerNode);


const plane = new THREE.Object3D();
const plane2 = new THREE.Object3D();

const planeloader = new GLTFLoader();
planeloader.load('models/planes/plane.glb', (gltf) => {
    gltf.scene.traverse(function (node) {
        if (node.isMesh) {
            node.receiveShadow = true;
            node.castShadow = true;
        }
    });
  // Set plane position
  gltf.scene.position.set(0, 0, 0);
  // Set plane rotation
  // Set plane scale
  gltf.scene.scale.set(0.1, 0.1, 0.1);
  // Add plane to scene
  scene.add(gltf.scene);
  // Set plane as the object to be animated
  plane.add(gltf.scene);
});

const planeloader2 = new GLTFLoader();
planeloader2.load('models/planes/plane.glb', (gltf) => {
    gltf.scene.traverse(function (node) {
        if (node.isMesh) {
            node.receiveShadow = true;
            node.castShadow = true;
        }
    });
  // Set plane position
  gltf.scene.position.set(0, 0, 0);
  // Set plane rotation
  // Set plane scale
  gltf.scene.scale.set(0.1, 0.1, 0.1);
  // Add plane to scene
  scene.add(gltf.scene);
  // Set plane as the object to be animated
  plane2.add(gltf.scene);
});

// Move plane along curve
function animate() {
  // Get time
  const time = Date.now();
  // Get position along curve
  const position = curve.getPointAt( ( time % 10000 ) / 10000 );
  // Get rotation along curve
  const tangent = curve.getTangentAt( ( time % 10000 ) / 10000 ).normalize();
  // Set plane position
  plane.position.copy(position);
  // Set plane rotation
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, -1), tangent);
  plane.quaternion.copy(quaternion);
  // Set plane scale
  plane.scale.set(0.5, 0.5, 0.5);
  // Add plane to scene
  scene.add(plane);
}

// Move plane2 along curve
function animate2() {
  // Get time
  const time = Date.now();
  // Get position along curve
  const position = curve2.getPointAt( ( time % 10000 ) / 10000 );
  // Get rotation along curve
  const tangent = curve2.getTangentAt( ( time % 10000 ) / 10000 ).normalize();
  // Set plane position
  plane2.position.copy(position);
  // Set plane rotation
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, -1), tangent);
  plane2.quaternion.copy(quaternion);
  // Set plane scale
  plane2.scale.set(0.5, 0.5, 0.5);
  // Add plane to scene
  scene.add(plane2);
}

// CatMulRomCurve3 closed loop for first plane
const curve = new THREE.CatmullRomCurve3([
  new THREE.Vector3( -5, 15, 5 ),
  new THREE.Vector3( -2.5, 13, -2.5 ),
  new THREE.Vector3( 5, 18, -5 ),
  new THREE.Vector3( 2.5, 14, -2.5 ),
  new THREE.Vector3( 5, 19, 5 )
]);

// CatMulRomCurve3 closed loop for second plane
const curve2 = new THREE.CatmullRomCurve3([
  new THREE.Vector3( 6, 15, 4 ),
  new THREE.Vector3( -2.5, 16, 2.5 ),
  new THREE.Vector3( -2.5, 19, 2.5 ),
  new THREE.Vector3( -2.5, 14, -2.5 ),
  new THREE.Vector3( 6, 19, -5 )
]);
// Ends meet
curve.closed = true;
const points = curve.getPoints( 50 );
const geometryCurve = new THREE.BufferGeometry().setFromPoints( points );
//Color of first curve
const materialCurve = new THREE.LineBasicMaterial( { color : white, transparent : true, opacity : 0.0 } );
const curveObject = new THREE.Line( geometryCurve, materialCurve );
scene.add( curveObject );

curve2.closed = true;
const points2 = curve2.getPoints( 50 );
const geometryCurve2 = new THREE.BufferGeometry().setFromPoints( points2 );
//Color of second curve
const materialCurve2 = new THREE.LineBasicMaterial( { color : white, transparent : true, opacity : 0.0 } );
const curveObject2 = new THREE.Line( geometryCurve2, materialCurve2 );
scene.add( curveObject2 );

//første klynge
addTreeSprite(-20,-8, 3, -17, -11, scene);
//andre klynge
addTreeSprite(-28,-10, 3.24, -28, -18, scene);
//tredje klynge
addTreeSprite(-20,-8, 3.5, -28, -17, scene);

//Når man reskalerer vinduet
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize);

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
  console.log(scene.children);
  if (scene.children[6] !== undefined) {
    //console.log(scene.children[6].getCurrentLevel());
  }
  //console.log(building0);
  water.material.uniforms['time'].value += 1.0/240.0;

  //Animerer fly
  animate();
  animate2();

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(loop);
