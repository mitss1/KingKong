import {GLTFLoader} from "../src/GLTFLoader.js";
import * as THREE from "../src/three.module.js";

export function loadModel(model,Node,scale,trans){

    const loader = new GLTFLoader();

    loader.load(
        model,
        function (gltf) {
            gltf.scene.scale.set(scale,scale,scale);
            gltf.scene.position.set(trans);

            gltf.scene.traverse(function (node) {
                if(node.isMesh){
                    node.receiveShadow = true;
                    node.castShadow = true;
                }
            })

            Node.add(gltf.scene);
        }
    );
}

export function getModel(model,temp,callback) {
    const loader = new GLTFLoader();
    loader.load(
        model,
        function (gltf) {
            callback(gltf,temp);
        }
    );
}

export function LODModel(models,node,scale,x,y,z,ranges) {
    const lod = new THREE.LOD();
    let i = 0;
    models.forEach((model)=>{
        lod.addLevel(model,ranges[i]);
        i++;
    });
    lod.traverse((mesh)=>{
        if (mesh.isMesh) {
            mesh.receiveShadow = true;
            mesh.castShadow = true;
        }
    });
    lod.position.set(x,y,z);
    lod.scale.set(scale,scale,scale);
    return lod;
}

