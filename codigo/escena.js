import * as THREE from 'three';

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05080a);
scene.fog = new THREE.Fog(0x070b0d, 18, 135);

export const camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, 0.05, 140);
camera.position.set(0, 1.65, 20);
camera.rotation.order = 'YXZ';

export const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.querySelector('#game').appendChild(renderer.domElement);

export const colliders = [];
export const mapBounds = {
  minX: -4.05,
  maxX: 4.05,
  minZ: -101.2,
  maxZ: 20.5
};

export function material(color, roughness = 0.8, emissive = 0) {
  return new THREE.MeshStandardMaterial({
    color, roughness, emissive, emissiveIntensity: emissive ? 1 : 0
  });
}

export function addBox(name, x, y, z, width, height, depth, color, solid = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material(color));
  mesh.name = name;
  mesh.position.set(x, y, z);
  mesh.castShadow = mesh.receiveShadow = true;
  scene.add(mesh);
  if (solid) colliders.push({ x, z, halfX: width / 2, halfZ: depth / 2 });
  return mesh;
}

function addStreetLight(x, z) {
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 3.8, 8), material(0x313a39));
  pole.position.set(x, 1.9, z);
  scene.add(pole);
  const lamp = new THREE.PointLight(0xd5e9be, 2.4, 9);
  lamp.position.set(x, 3.7, z);
  scene.add(lamp);
}

function addTree(x, z, scale = 1) {
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16 * scale, 0.24 * scale, 1.6 * scale, 8), material(0x44352a));
  trunk.position.set(x, 0.8 * scale, z);
  const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(1.05 * scale, 1), material(0x1d3b2b));
  crown.position.set(x, 2.1 * scale, z);
  trunk.castShadow = crown.castShadow = true;
  scene.add(trunk, crown);
}

function addBuilding(x, z, width, depth, color) {
  addBox('building', x, 2.4, z, width, 4.8, depth, color);
  addBox('roof', x, 4.95, z, width + 0.25, 0.25, depth + 0.25, 0x161e20, false);
  for (let panel = -2; panel <= 2; panel++) {
    const seam = new THREE.Mesh(new THREE.BoxGeometry(0.025, 4.2, depth - 0.4), material(0x11191a, 0.95));
    seam.position.set(x + panel * (width / 5), 2.35, z);
    scene.add(seam);
  }
  for (let window = -1; window <= 1; window++) {
    const glass = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.7, 0.03), material(0x8caa86, 0.3, 0x1f3b26));
    glass.position.set(x + window * (width / 3), 2.3, z - depth / 2 - 0.02);
    scene.add(glass);
  }
  const door = new THREE.Mesh(new THREE.BoxGeometry(width * 0.42, 2.35, 0.04), material(0x111718, 0.85));
  door.position.set(x, 1.18, z - depth / 2 - 0.035);
  scene.add(door);
}

function addRoadDetails() {
  const road = new THREE.Mesh(new THREE.PlaneGeometry(8.4, 145), material(0x151b1c, 0.98));
  road.rotation.x = -Math.PI / 2;
  road.position.set(0, 0.015, -35);
  scene.add(road);

  for (let index = 0; index < 18; index++) {
    const puddle = new THREE.Mesh(
      new THREE.CircleGeometry(0.7 + (index % 3) * 0.35, 24),
      new THREE.MeshStandardMaterial({ color: 0x18272a, roughness: 0.08, metalness: 0.8 })
    );
    puddle.rotation.x = -Math.PI / 2;
    puddle.scale.y = 0.35;
    puddle.position.set(((index * 1.73) % 6) - 3, 0.025, 12 - index * 7.2);
    scene.add(puddle);
  }

  [-4.6, 4.6].forEach(x => {
    const sidewalk = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.12, 145), material(0x394340));
    sidewalk.position.set(x, 0.06, -35);
    sidewalk.receiveShadow = true;
    scene.add(sidewalk);
  });

  for (let z = 17; z > -105; z -= 5) {
    addBox('lane-line', 0, 0.03, z, 0.22, 0.02, 2.2, 0xe4c63d, false);
  }
}

