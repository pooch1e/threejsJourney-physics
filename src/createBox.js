import * as THREE from 'three';
import * as CANNON from 'cannon';
import { environmentMapTexture } from './textureConfig';

const boxGeometery = new THREE.BoxGeometry(1, 1, 1);
const boxMaterial = new THREE.MeshStandardMaterial({
  metalness: 0.3,
  roughness: 0.4,
  envMap: environmentMapTexture,
  envMapIntensity: 0.5,
});

export const createBox = (
  width,
  height,
  depth,
  position,
  scene,
  world,
  defaultMaterial
) => {
  const boxMesh = new THREE.Mesh(boxGeometery, boxMaterial);
  boxMesh.scale.set(width, height, depth);
  boxMesh.castShadow = true;
  boxMesh.position.copy(position);
  scene.add(boxMesh);

  //cannon body
  const shape = new CANNON.Box(
    new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5)
  );
  const body = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(0, 3, 0),
    shape,
    material: defaultMaterial,
  });

  body.position.copy(position);
  world.addBody(body);

  return { boxMesh, body };
};
