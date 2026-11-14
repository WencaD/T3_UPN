import { game, weapons } from './configuracion.js';

// Valores anteriores para actualizar el HUD solo cuando cambian.
let lastAmmoText = '';
let lastHealthText = '';
let lastHealthWidth = '';
let lastAmmoWidth = '';

export function updateHud() {
  // Sincroniza salud, munición y barras con el estado del juego.
  const active = weapons[game.activeWeapon || 'ray'];
  const ammoText = active.name === 'MASTER SWORD'
    ? '∞ · CUERPO A CUERPO' : `${active.ammo} / ${active.max}`;
  const healthText = `${game.health}%`;
  const healthWidth = `${game.health}%`;
  const ammoWidth = active.name === 'MASTER SWORD'
    ? '100%' : `${(active.ammo / active.max) * 100}%`;
  if (ammoText !== lastAmmoText) {
    document.querySelector('#ammo').textContent = ammoText;
    lastAmmoText = ammoText;
  }
  if (healthText !== lastHealthText) {
    document.querySelector('#health').textContent = healthText;
    lastHealthText = healthText;
  }
  if (healthWidth !== lastHealthWidth) {
    document.querySelector('#health-bar').style.width = healthWidth;
    lastHealthWidth = healthWidth;
  }
  if (ammoWidth !== lastAmmoWidth) {
    document.querySelector('#ammo-bar').style.width = ammoWidth;
    lastAmmoWidth = ammoWidth;
  }
}

export function showToast(message) {
  const toast = document.querySelector('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 1700);
}

export function endGame(victory) {
  // Muestra el resultado y detiene la partida.
  if (game.ended) return;
  game.ended = true;
  game.running = false;
  document.exitPointerLock?.();
  document.querySelector('#end-title').textContent = victory ? 'MISIÓN COMPLETADA' : 'GAME OVER';
  document.querySelector('#end-message').textContent = victory
    ? 'Has llegado a la zona de extracción.'
    : 'Un zombi te ha atrapado en el sector.';
  document.querySelector('#end-kicker').textContent = victory ? 'TRANSMISIÓN RECIBIDA' : 'SEÑAL PERDIDA';
  document.querySelector('#end-screen').classList.remove('hidden');
}
