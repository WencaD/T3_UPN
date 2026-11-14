import * as THREE from 'three';
import { camera, scene } from './escena.js';
import { MODEL_DIR, weapons, game } from './configuracion.js';
import { loadModel, normalizeModel } from './modelos.js';

// Objetos coleccionables activos en el mapa.
export const pickups = [];

export async function addPickup(type, x, z) {
  // Crea munición o botiquín con señal visual de recogida.
  const model = await loadModel(`${MODEL_DIR}${type === 'ammo' ? 'bullet_kin.glb' : 'med_kit.glb'}`);
  normalizeModel(model, type === 'ammo' ? 0.42 : 0.5);
  model.position.set(x, 0.02, z);
  model.userData.pickup = type;
  model.userData.baseY = 0.02;
  model.userData.radioRecogida = 2.4;
  model.userData.recogido = false;
  model.traverse(object => { if (object.isMesh) object.castShadow = true; });
  const color = type === 'ammo' ? 0xc6ed62 : 0xef806c;
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.42, 0.025, 8, 24),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85 })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.03;
  const beacon = new THREE.PointLight(color, 1.8, 3.5);
  beacon.position.y = 0.35;
  model.add(ring, beacon);
  scene.add(model);
  pickups.push(model);
}

export function collectPickups(onCollect) {
  // Anima los objetos y aplica sus efectos por proximidad.
  const elapsed = performance.now() * 0.001;
  pickups.forEach((pickup, index) => {
    pickup.rotation.y += 0.015;
    pickup.position.y = pickup.userData.baseY + Math.sin(elapsed * 2 + index) * 0.08;
  });
  for (let index = pickups.length - 1; index >= 0; index--) {
    const pickup = pickups[index];
    if (pickup.userData.recogido) continue;
    const distanciaHorizontal = Math.hypot(
      pickup.position.x - camera.position.x,
      pickup.position.z - camera.position.z
    );
    if (distanciaHorizontal < pickup.userData.radioRecogida) {
      pickup.userData.recogido = true;
      if (pickup.userData.pickup === 'ammo') weapons.ray.ammo = weapons.ray.max;
      else game.health = Math.min(100, game.health + 35);
      pickup.visible = false;
      pickups.splice(index, 1);
      onCollect(pickup.userData.pickup);
    }
  }
}
