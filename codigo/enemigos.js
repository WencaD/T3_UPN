import * as THREE from 'three';
import { camera, isBlocked, mapBounds, scene } from './escena.js';
import { game } from './configuracion.js';

export const enemies = [];
const enemyLabels = [];
let labelTimer = 0;

function createEnemyLabel(enemy) {
  const label = document.createElement('div');
  label.className = 'enemy-label';
  label.innerHTML = '<div class="enemy-name">INFECTADO</div><div class="enemy-health"><i></i></div><div class="damage-layer"></div>';
  document.body.appendChild(label);
  enemyLabels.push({ enemy, label, fill: label.querySelector('i'), damageLayer: label.querySelector('.damage-layer') });
}

export function enemigoImpactado(objeto) {
  let actual = objeto;
  while (actual) {
    if (actual.userData?.enemyReference) return actual.userData.enemyReference;
    if (actual.userData?.esEnemigo) {
      return enemies.find(enemy => enemy.model === actual);
    }
    actual = actual.parent;
  }
  return null;
}

function updateEnemyLabels() {
  enemyLabels.forEach(item => {
    const { enemy, label, fill } = item;
    if (enemy.dead || !enemy.active) {
      label.style.display = 'none';
      return;
    }
    const position = enemy.model.position.clone();
    position.y += 1.62;
    position.project(camera);
    const visible = position.z < 1;
    label.style.display = visible ? 'block' : 'none';
    label.style.left = `${(position.x * 0.5 + 0.5) * innerWidth}px`;
    label.style.top = `${(-position.y * 0.5 + 0.5) * innerHeight}px`;
    fill.style.width = `${(enemy.hp / 2) * 100}%`;
  });
}

export function showDamage(enemy, amount) {
  const item = enemyLabels.find(candidate => candidate.enemy === enemy);
  if (!item) return;
  const damage = document.createElement('b');
  damage.textContent = `-${amount}`;
  item.damageLayer.appendChild(damage);
  setTimeout(() => damage.remove(), 750);
}

function findBone(root, patterns) {
  let result;
  root.traverse(object => {
    if (!result && object.isBone && patterns.some(pattern => pattern.test(object.name))) {
      result = object;
    }
  });
  return result;
}

function prepareRig(model) {
  const bones = {
    leftArm: findBone(model, [/left.*arm/i, /arm.*l/i, /upperarm_l/i]),
    rightArm: findBone(model, [/right.*arm/i, /arm.*r/i, /upperarm_r/i]),
    leftLeg: findBone(model, [/left.*leg/i, /thigh.*l/i, /leg_l/i]),
    rightLeg: findBone(model, [/right.*leg/i, /thigh.*r/i, /leg_r/i]),
    torso: findBone(model, [/spine/i, /chest/i, /torso/i]),
    head: findBone(model, [/head/i, /neck/i])
  };
  const baseRotation = new Map();
  Object.values(bones).forEach(bone => {
    if (bone) baseRotation.set(bone, bone.rotation.clone());
  });
  return { bones, baseRotation };
}

function addHitZone(model, enemy, name, position, scale, damage) {
  const inverseModelScale = 1 / model.scale.x;
  const zone = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 6, 4),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
  );
  zone.name = `enemy-hitbox-${name}`;
  zone.position.copy(position).multiplyScalar(inverseModelScale);
  zone.scale.copy(scale).multiplyScalar(inverseModelScale);
  zone.userData.enemyReference = enemy;
  zone.userData.bodyPart = name;
  zone.userData.damage = damage;
  model.add(zone);
  enemy.hitZones.push(zone);
}

export function spawnEnemy(x, z, multiplier = 1) {
  const zombie = new THREE.Group();
  zombie.position.set(x, 0, z);
  zombie.scale.setScalar(multiplier);
  zombie.userData.esEnemigo = true;
  const skinColors = [0x6f7562, 0x596653, 0x80715d];
  const skin = new THREE.MeshStandardMaterial({ color: skinColors[enemies.length % skinColors.length], roughness: 1 });
  const wound = new THREE.MeshStandardMaterial({ color: 0x7d2926, roughness: 1 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.68, 0.28), skin);
  body.position.y = 0.78;
  zombie.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.23, 8, 6), skin);
  head.scale.set(0.9, 1.15, 0.85);
  head.position.y = 1.3;
  zombie.add(head);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, 0.18, 7), skin);
  neck.position.y = 1.03;
  zombie.add(neck);
  [-1, 1].forEach(side => {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.62, 0.15), skin);
    arm.position.set(side * 0.31, 0.78, 0);
    arm.rotation.z = side * -0.16;
    zombie.add(arm);
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.62, 0.18), wound);
    leg.position.set(side * 0.12, 0.3, 0);
    zombie.add(leg);
  });
  const woundPatch = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 4), wound);
  woundPatch.position.set(0, 0.83, -0.16);
  zombie.add(woundPatch);
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.035, 0.02), wound);
  mouth.position.set(0, 1.2, -0.2);
  zombie.add(mouth);
  const eyes = new THREE.MeshBasicMaterial({ color: 0xff3f36 });
  [-0.08, 0.08].forEach(offset => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 4), eyes);
    eye.position.set(offset, 1.34, -0.2);
    zombie.add(eye);
  });
  zombie.traverse(object => {
    if (object.isMesh) object.castShadow = true;
  });
  const warningLight = new THREE.PointLight(0xff493d, 0.7, 1.8);
  warningLight.position.set(0, 0.3, 0.04);
  zombie.add(warningLight);
  scene.add(zombie);
  const enemy = {
    model: zombie, hp: 2, active: false, dead: false,
    speed: 0.7 + Math.random() * 0.2, attackCooldown: 0, hitFlash: 0,
    walkTime: Math.random() * 3,
    attackTime: 0,
    variant: Math.random(), hitZones: [],
    rig: prepareRig(zombie)
  };
  addHitZone(zombie, enemy, 'cuerpo-completo', new THREE.Vector3(0, 0.72, 0), new THREE.Vector3(0.7, 1.35, 0.55), 1);
  addHitZone(zombie, enemy, 'cabeza', new THREE.Vector3(0, 1.3, 0), new THREE.Vector3(0.34, 0.34, 0.34), 1);
  addHitZone(zombie, enemy, 'torso', new THREE.Vector3(0, 0.8, 0), new THREE.Vector3(0.5, 0.65, 0.4), 1);
  addHitZone(zombie, enemy, 'brazo-izquierdo', new THREE.Vector3(-0.3, 0.78, 0), new THREE.Vector3(0.22, 0.6, 0.24), 1);
  addHitZone(zombie, enemy, 'brazo-derecho', new THREE.Vector3(0.3, 0.78, 0), new THREE.Vector3(0.22, 0.6, 0.24), 1);
  addHitZone(zombie, enemy, 'piernas', new THREE.Vector3(0, 0.3, 0), new THREE.Vector3(0.42, 0.58, 0.3), 1);
  zombie.userData.enemyReference = enemy;
  enemies.push(enemy);
  createEnemyLabel(enemy);
  zombie.rotation.y = Math.PI + (Math.random() - 0.5) * 0.18;
}

