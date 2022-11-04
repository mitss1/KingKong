import {GLTFLoader} from "../src/GLTFLoader.js";

export function loadModel(model,Node,scale,trans){

    const loader = new GLTFLoader();

    loader.load(
        model,
        function (gltf) {
            gltf.scene.scale.set(scale,scale,scale);
            gltf.scene.position.setY(trans);

            Node.add(gltf.scene);
        }
    );
}

export function getModel(model,callback) {
    const loader = new GLTFLoader();
    loader.load(
        model,
        function (gltf) {
            callback(gltf);
        }
    );
}