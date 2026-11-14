import * as THREE from 'three';
import { camera, scene } from './escena.js';
import { loadModel, normalizeModel } from './modelos.js';
import { game, weapons } from './configuracion.js';

let activeWeapon = 'ray';
let weaponObject;
let fireLocked = false;

export function getActiveWeapon() { return activeWeapon; }
export function getWeaponObject() { return weaponObject; }
export function isFireLocked() { return fireLocked; }

export async function loadWeapons() {
  for (const weapon of Object.values(weapons)) {
    weapon.model = await loadModel(weapon.path);
    normalizeModel(weapon.model, weapon.height);
    const center = new THREE.Box3().setFromObject(weapon.model).getCenter(new THREE.Vector3());
    weapon.model.position.x -= center.x;
    weapon.model.position.z -= center.z;
    weapon.model.rotation.fromArray(weapon.rotation);
    weapon.model.position.fromArray(weapon.position);
    weapon.model.visible = false;
    camera.add(weapon.model);
  }
  camera.add(new THREE.PointLight(0xb9e8a4, 0.35, 3));
  scene.add(camera);
  equipWeapon('ray', true);
}

export function equipWeapon(id, instant = false) {
  if (id === activeWeapon && !instant) return;
  if (instant) {
    activeWeapon = id;
    game.activeWeapon = activeWeapon;
    weaponObject = weapons[id].model;
    weaponObject.visible = true;
    weaponObject.position.fromArray(weapons[id].position);
    weaponObject.rotation.fromArray(weapons[id].rotation);
    game.pendingWeapon = null;
    game.weaponChange = 1;
    return;
  }
  game.pendingWeapon = id;
  game.weaponChange = 0;
  weaponObject = weapons[activeWeapon].model;
}

export function updateWeapon(delta, elapsed) {
  const weapon = weapons[activeWeapon];
  if (!weapon.model || !weaponObject) return;
  if (game.pendingWeapon && game.weaponChange < 1) {
    game.weaponChange = Math.min(1, game.weaponChange + delta * 5);
    const progress = game.weaponChange;
    weaponObject.position.y = weapon.position[1] - Math.sin(progress * Math.PI) * 0.45;
    weaponObject.rotation.z = Math.sin(progress * Math.PI) * 0.18;
    if (progress >= 1) {
      weaponObject.visible = false;
      activeWeapon = game.pendingWeapon;
      game.activeWeapon = activeWeapon;
      game.pendingWeapon = null;
      weaponObject = weapons[activeWeapon].model;
      weaponObject.visible = true;
      weaponObject.position.fromArray(weapons[activeWeapon].position);
      weaponObject.rotation.fromArray(weapons[activeWeapon].rotation);
    }
    return;
  }
  const moving = ['KeyW', 'KeyA', 'KeyS', 'KeyD'].some(key => keys.has(key));
  const bob = moving ? Math.sin(elapsed * 9) * 0.012 : 0;
  weaponObject.position.y = weapon.position[1] + bob - game.recoil * 0.16;
  weaponObject.position.z = weapon.position[2] + game.recoil * 0.1;
  game.recoil = Math.max(0, game.recoil - delta * 5);
}

let keys = new Set();
export function setWeaponKeys(nextKeys) { keys = nextKeys; }

export function lockShot(delay) {
  fireLocked = true;
  setTimeout(() => { fireLocked = false; }, delay);
}