function addCorridorLights() {
  for (let z = 14; z > -105; z -= 8) {
    [-3.9, 3.9].forEach(x => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.06, 3.2, 8), material(0x26373d));
      pole.position.set(x, 1.6, z);
      scene.add(pole);
      const glow = new THREE.PointLight(0xffd77b, 3, 10);
      glow.position.set(x, 3.2, z);
      scene.add(glow);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8), material(0xffd77b, 0.2, 0xffb52e));
      bulb.position.set(x, 3.2, z);
      scene.add(bulb);
    });
  }
}

function addOverheadCable(z, height = 4.1) {
  const cable = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.018, 8.3, 6),
    material(0x101719, 0.9)
  );
  cable.rotation.z = Math.PI / 2;
  cable.position.set(0, height, z);
  scene.add(cable);
  [-3.4, 0, 3.4].forEach(x => {
    const hanger = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.7, 5), material(0x101719, 0.9));
    hanger.position.set(x, height - 0.35, z);
    scene.add(hanger);
  });
}

function addContainer(x, z, width, color) {
  const container = addBox('container', x, 1.15, z, width, 2.3, 1.8, color);
  for (let panel = -2; panel <= 2; panel++) {
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.15, 1.86), material(0x172326, 0.8));
    rib.position.set(x + panel * (width / 5), 1.15, z);
    scene.add(rib);
  }
  return container;
}

function addEmergencyLamp(x, z) {
  const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, 0.08), material(0xf04c3f, 0.25, 0xf04c3f));
  lamp.position.set(x, 2.8, z);
  scene.add(lamp);
  const light = new THREE.PointLight(0xef443b, 1.4, 5);
  light.position.set(x, 2.8, z);
  scene.add(light);
}

function addCrateStack(x, z, count, color) {
  for (let index = 0; index < count; index++) {
    const crate = addBox('crate', x + (index % 2) * 0.65, 0.45 + Math.floor(index / 2) * 0.8, z, 0.6, 0.75, 0.6, color);
    crate.rotation.y = index * 0.18;
  }

}

function addBarrel(x, z, color = 0x39464a) {
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.95, 14), material(color, 0.45, 0));
  barrel.position.set(x, 0.48, z);
  barrel.castShadow = barrel.receiveShadow = true;
  scene.add(barrel);
}

function addGate(z) {
  const left = addBox('gate-pillar', -3.7, 2.2, z, 0.55, 4.4, 0.55, 0x303b3d);
  const right = addBox('gate-pillar', 3.7, 2.2, z, 0.55, 4.4, 0.55, 0x303b3d);
  addBox('gate-beam', 0, 4.25, z, 7.9, 0.5, 0.55, 0x303b3d, false);
  [left, right].forEach(pillar => {
    const lamp = new THREE.PointLight(0xff9a5c, 1.7, 7);
    lamp.position.set(pillar.position.x, 3.9, z);
    scene.add(lamp);
  });
}

function addFloodlight(x, z, color = 0xffb36b) {
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 2.8, 8), material(0x2a3333));
  stand.position.set(x, 1.4, z);
  scene.add(stand);
  const lamp = new THREE.SpotLight(color, 5, 18, Math.PI / 5, 0.6);
  lamp.position.set(x, 2.8, z);
  lamp.target.position.set(0, 0, z - 7);
  scene.add(lamp, lamp.target);
}

function addSandbags(x, z, rotation = 0) {
  for (let row = 0; row < 2; row++) {
    for (let index = 0; index < 4 - row; index++) {
      const bag = new THREE.Mesh(new THREE.SphereGeometry(0.33, 10, 6), material(0x6a6650));
      bag.scale.set(1.25, 0.7, 0.8);
      bag.position.set(x + (index - 1.5) * 0.55, 0.3 + row * 0.35, z);
      bag.rotation.y = rotation;
      bag.castShadow = true;
      scene.add(bag);
    }
  }
}

