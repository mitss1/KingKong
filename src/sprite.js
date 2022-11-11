import * as THREE from "./three.module.js";
//function to add a tree sprite to the scene
function createTreeSprite(x, y, z, name, scene){
    const rndInt = Math.floor(Math.random() * 3) + 1;
    const map = new THREE.TextureLoader().load('images/Tree/tree' +  + rndInt + '.png');
    const SpriteMaterial = new THREE.SpriteMaterial({map: map});

    name = new THREE.Sprite(SpriteMaterial);
    scene.add(name)
    //translate the sprite to the correct position
    name.position.set(x, y, z);
    //scale the sprite
    name.scale.set(1, 2, 2);

}


//Gaussian random number generator
function randn_bm(min, max, skew) {
    let u = 0, v = 0;
    while(u === 0) u = Math.random() //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random()
    let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v )

    num = num / 10.0 + 0.5 // Translate to 0 -> 1
    if (num > 1 || num < 0)
        num = randn_bm(min, max, skew) // resample between 0 and 1 if out of range

    else{
        num = Math.pow(num, skew) // Skew
        num *= max - min // Stretch to fill range
        num += min // offset to min
    }
    return num
}
//adds a set number of sprites using createTreeSprite function with random positions using Gaussian random number generator
//Can add parameters to change the number of sprites and position range
function addTreeSprite(xmax,xmin,y,zmax,zmin,scene){
    for(let i = 0; i < 60; i++){
        //Old distribution using Math.random
        //       const rndInt = Math.floor((Math.random() * -600) + -200) / 100;
        //       const rndInt2 = Math.floor((Math.random() * -700) + -200) / 100;
        const rndInt = randn_bm(xmin, xmax, 1);
        const rndInt2 = randn_bm(zmin, zmax, 1);
        //String name that has index
        //const y = getHeightAt(rndInt, rndInt2, scene);
        let name = "sprite" + i;
        createTreeSprite(rndInt, y, rndInt2, name, scene);
    }
}
export { addTreeSprite };