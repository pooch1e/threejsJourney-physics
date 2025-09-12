import * as THREE from 'three';
import * as CANNON from 'cannon';
export const createSphere = (
  radius,
  position,
  defaultMaterial,
  environmentMapTexture,
  scene,
  world
) => {
  //3js Mesh

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 20, 20),
    new THREE.MeshStandardMaterial({
      metalness: 0.3,
      roughness: 0.4,
      envMap: environmentMapTexture,
      envMapIntensity: 0.5,
    })
  );
  mesh.castShadow = true;
  mesh.position.copy(position);
  scene.add(mesh);

  //cannon body
  const cannonSphere = new CANNON.Sphere(radius);
  const body = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(0, 3, 0),
    shape: cannonSphere,
    material: defaultMaterial,
  });
  body.position.copy(position);
  world.addBody(body);

  return { mesh, body };
};
