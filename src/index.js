"use strict";

import * as THREE from "./three.module.js";
import { getHeightmapData } from "./utils.js";
import TextureSplattingMaterial from "./TextureSplattingMaterial.js";
<<<<<<< Updated upstream
import { OrbitControls } from "./OrbitControls.js";
import {VRButton} from "../Common/VRButton.js";
import { Water } from "../Common/Water.js";
import { Sky } from "../Common/Sky.js";
=======
import {getModel, LODModel} from "../models/ModelLoader.js";
import {OrbitControls} from "./OrbitControls.js";
import {Water} from "./Water.js";
import {VRButton} from "../Common/VRButton.js"
>>>>>>> Stashed changes


const canvas = document.querySelector("canvas"); //Get canvas
const renderer = new THREE.WebGLRenderer({canvas});
renderer.xr.enabled = true; // Enable VR
renderer.setSize(window.innerWidth, window.innerHeight); // set the size of the renderer
document.body.appendChild(renderer.domElement); // add the renderer to the body of the document
document.body.appendChild(VRButton.createButton(renderer)); //VR button


const white = new THREE.Color(THREE.Color.NAMES.white);
renderer.setClearColor(white, 1.0);

const scene = new THREE.Scene()
{
    //Skybox
    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
        'images/Daylight_Right.jpg',
        'images/Daylight_Left.jpg',
        'images/Daylight_Top.jpg',
        'images/Daylight_Bottom.jpg',
        'images/Daylight_Front.jpg',
        'images/Daylight_Back.jpg',
    ]);
    //scene.background = texture;
};

//Himmel
function buildSky() {
    const sky = new Sky();
    sky.scale.setScalar(10000);
    scene.add(sky);
    return sky;
}

const sky = buildSky();

//Sol
function buildSun() {
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const sun = new THREE.Vector3();

    // Defining the x, y and z value for our 3D Vector
    const theta = Math.PI * (0.49 - 0.5);
    const phi = 2 * Math.PI * (0.205 - 0.5);
    sun.x = Math.cos(phi);
    sun.y = Math.sin(phi) * Math.sin(theta);
    sun.z = Math.sin(phi) * Math.cos(theta);

    sky.material.uniforms['sunPosition'].value.copy(sun);
    scene.environment = pmremGenerator.fromScene(sky).texture;
    return sun;
}

const sun = buildSun();

//Vann
function buildWater() {
    const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
    const water = new Water(
        waterGeometry,
        {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new THREE.TextureLoader().load('', function ( texture ) {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            }),
            alpha: 1.0,
            sunDirection: new THREE.Vector3(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 3.7,
            fog: scene.fog !== undefined
        }
    );
    water.rotation.x =- Math.PI / 2;
    scene.add(water);

    const waterUniforms = water.material.uniforms;
    return water;
}

const water = buildWater();

//Camera for vr
const vrCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
vrCamera.position.set( 0, 10, 1.7); // set the initial position entering VR
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

const controls = new OrbitControls(camera, renderer.domElement); //Orbit controls
camera.position.set( 0, 20, 100 ); // set the initial position
controls.update(); // update the controls

scene.add(camera); // add the camera to the scene

const axesHelper = new THREE.AxesHelper(1); //Axes helper
scene.add(axesHelper); // add the axes helper to the scene

const sun2 = new THREE.DirectionalLight(white, 1.0); //Sun
scene.add(sun2); // add the sun to the scene

// TODO: implement terrain.
const size = 128; //Size of the terrain
const height = 10; //Height of the terrain
const geometry = new THREE.PlaneGeometry(20, 20, size-1, size-1);

geometry.rotateX((Math.PI / 180)*-90); //Rotate the terrain
const terrainImage = new Image(); //Terrain const

terrainImage.onload = () => { //When the terrain image is loaded
    const data = getHeightmapData(terrainImage,size); //Get the heightmap data

    for(let i = 0; i < data.length; i++){ //For each heightmap data
        geometry.attributes.position.setY(i, data[i] * height); //Set the height of the terrain
    }

    const mesh = new THREE.Mesh(geometry,material); //Create the terrain
    scene.add(mesh); // add the terrain to the scene
};

//Add fog to the scene
//scene.fog = new THREE.FogExp2(white, 0.025);


terrainImage.src = 'images/byMiljo.png'; // Importerer bilde til terreng

const bygg = new THREE.TextureLoader().load('images/apartments7.png');
const rock = new THREE.TextureLoader().load('104_road textures pach-seamless/road texture pack-seamless (12).jpg');
const grass = new THREE.TextureLoader().load('images/grass.png');
const road = new THREE.TextureLoader().load('images/road.png');
const alpha = new THREE.TextureLoader().load('images/byMiljo.png');

rock.wrapS = THREE.RepeatWrapping;
rock.wrapT = THREE.RepeatWrapping;


grass.wrapS = THREE.RepeatWrapping;
grass.wrapT = THREE.RepeatWrapping;

grass.repeat.multiplyScalar(size/8);
rock.repeat.multiplyScalar(size/8);

const material = new TextureSplattingMaterial({ //Create the material
    color: THREE.Color.NAMES.grey,
    colorMaps: [rock,grass],
    alphaMaps: [alpha]
});

material.wireframe = false; // Fjerner wireframe

// Implement a centerNode -- Add planes
const centerNode = new THREE.Group();

// Add centerNode to scene
scene.add(centerNode);

// Function to create plane
function createPlane(size, texture, position) {
    // Create plane geometry
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    // Create plane material
    const material = new THREE.MeshBasicMaterial({map: texture, side: THREE.DoubleSide});
    // Create plane mesh
    const plane = new THREE.Mesh(geometry, material);
    // Set plane position
    plane.position.set(position.x, position.y, position.z);
    // Add to scene
    scene.add(plane);
    // Return plane
    centerNode.add(plane);
    return plane;
}

// Create planes and automatically add them to the scene
const warPlane = createPlane(1, new THREE.TextureLoader().load('images/rock.png'), {x: -5, y: 15, z: 0});
const jetPlane = createPlane(2, new THREE.TextureLoader().load('images/rock.png'), {x: 5, y: 15, z: 0});

// CatMulRomCurve3 closed loop for first plane
const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3( -10, 12, 10 ),
    new THREE.Vector3( -5, 10, 5 ),
    new THREE.Vector3( 0, 15, 0 ),
    new THREE.Vector3( 5, 11, 5 ),
    new THREE.Vector3( 10, 16, 10 )
]);

