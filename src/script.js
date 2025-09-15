import * as THREE from 'three';
import CANNON, { Body } from 'cannon';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createSphere } from './createSphere';
import GUI from 'lil-gui';
import { environmentMapTexture } from './textureConfig';
import { createBox } from './createBox';
import { createSound } from './createSound';

/**
 * Debug
 */
const gui = new GUI();

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl');

// PHYSICS

//Sphere body
const world = new CANNON.World();
// for testing bodies collisions
world.broadphase = new CANNON.SAPBroadphase(world);
// to optomise performance with testing
world.allowSleep = true;
world.gravity.set(0, -0.92, 0);

//Floor
const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body();
floorBody.mass = 0;
floorBody.addShape(floorShape);
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5);

world.addBody(floorBody);

// PHYSICS MATERIALS

//replace materials with default
const defaultMaterial = new CANNON.Material('default');
const defaultContactMaterial = new CANNON.ContactMaterial(
  defaultMaterial,
  defaultMaterial,
  {
    friction: 0.1,
    restitution: 0.7,
  }
);
world.addContactMaterial(defaultContactMaterial);
world.defaultContactMaterial = defaultContactMaterial;

// Scene
const scene = new THREE.Scene();

/**
 * Floor
 */
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({
    color: '#777777',
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
    envMapIntensity: 0.5,
  })
);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI * 0.5;
scene.add(floor);

const updatabales = [];

const sphereMeshMaterial = new THREE.MeshStandardMaterial({
  metalness: 0.3,
  roughness: 0.4,
  envMap: environmentMapTexture,
  envMapIntensity: 0.5,
});
updatabales.push(
  createSphere(
    0.5,
    { x: 10, y: 3, z: 0 },
    defaultMaterial,
    sphereMeshMaterial,
    scene,
    world
  )
);

//Cubes
updatabales.push(
  createBox(1, 1.5, 2, { x: 0, y: 3, z: 0 }, scene, world, defaultMaterial)
);
/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(-3, 3, 3);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// GUI

/**
 * Animate
 */
const clock = new THREE.Clock();
let oldElapsedTime = 0;

const resetButton = () => {
  for (const object of updatabales) {
    // Remove body
    object.body.removeEventListener('collide', createSound);
    world.removeBody(object.body);

    // Remove mesh
    scene.remove(object.mesh);
  }
};

// DEBUG GUI
const debugObject = {
  addSphere: () => {
    const sphere = createSphere(
      Math.random() * 2,
      { x: Math.random() + 1, y: 3, z: 0 },
      defaultMaterial,
      sphereMeshMaterial,
      scene,
      world
    );
    updatabales.push(sphere);
  },
  addBox: () => {
    const box = createBox(
      1,
      1.5,
      2,
      {
        x: (Math.random() - 0.5) * 3,
        y: 3,
        z: (Math.random() - 0.5) * 3,
      },
      scene,
      world,
      defaultMaterial
    );
    updatabales.push(box);
  },
  reset: () => {
    resetButton();
  },
};
gui.add(debugObject, 'addSphere').name('Add Sphere');
gui.add(debugObject, 'addBox').name('Add Box');
gui.add(debugObject, 'reset');

const tick = () => {
  let elapsedTime = clock.getElapsedTime();
  let deltaTime = elapsedTime - oldElapsedTime;
  oldElapsedTime = elapsedTime;

  // Update controls
  controls.update();

  //Update Physics
  world.step(1 / 60, deltaTime, 3);
  //update sphere body pos
  for (const object of updatabales) {
    object.mesh.position.copy(object.body.position);
    object.mesh.quaternion.copy(object.body.quaternion);
  }
  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
