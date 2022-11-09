"use strict";

import * as THREE from "./three.module.js";
import { getHeightmapData } from "./utils.js";
import TextureSplattingMaterial from "./TextureSplattingMaterial.js";
import { OrbitControls } from "./OrbitControls.js";
import {VRButton} from "../Common/VRButton.js";
import { Water } from "../Common/Water.js";
import { Sky } from "../Common/Sky.js";


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
const warPlane = createPlane(1, new THREE.TextureLoader().load('images/Plane.png'), {x: -5, y: 15, z: 0});
const jetPlane = createPlane(2, new THREE.TextureLoader().load('images/Plane.png'), {x: 5, y: 15, z: 0});

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
    //Animerer vann
    water.material.uniforms[ 'time' ].value += 1.0 / 60.0;

    updateRendererSize();
    renderer.render(scene, camera);
    centerNode.rotation.y += 0.01;
}

renderer.setAnimationLoop(loop);
