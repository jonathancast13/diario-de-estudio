# MEMORY.md — Diario de Estudio

Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no
aporte.

## Estado actual
- v1–v4: registrar sesiones (fecha, tema, minutos), racha actual, mejor racha, minutos
  de la semana y días del mes. Datos en localStorage, clave `diarioEstudioSesiones`,
  formato `{ id, fecha, tema, minutos }` sin cambios entre versiones.
- v5: rediseño "cuaderno de estudio" (papel cuadriculado, tinta azul, resaltador
  amarillo, Georgia; el número de la racha con trazo de resaltador).
- v6 (2026-10-07): mapa de calor de 12 semanas (specs/001-heat-map): `logic.js` (puro,
  con `hoy`) + `logic.test.js` (`node --test` 16/16), sección y leyenda en `index.html`,
  `renderHeatmap()` en `app.js`. Spec verificada con Chrome vía CDP: 16 tests + 24
  comprobaciones, consola limpia, 375 px sin scroll. `tasks.md`: T1–T5 completadas.
- 2026-10-08: `docs/constitution.md` reescrita con 6 principios verificables y
  corregida la sección "Verificación" de `AGENTS.md` (decía que no había tests).
- v7 (2026-10-08): spec 002 (`specs/002-editar-borrar-sesiones/`, **implementada**):
  editar solo tema/minutos (fecha fija) e inline en la fila; borrado con confirmación +
  deshacer de 5 s. `logic.js` gana `editSession`/`removeSession`/`restoreSession` (sin
  `hoy`, T1 del plan); `node --test` 27/27; verificado con Chrome DevTools (consola
  limpia, 375 px sin scroll). `tasks.md`: T1–T6 completadas.

## Decisiones (y por qué)
- Sin backend ni dependencias: cualquiera debe poder abrirlo con doble clic.
- Fecha editable en el formulario: permite registrar días pasados y ver crecer la racha.
- Formato de datos = el del código: cambiarlo haría perder lo ya guardado.
- Semana = lunes a domingo, mes = natural, fechas futuras nunca cuentan.
- v5: el amarillo significa "lo que importa"; Georgia en sistema (sin webfonts, offline).
- El texto del mapa se acota al contenedor: centrado a secas sobresalía y provocaba
  scroll horizontal al tocar la última celda a 375 px (bug CDP, corregido en `app.js`).
- La skill `sdd` (`.agents/skills/sdd`) rige specs, planes y tareas: flujo
  Constitución → Spec → Clarificación → Plan → Tareas, con aprobación entre fases.

## Aprendizajes y errores a evitar
- Nunca `toISOString()` ni `new Date("AAAA-MM-DD")`: usan UTC y desplazan el día.
- No renombrar la clave de localStorage ni sus campos: el usuario pierde sus sesiones.
- Borrar los scripts de prueba temporales: el repo solo contiene archivos del proyecto.

- Al deshacer, guarda la sesión borrada ANTES de limpiar el estado: si limpias primero,
  restauras `null` (bug real de v7, detectado al verificar en navegador).

## Próximos pasos
- Hallazgo fuera de alcance de 001: `calcularMinutosSemana()` concatena texto si
  `minutos` no es número (solo con datos editados a mano). Necesita spec propia.
- Deuda declarada en la constitución (principio 3): migrar las `calcular*` de `app.js`
  a funciones puras con `hoy` como parámetro, sin cambiar comportamiento.
