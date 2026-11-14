import * as THREE from 'three';
import { camera, isBlocked, mapBounds, renderer, scene, buildWorld } from './escena.js';
import { game, MODEL_DIR, player, weapons } from './configuracion.js';
import { loadWeapons, equipWeapon, getActiveWeapon, isFireLocked, lockShot, setWeaponKeys, updateWeapon } from './armas.js';
import { enemigoImpactado, enemies, showDamage, spawnEnemy, updateEnemies } from './enemigos.js';
import { addPickup, collectPickups } from './objetos.js';
import { endGame, showToast, updateHud } from './interfaz.js';

const clock = new THREE.Clock();
const raycaster = new THREE.Raycaster();
const keys = new Set();
let rayEffects = [];
let pickupsReady;
let enemiesReady;

// Movimiento y cámara FPS.
function movePlayer(delta) {
  const direction = new THREE.Vector3(
    (keys.has('KeyD') ? 1 : 0) - (keys.has('KeyA') ? 1 : 0),
    0,
    (keys.has('KeyS') ? 1 : 0) - (keys.has('KeyW') ? 1 : 0)
  );
  if (!direction.lengthSq()) return;
  direction.normalize().applyAxisAngle(new THREE.Vector3(0, 1, 0), game.yaw);
  const next = camera.position.clone().addScaledVector(direction, player.speed * delta);
  const boundedX = THREE.MathUtils.clamp(next.x, mapBounds.minX, mapBounds.maxX);
  const boundedZ = THREE.MathUtils.clamp(next.z, mapBounds.minZ, mapBounds.maxZ);
  if (!isBlocked(new THREE.Vector3(boundedX, 0, camera.position.z))) camera.position.x = boundedX;
  if (!isBlocked(new THREE.Vector3(camera.position.x, 0, boundedZ))) camera.position.z = boundedZ;
}

// Rayo energético de la Ray Gun: línea brillante, núcleo y destello de impacto.
function createRayEffect(start, end, hit) {
  const direction = end.clone().sub(start);
  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.09, direction.length(), 8),
    new THREE.MeshBasicMaterial({ color: 0x7df9ff, transparent: true, opacity: 0.95 })
  );
  beam.position.copy(start).add(end).multiplyScalar(0.5);
  beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  scene.add(beam);
  rayEffects.push({ beam, life: 0.12 });
  while (rayEffects.length > 4) {
    const oldEffect = rayEffects.shift();
    scene.remove(oldEffect.beam);
    oldEffect.beam.geometry.dispose();
    oldEffect.beam.material.dispose();
  }
  if (hit) showToast('IMPACTO DE RAYO CONFIRMADO');
}

function updateRayEffects(delta) {
  rayEffects = rayEffects.filter(effect => {
    effect.life -= delta;
    effect.beam.material.opacity = Math.max(0, effect.life * 8);
    if (effect.life <= 0) {
      scene.remove(effect.beam);
      effect.beam.geometry.dispose();
      effect.beam.material.dispose();
      return false;
    }
    return true;
  });
}

function buscarObjetivoCercano(origen, direccion) {
  let mejor = null;
  let menorDistancia = Infinity;
  enemies.filter(enemy => !enemy.dead).forEach(enemy => {
    const centro = enemy.model.getWorldPosition(new THREE.Vector3());
    centro.y += 0.72;
    const haciaObjetivo = centro.sub(origen);
    const distanciaEnRayo = haciaObjetivo.dot(direccion);
    if (distanciaEnRayo <= 0) return;
    const puntoEnRayo = origen.clone().addScaledVector(direccion, distanciaEnRayo);
    const distanciaAlCentro = puntoEnRayo.distanceTo(centro);
    if (distanciaAlCentro < 1.25 && distanciaEnRayo < menorDistancia) {
      menorDistancia = distanciaEnRayo;
      mejor = enemy;
    }
  });
  return mejor;
}

