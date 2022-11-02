"use strict";

import * as THREE from "./three.module.js";
import { getHeightmapData } from "./utils.js";
import TextureSplattingMaterial from "./TextureSplattingMaterial.js";
import { OrbitControls } from "./OrbitControls.js";
import {VRButton} from "../Common/VRButton.js";


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
    scene.background = texture;
};

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
camera.position.set( 0, 20, 100 );
controls.update();

scene.add(camera);
//Camera end

const axesHelper = new THREE.AxesHelper(1);
scene.add(axesHelper);

const sun = new THREE.DirectionalLight(white, 1.0);
scene.add(sun);

// TODO: implement terrain.
const size = 128;
const height = 10;
const geometry = new THREE.PlaneGeometry(20, 20, size-1, size-1);

geometry.rotateX((Math.PI / 180)*-90);
const terrainImage = new Image();

terrainImage.onload = () => {
    const data = getHeightmapData(terrainImage,size);

    for(let i = 0; i < data.length; i++){
        geometry.attributes.position.setY(i, data[i] * height);
    }

    const mesh = new THREE.Mesh(geometry,material);

    scene.add(mesh);
};

terrainImage.src = 'images/byMiljo.png'; // Importerer bilde til terreng

const rock = new THREE.TextureLoader().load('images/rock.png');
const grass = new THREE.TextureLoader().load('images/road.png');
const alpha = new THREE.TextureLoader().load('images/terrain.png');

grass.wrapS = THREE.RepeatWrapping;
grass.wrapT = THREE.RepeatWrapping;


rock.wrapS = THREE.RepeatWrapping;
rock.wrapT = THREE.RepeatWrapping;

rock.repeat.multiplyScalar(size/8);
grass.repeat.multiplyScalar(size/8);

const material = new TextureSplattingMaterial({
    color: THREE.Color.NAMES.grey,
    colorMaps: [grass,rock],
    alphaMaps: [alpha]
});

material.wireframe = false; // Fjerner wireframe


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