function animateBody(enemy, moving) {
  const { bones, baseRotation } = enemy.rig;
  const swing = Math.sin(enemy.walkTime) * (moving ? 0.42 : 0.06);
  const bounce = Math.abs(Math.sin(enemy.walkTime * 2)) * (moving ? 0.025 : 0.008);
  enemy.model.position.y = bounce;
  enemy.model.rotation.z = Math.sin(enemy.walkTime * 0.5) * 0.035;
  enemy.model.rotation.x = enemy.attackTime > 0 ? -0.12 : 0;
  if (!bones.torso) {
    return;
  }
  Object.entries(bones).forEach(([name, bone]) => {
    if (!bone) return;
    bone.rotation.copy(baseRotation.get(bone));
    if (name === 'leftArm') bone.rotation.x += swing;
    if (name === 'rightArm') bone.rotation.x -= swing;
    if (name === 'leftLeg') bone.rotation.x -= swing * 0.8;
    if (name === 'rightLeg') bone.rotation.x += swing * 0.8;
    if (name === 'torso') bone.rotation.z += Math.sin(enemy.walkTime) * 0.08;
    if (name === 'head') bone.rotation.y += Math.sin(enemy.walkTime * 0.65) * 0.08;
  });
}

export function updateEnemies(delta, onAttack) {
  enemies.forEach(enemy => {
    if (enemy.dead) return;
    const distance = enemy.model.position.distanceTo(camera.position);
    enemy.active = enemy.active || distance < 11;
    if (enemy.active) {
      enemy.walkTime += delta * 7;
      const direction = camera.position.clone().sub(enemy.model.position);
      direction.y = 0;
      if (direction.length() > 1.8) {
        direction.normalize();
        const distance = enemy.speed * delta;
        const next = enemy.model.position.clone().addScaledVector(direction, distance);
        const nextX = THREE.MathUtils.clamp(next.x, mapBounds.minX, mapBounds.maxX);
        const nextZ = THREE.MathUtils.clamp(next.z, mapBounds.minZ, mapBounds.maxZ);
        const canMove = !isBlocked(new THREE.Vector3(nextX, 0, nextZ));
        const canMoveX = !isBlocked(new THREE.Vector3(nextX, 0, enemy.model.position.z));
        const canMoveZ = !isBlocked(new THREE.Vector3(enemy.model.position.x, 0, nextZ));
        if (canMove) {
          enemy.model.position.set(nextX, enemy.model.position.y, nextZ);
        } else if (canMoveX) {
          enemy.model.position.x = nextX;
        } else if (canMoveZ) {
          enemy.model.position.z = nextZ;
        }
        enemy.model.lookAt(camera.position.x, enemy.model.position.y, camera.position.z);
        animateBody(enemy, true);
      } else {
        enemy.walkTime += delta * 2;
        enemy.attackTime = Math.min(1, enemy.attackTime + delta * 4);
        animateBody(enemy, false);
        enemy.attackCooldown -= delta;
        if (enemy.attackCooldown <= 0) {
          onAttack();
          enemy.attackCooldown = 1;
        }
      }
    } else {
      enemy.walkTime += delta * 1.5;
      enemy.attackTime = Math.max(0, enemy.attackTime - delta * 3);
      animateBody(enemy, false);
    }
    if (enemy.active && enemy.model.position.distanceTo(camera.position) > 1.8) {
      enemy.attackTime = Math.max(0, enemy.attackTime - delta * 3);
    }
    const previousHitFlash = enemy.hitFlash;
    enemy.hitFlash = Math.max(0, enemy.hitFlash - delta);
    if ((previousHitFlash === 0) !== (enemy.hitFlash === 0)) {
      enemy.model.traverse(object => {
        if (object.isMesh) object.material.emissiveIntensity = enemy.hitFlash ? 2 : 0;
      });
    }
  });
  labelTimer -= delta;
  if (labelTimer <= 0) {
    updateEnemyLabels();
    labelTimer = 0.05;
  }
}
