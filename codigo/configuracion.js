// Estado global, jugador y configuración de armas.
export const MODEL_DIR = '../Modelos%203D/';

export const player = {
  radius: 0.55,
  speed: 5.2,
  health: 100
};

export const weapons = {
  ray: {
    name: 'RAY GUN',
    ammo: 18,
    max: 18,
    height: 0.58,
    path: `${MODEL_DIR}ray_gun_v1.glb`,
    position: [0.32, -0.25, -0.55],
    rotation: [0, Math.PI, 0]
  },
  sword: {
    name: 'MASTER SWORD',
    ammo: Infinity,
    max: Infinity,
    height: 0.2,
    path: `${MODEL_DIR}link_master_sword.glb`,
    position: [0.72, -0.72, -1.55],
    rotation: [0.1, 0.05, -0.25]
  }
};

export const game = {
  running: false,
  ended: false,
  yaw: 0,
  pitch: 0,
  kills: 0,
  health: player.health,
  recoil: 0,
  weaponChange: 0,
  pendingWeapon: null
};
