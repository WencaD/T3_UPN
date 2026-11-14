# Operación Extracción

## Descripción del juego

Videojuego FPS 3D desarrollado para la evaluación T3 de Computación Gráfica y
Visual. El jugador debe atravesar una zona industrial infestada, administrar
sus recursos y llegar al punto de extracción sin ser atrapado.

## Tecnologías

- HTML5, CSS3 y JavaScript ES Modules.
- Three.js `0.160.0`.
- GLTFLoader para cargar modelos `.glb`.
- WebGL para el renderizado 3D.

## Instalación

1. Descarga o clona este repositorio:

   ```powershell
   git clone https://github.com/WencaD/T3_UPN.git
   cd T3_UPN
   ```

2. Verifica que la carpeta `Modelos 3D/` contenga los archivos `.glb`.
3. No es necesario instalar paquetes de Node.js: Three.js y GLTFLoader se
   cargan mediante CDN desde `index.html`.

## Requisitos

- Navegador moderno con soporte para WebGL y JavaScript Modules.
- Python 3 instalado para ejecutar un servidor local.
- No se debe abrir `index.html` directamente con `file://`, porque los módulos
  y modelos GLB requieren una conexión HTTP.

## Ejecución

Desde la carpeta raíz del proyecto, ejecuta:

```powershell
py -m http.server 8000
```

Después abre en el navegador:

```text
http://localhost:8000
```

Para detener el servidor, presiona `Ctrl + C` en la terminal.

## Controles

| Control | Acción |
| --- | --- |
| `W` | Avanzar |
| `S` | Retroceder |
| `A` | Desplazarse a la izquierda |
| `D` | Desplazarse a la derecha |
| Movimiento del mouse | Orientar la cámara |
| Clic izquierdo | Realizar un disparo |
| `1` | Seleccionar la Ray Gun |
| `2` | Seleccionar la Master Sword |
| `Esc` | Liberar el cursor |

Cada clic izquierdo genera un único disparo. Mantener presionado el mouse no
activa disparos automáticos.

## Mecánicas principales

- Cámara en primera persona con movimiento WASD y orientación mediante mouse.
- Dos armas 3D:
  - **Ray Gun:** comienza con 18 municiones y utiliza cajas de abastecimiento.
  - **Master Sword:** arma cuerpo a cuerpo sin sistema de recarga.
- Los zombis se activan al acercarse el jugador y lo persiguen.
- Cada zombi tiene dos puntos de resistencia.
- Cualquier parte del cuerpo puede recibir impactos:
  - cabeza,
  - torso,
  - brazos,
  - piernas.
- Cada impacto válido reduce un punto de vida.
- El zombi queda eliminado exactamente después del segundo impacto.
- Los zombis no atraviesan las estructuras del escenario.
- Las cajas de munición restauran la munición de la Ray Gun.
- Los botiquines restauran salud.
- El jugador pierde salud si un zombi entra en contacto con él.
- Si la salud llega a cero, aparece `GAME OVER`.
- La misión termina al alcanzar la zona verde de extracción.

## Estructura del proyecto

```text
T3/
├── index.html
├── styles.css
├── README.md
├── codigo/
│   ├── armas.js
│   ├── configuracion.js
│   ├── enemigos.js
│   ├── escena.js
│   ├── interfaz.js
│   ├── juego.js
│   ├── modelos.js
│   └── objetos.js
└── Modelos 3D/
    ├── bullet_kin.glb
    ├── link_master_sword.glb
    ├── med_kit.glb
    ├── ray_gun_v1.glb
    └── zombie.glb
```

### Módulos JavaScript

- `juego.js`: ciclo principal, entrada del usuario, movimiento y disparos.
- `configuracion.js`: configuración del jugador, armas y modelos.
- `escena.js`: construcción del mapa, iluminación y colisiones.
- `modelos.js`: carga y normalización de modelos GLB.
- `armas.js`: carga, cambio y animación de armas.
- `enemigos.js`: zombis, persecución, animación y zonas de impacto.
- `objetos.js`: munición, botiquines y recogida de objetos.
- `interfaz.js`: HUD, mensajes, victoria y Game Over.

## Fuentes de recursos externos

### Librerías y tipografías

- Three.js:
  <https://unpkg.com/three@0.160.0/build/three.module.js>
- GLTFLoader de Three.js:
  <https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js>
- Barlow Condensed y DM Mono, Google Fonts:
  <https://fonts.google.com/>

### Modelos 3D

Los siguientes archivos son recursos locales incluidos en el repositorio:

- `ray_gun_v1.glb`
- `link_master_sword.glb`
- `zombie.glb`
- `bullet_kin.glb`
- `med_kit.glb`

Estos modelos fueron proporcionados para el desarrollo del proyecto y se
mantienen dentro de `Modelos 3D/`. No se agregaron URLs de descarga externas
porque el proyecto no contiene la fuente original de esos archivos. Si los
modelos fueron descargados de una plataforma externa, se debe reemplazar esta
nota por el autor, URL y licencia de cada recurso antes de la entrega.

No se utilizaron otros recursos externos para la construcción del escenario.

## Repositorio

Código fuente del proyecto:

<https://github.com/WencaD/T3_UPN>

## Solución de problemas

### Los modelos no aparecen

Verifica que el servidor se haya iniciado desde la carpeta raíz `T3/` y que
los archivos `.glb` estén dentro de `Modelos 3D/`.

### El navegador bloquea los módulos

No abras el archivo con doble clic. Ejecuta el servidor HTTP y utiliza
`http://localhost:8000`.

### El mouse no mueve la cámara

Haz clic dentro del juego para activar Pointer Lock. Presiona `Esc` para
liberarlo.