export function buildWorld() {
  scene.add(new THREE.HemisphereLight(0xb9c9b5, 0x10151a, 1.35));
  const moon = new THREE.DirectionalLight(0xc8d7ff, 2.1);
  moon.position.set(-18, 28, 12);
  moon.castShadow = true;
  scene.add(moon);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(110, 110), material(0x131b1a));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
  addRoadDetails();
  addCorridorLights();
  [-5, -17, -29, -41, -53, -65, -77, -89, -101].forEach(z => addOverheadCable(z));

  addBuilding(-10, 4, 7, 22, 0x202c2b);
  addBuilding(11, -8, 7, 28, 0x26312f);
  addBuilding(-10, -25, 7, 20, 0x28322f);
  addBuilding(10, -33, 7, 14, 0x202a2a);
  addBuilding(-10, -52, 7, 20, 0x26302f);
  addBuilding(11, -67, 7, 24, 0x202c2b);
  addBuilding(-10, -84, 7, 22, 0x29302f);
  addBuilding(10, -99, 7, 14, 0x202a2a);
  for (let z = 17; z > -105; z -= 8) {
    addStreetLight(-5.6, z);
    addStreetLight(5.6, z - 4);
    addBox('road-marker', 0, 0.01, z, 2.4, 0.03, 0.12, 0x586252, false);
  }
  addBox('checkpoint-a', -2.8, 1, 7, 2.2, 2, 1.1, 0x36443c);
  addBox('checkpoint-b', 3.4, 1, -3, 1.3, 2, 3.3, 0x36443c);
  addBox('wreckage-a', -3.2, 0.7, -13, 3.2, 1.4, 1.1, 0x553f35);
  addBox('wreckage-b', 3.4, 0.8, -23, 2.4, 1.6, 1.4, 0x553f35);
  addBox('barrier-a', -4.3, 0.55, -7, 1.8, 1.1, 0.35, 0x8c4c32);
  addBox('barrier-b', 4.1, 0.55, -18, 1.8, 1.1, 0.35, 0x8c4c32);
  addCrateStack(-3.7, -10, 4, 0x667052);
  addCrateStack(3.6, -30, 3, 0x526372);
  addBarrel(-4.3, -4, 0x3c4748);
  addBarrel(-4.1, -5, 0x4d3832);
  addBarrel(4.3, -13, 0x394d51);
  addBarrel(4.1, -14, 0x4b3b32);
  addContainer(-3.7, -15, 2.5, 0x354b50);
  addContainer(3.7, -36, 2.7, 0x4a3e3a);
  addContainer(-3.7, -58, 2.8, 0x354b50);
  addContainer(3.7, -78, 2.5, 0x4a3e3a);
  addEmergencyLamp(-4.2, -2);
  addEmergencyLamp(4.2, -22);
  addTree(-5.4, 1, 0.75);
  addTree(5.2, -12, 0.9);
  addTree(-5.5, -31, 0.8);
  addGate(-1);
  addGate(-34);
  addFloodlight(-5.2, -4);
  addFloodlight(5.2, -20, 0x8dbbff);
  addSandbags(-2.8, -8, 0.1);
  addSandbags(2.8, -26, -0.1);

  const extraction = new THREE.Mesh(
    new THREE.CylinderGeometry(3.2, 3.2, 0.08, 32),
    material(0x75b644, 0.45, 0x1e4c15)
  );
  extraction.position.set(0, 0.04, -98);
  scene.add(extraction);
  const beacon = new THREE.PointLight(0x9cff60, 4, 14);
  beacon.position.set(0, 2.5, -98);
  scene.add(beacon);
}

export function isBlocked(position) {
  return colliders.some(c =>
    Math.abs(position.x - c.x) < c.halfX + 0.55 &&
    Math.abs(position.z - c.z) < c.halfZ + 0.55
  );
}
