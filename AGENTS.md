# AGENTS.md — Diario de Estudio
Web estática para registrar sesiones de estudio y motivarse viendo la racha de días
seguidos. Proyecto didáctico: el código debe poder entenderlo alguien que empieza a
programar.

## Stack y estructura
- HTML, CSS y JavaScript puros: sin frameworks, librerías, npm, bundler ni build.
- `index.html` (estructura), `styles.css` (estilos), `app.js` (lógica de interfaz y
  datos), `logic.js` (lógica pura del mapa de calor, sin DOM ni localStorage, testeable
  en Node) y `logic.test.js` (pruebas con `node --test`).
- Debe funcionar abriendo `index.html` con doble clic (`file://`): nada de módulos ES
(`type="module"`), `fetch` a archivos locales ni nada que requiera servidor.

## Convenciones
- Textos de la interfaz en español.
- Código simple, nombres descriptivos y comentarios solo donde aporten.
- Diseño limpio y responsive; cualquier pantalla nueva debe verse bien en el móvil.
- Estética "cuaderno de estudio": fondo de papel cuadriculado (CSS puro), tinta azul
  `#1f2a44`, acento resaltador `#ffd43b`, títulos y números en Georgia. Sin degradados
  decorativos ni webfonts (debe funcionar offline).

## Datos
- localStorage, clave `diarioEstudioSesiones`: array de `{ id, fecha, tema, minutos }`,
donde `fecha` es `"AAAA-MM-DD"` e `id` es `Date.now()`.
- Si cambias la forma de los datos, mantén compatibilidad con lo ya guardado o el usuario
perderá sus sesiones.

## Fechas y racha (fácil equivocarse)
- Trabaja siempre con la fecha local del usuario. Nunca uses `toISOString()` ni `new
Date("AAAA-MM-DD")`: se interpretan en UTC y desplazan el día.
- Racha = días consecutivos con al menos 1 sesión que terminan hoy. Si hoy no hay sesión
pero ayer sí, la racha sigue viva y se cuenta desde ayer.
- Varias sesiones el mismo día cuentan como un solo día. Las fechas futuras no suman.
- Mejor racha = racha más larga de la historia (`calcularMejorRacha()` en `app.js`):
rachas consecutivas sobre los días con sesión, ignorando fechas futuras, recalculada en
cada pintado. Se muestra junto a la racha actual.
- Total semanal (`calcularMinutosSemana()`): suma de minutos de las sesiones de la semana
actual, de lunes a domingo (fecha local), excluyendo fechas futuras. Se recalcula en cada
pintado.
- Días estudiados este mes (`calcularDiasEstudiadosMes()`): días con al menos 1 sesión del
mes en curso, del día 1 al último (fecha local), excluyendo futuras. Varias sesiones el
mismo día cuentan 1. Se recalcula en cada pintado.

## Forma de trabajar
- Haz solo lo que se pide: no añadas funcionalidades por tu cuenta.
- Cambios pequeños y enfocados; no reescribas lo que ya funciona.
- Al terminar, resume qué has cambiado y cualquier decisión que deba revisar.

## Memoria
- Al empezar, lee `MEMORY.md` para conocer el estado del proyecto y las decisiones
tomadas.
- Al terminar una tarea, actualízalo: estado actual, decisiones importantes (con su
porqué) y errores a evitar.
- Mantenlo breve (máximo ~50 líneas): resume o elimina lo que ya no aporte.
- Si algo se convierte en una regla permanente, propón moverlo a `AGENTS.md` en lugar de
dejarlo en la memoria.
- No guardes nunca datos sensibles (claves, tokens, datos personales).

## Comandos
- Tests: `node --test`

## Reglas
- Lee `docs/constitution.md` y la spec activa (`specs/NNN-*/`) antes de tocar código.

## Límites
- ✅ Siempre: respetar las reglas de fechas y racha, mantener los textos en español.
- ✅ Siempre: actualizar `MEMORY.md` al terminar cada tarea.
- ⚠️ Pregunta antes: crear archivos nuevos, cambiar el formato de los datos guardados.
- 🚫 Nunca: añadir dependencias, frameworks o un paso de build.

## Verificación
- No hay tests automáticos. Después de cada cambio, verifica con el MCP de Chrome
DevTools: abre `index.html`, prueba la funcionalidad, revisa la consola y comprueba la
vista móvil. 
- Para empezar de cero: DevTools → Application → Local Storage → borrar la clave
`diarioEstudioSesiones`. 