import * as THREE from 'three';
import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

export const loader = new GLTFLoader();
const modelCache = new Map();

export function loadModel(path) {
  if (!modelCache.has(path)) {
    modelCache.set(path, new Promise((resolve, reject) => {
      loader.load(path, file => resolve(file.scene), undefined, reject);
    }));
  }
  return modelCache.get(path).then(model => model.clone(true));
}

export function normalizeModel(model, targetHeight) {
  const bounds = new THREE.Box3().setFromObject(model);
  const size = bounds.getSize(new THREE.Vector3());
  model.scale.multiplyScalar(targetHeight / Math.max(size.y, 0.001));
  const adjustedBounds = new THREE.Box3().setFromObject(model);
  model.position.y -= adjustedBounds.min.y;
}
