# Operación Extracción

Videojuego FPS 3D para la evaluación T3. El código JavaScript está organizado en `codigo/` y usa los modelos GLB ubicados en `Modelos 3D/`:

- `ray_gun_v1.glb`: arma 1.
- `link_master_sword.glb`: arma 2.
- `zombie.glb`: enemigos.
- `bullet_kin.glb`: cajas de munición.
- `med_kit.glb`: botiquines.

## Ejecutar

Se necesita servir la carpeta por HTTP para que el navegador pueda cargar los módulos y los archivos GLB. Con Python instalado:

```powershell
py -m http.server 8000
```

Después abre `http://localhost:8000` en el navegador.

## Controles

- `W A S D`: movimiento.
- Mouse: orientar la cámara.
- Clic izquierdo: un disparo por clic.
- `1`: Ray Gun (18 balas).
- `2`: Master Sword (arma cuerpo a cuerpo, sin recarga).
- Acércate a una caja de balas para recuperar la munición de la Ray Gun.
- Acércate a un botiquín para recuperar salud.

Cada zombi se activa al estar a 11 unidades, persigue al jugador y requiere exactamente dos impactos. Los ataques reducen la salud y los botiquines la recuperan. Si la salud llega a cero aparece `GAME OVER`; alcanza el círculo verde al final del recorrido para ganar.
