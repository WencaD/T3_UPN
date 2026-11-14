# Operación Extracción

## Descripción del juego

FPS 3D desarrollado con Three.js. El jugador debe atravesar una zona
industrial infestada, recoger recursos, derrotar zombis y llegar a la zona de
extracción.

## Instalación

Requisitos:

- Navegador moderno con WebGL.
- Python 3.

Clona el repositorio:

```powershell
git clone https://github.com/WencaD/T3_UPN.git
cd T3_UPN
```

No se necesitan paquetes adicionales.

## Ejecución

Desde la carpeta del proyecto:

```powershell
py -m http.server 8000
```

Abre <http://localhost:8000> en el navegador. No abras `index.html` con doble
clic, porque los módulos y modelos GLB requieren un servidor HTTP.

## Controles

| Tecla | Acción |
| --- | --- |
| `W A S D` | Moverse |
| Mouse | Mirar |
| Clic izquierdo | Disparar una vez |
| `1` | Ray Gun |
| `2` | Master Sword |
| `Esc` | Liberar el mouse |

La Ray Gun usa munición limitada y se recarga recogiendo cajas. La Master Sword
es cuerpo a cuerpo. Los botiquines recuperan salud.

## Recursos externos

- Three.js:
  <https://unpkg.com/three@0.160.0/build/three.module.js>
- GLTFLoader:
  <https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js>
- Tipografías Barlow Condensed y DM Mono:
  <https://fonts.google.com/>

Los modelos `ray_gun_v1.glb`, `link_master_sword.glb`, `zombie.glb`,
`bullet_kin.glb` y `med_kit.glb` están incluidos en `Modelos 3D/` como recursos
proporcionados para este proyecto. Si fueron descargados externamente, se debe
añadir su autor, URL y licencia.

## Estructura

```text
index.html       Entrada del juego
styles.css       Interfaz y HUD
codigo/          Módulos JavaScript
Modelos 3D/      Recursos GLB
```