// CatMulRomCurve3 closed loop for second plane
const curve2 = new THREE.CatmullRomCurve3([
    new THREE.Vector3( 12, 12, 8 ),
    new THREE.Vector3( -5, 13, 5 ),
    new THREE.Vector3( -5, 15, 5 ),
    new THREE.Vector3( -5, 11, -5 ),
    new THREE.Vector3( 12, 16, -10 )
]);
// Ends meet
curve.closed = true;
const points = curve.getPoints( 50 );
const geometryCurve = new THREE.BufferGeometry().setFromPoints( points );
//Color of first curve
const materialCurve = new THREE.LineBasicMaterial( { color : 0xff0000 } );
const curveObject = new THREE.Line( geometryCurve, materialCurve );
scene.add( curveObject );

curve2.closed = true;
const points2 = curve2.getPoints( 50 );
const geometryCurve2 = new THREE.BufferGeometry().setFromPoints( points2 );
//Color of second curve
const materialCurve2 = new THREE.LineBasicMaterial( { color : 0x0000ff } );
const curveObject2 = new THREE.Line( geometryCurve2, materialCurve2 );
scene.add( curveObject2 );

// Move plane object along curve
function moveAlongCurve() {
    const t = Date.now() / 5000;
    const position = curve.getPointAt(t % 1);
    const tangent = curve.getTangentAt(t % 1);
    const up = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, tangent.normalize());

    const position2 = curve2.getPointAt(t % 1);
    const tangent2 = curve2.getTangentAt(t % 1);
    const up2 = new THREE.Vector3(0, 1, 0);
    const quaternion2 = new THREE.Quaternion().setFromUnitVectors(up2, tangent2.normalize());

    warPlane.position.copy(position);
    warPlane.quaternion.copy(quaternion);
    jetPlane.position.copy(position2);
    jetPlane.quaternion.copy(quaternion2);
}

// Implement a centerNode -- Add planes
const centerNode = new THREE.Group();

// Add centerNode to scene
scene.add(centerNode);

// Function to create plane
function createPlane(size, texture, position) {
  // Create plane geometry
  const geometry = new THREE.SphereGeometry(size, 32, 32);
  // Create plane material
  const material = new THREE.MeshBasicMaterial({map: texture, side: THREE.DoubleSide});
  // Create plane mesh
  const plane = new THREE.Mesh(geometry, material);
  // Set plane position
  plane.position.set(position.x, position.y, position.z);
  // Add to scene
  scene.add(plane);
  // Return plane
  centerNode.add(plane);
  return plane;
}

// Create planes and automatically add them to the scene
const warPlane = createPlane(0.5, new THREE.TextureLoader().load('images/rock.png'), {x: -5, y: 15, z: 0});
const jetPlane = createPlane(1, new THREE.TextureLoader().load('images/rock.png'), {x: 5, y: 15, z: 0});

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

// Move plane object along curve
function moveAlongCurve() {
  const t = Date.now() / 5000;
  const position = curve.getPointAt(t % 1);
  const tangent = curve.getTangentAt(t % 1);
  const up = new THREE.Vector3(0, 1, 0);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(up, tangent.normalize());

  const position2 = curve2.getPointAt(t % 1);
  const tangent2 = curve2.getTangentAt(t % 1);
  const up2 = new THREE.Vector3(0, 1, 0);
  const quaternion2 = new THREE.Quaternion().setFromUnitVectors(up2, tangent2.normalize());

  warPlane.position.copy(position);
  warPlane.quaternion.copy(quaternion);
  jetPlane.position.copy(position2);
  jetPlane.quaternion.copy(quaternion2);
}

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

//Når man reskalerer vinduet
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize);

function loop() {
<<<<<<< Updated upstream
    //Animerer vann
    water.material.uniforms[ 'time' ].value += 1.0 / 60.0;

    //Animerer fly
    moveAlongCurve();

    updateRendererSize();
    renderer.render(scene, camera);
=======
  updateRendererSize();
  //console.log(lod.getCurrentLevel());
  console.log(scene.children);
  if (scene.children[6] !== undefined) {
    //console.log(scene.children[6].getCurrentLevel());
  }
  //console.log(building0);
  water.material.uniforms['time'].value += 1.0/240.0;

  //Animerer fly
  moveAlongCurve();

  renderer.render(scene, camera);
>>>>>>> Stashed changes
}

renderer.setAnimationLoop(loop);