function shoot() {
  if (!game.running || game.ended || isFireLocked() || game.pendingWeapon) return;
  const weaponId = getActiveWeapon();
  const weapon = weapons[weaponId];
  if (weapon.ammo === 0) {
    showToast('SIN MUNICIÓN — encuentra una caja');
    return;
  }
  if (weaponId === 'ray') weapon.ammo--;
  game.recoil = 1;
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
  const origin = raycaster.ray.origin.clone();
  const farPoint = origin.clone().add(raycaster.ray.direction.clone().multiplyScalar(45));
  const liveEnemies = enemies.filter(enemy => !enemy.dead);
  const hit = raycaster.intersectObjects(
    liveEnemies.flatMap(enemy => enemy.hitZones),
    false
  )[0];
  const objetivoCercano = buscarObjetivoCercano(origin, raycaster.ray.direction);
  const target = hit
    ? hit.point
    : objetivoCercano
      ? objetivoCercano.model.getWorldPosition(new THREE.Vector3())
      : farPoint;
  if (weaponId === 'ray') createRayEffect(origin, target, Boolean(hit || objetivoCercano));
  if (hit || objetivoCercano) {
    const enemy = hit
      ? (enemigoImpactado(hit.object) || hit.object.userData.enemyReference || objetivoCercano)
      : objetivoCercano;
    if (enemy) {
      const damage = hit?.object.userData.damage || 1;
      enemy.hp -= damage;
      showDamage(enemy, damage);
      enemy.hitFlash = 0.15;
      if (enemy.hp <= 0) {
        enemy.dead = true;
        enemy.model.visible = false;
        game.kills++;
        showToast('OBJETIVO ELIMINADO');
      } else if (weaponId !== 'ray') {
        showToast('IMPACTO DE ESPADA · 1 MÁS');
      }
    }
  }
  lockShot(weaponId === 'sword' ? 350 : 180);
  updateHud();
}

function setupWorld() {
  buildWorld();
  pickupsReady = Promise.all([
    addPickup('ammo', -3.8, -5),
    addPickup('medkit', 3.8, -28),
    addPickup('ammo', 3.8, -48),
    addPickup('medkit', -3.8, -70),
    addPickup('ammo', 3.8, -91)
  ]);
  enemiesReady = Promise.all(
    [[-2.8, -6, 0.9], [2.7, -24, 1.05], [-2.3, -45, 0.95], [2.5, -67, 1.1], [0, -90, 0.9]]
      .map(enemy => spawnEnemy(...enemy))
  );
}

function setupInput() {
  addEventListener('keydown', event => {
    keys.add(event.code);
    if (event.code === 'Digit1') equipWeapon('ray');
    if (event.code === 'Digit2') equipWeapon('sword');
    game.activeWeapon = getActiveWeapon();
    updateHud();
  });
  addEventListener('keyup', event => keys.delete(event.code));
  addEventListener('mousedown', event => {
    if (event.button !== 0) return;
    shoot();
  });
  addEventListener('mousemove', event => {
    if (document.pointerLockElement !== renderer.domElement || !game.running || game.ended) return;
    game.yaw -= event.movementX * 0.0022;
    game.pitch = THREE.MathUtils.clamp(game.pitch - event.movementY * 0.0022, -1.35, 1.35);
    camera.rotation.set(game.pitch, game.yaw, 0, 'YXZ');
  });
  renderer.domElement.addEventListener('click', () => {
    if (game.running && !game.ended) renderer.domElement.requestPointerLock();
  });
  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
  document.querySelector('#start-button').addEventListener('click', () => {
    const startButton = document.querySelector('#start-button');
    startButton.disabled = true;
    document.querySelector('#start-screen').classList.add('hidden');
    game.running = true;
    renderer.domElement.requestPointerLock();
    Promise.all([pickupsReady, enemiesReady]).catch(error => {
      console.error('No se pudieron cargar todos los recursos del mapa.', error);
      showToast('ALGUNOS RECURSOS SIGUEN CARGANDO');
    });
  });
  document.querySelector('#restart-button').addEventListener('click', () => location.reload());
}

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.05);
  if (game.running && !game.ended) {
    movePlayer(delta);
    updateEnemies(delta, () => {
      game.health = Math.max(0, game.health - 25);
      showToast(`¡ATAQUE! SALUD ${game.health}%`);
      if (game.health === 0) endGame(false);
    });
    collectPickups(type => showToast(type === 'ammo' ? 'MUNICIÓN RECUPERADA' : 'BOTIQUÍN USADO'));
    updateWeapon(delta, clock.elapsedTime);
    updateRayEffects(delta);
    updateHud();
    if (camera.position.z < -94 && Math.abs(camera.position.x) < 3.2) endGame(true);
  }
  renderer.render(scene, camera);
}

setWeaponKeys(keys);
setupWorld();
setupInput();
loadWeapons().then(() => {
  game.activeWeapon = getActiveWeapon();
  updateHud();
});
animate();
