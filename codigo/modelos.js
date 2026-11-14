import * as THREE from 'three';
import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

export const loader = new GLTFLoader();

export function loadModel(path) {
  return new Promise((resolve, reject) => {
    loader.load(path, file => resolve(file.scene), undefined, reject);
  });
}

export function normalizeModel(model, targetHeight) {
  const bounds = new THREE.Box3().setFromObject(model);
  const size = bounds.getSize(new THREE.Vector3());
  model.scale.multiplyScalar(targetHeight / Math.max(size.y, 0.001));
  const adjustedBounds = new THREE.Box3().setFromObject(model);
  model.position.y -= adjustedBounds.min.y;
}
