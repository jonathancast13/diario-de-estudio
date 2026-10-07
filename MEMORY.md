# MEMORY.md — Diario de Estudio

Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no
aporte.

## Estado actual
- v1 funcionando: registrar sesiones (fecha, tema, minutos), racha actual y lista de
  sesiones.
- v2: mejor racha (histórica) en la tarjeta de la racha (`calcularMejorRacha()`).
- v3: total de minutos de la semana en la misma tarjeta (`calcularMinutosSemana()`).
- v4: días estudiados este mes en la misma tarjeta (`calcularDiasEstudiadosMes()`).
- v5: rediseño con estética "cuaderno de estudio" (papel cuadriculado, tinta azul,
  resaltador amarillo, títulos en Georgia). La racha es el héroe, con un trazo de
  resaltador detrás del número; las 3 métricas secundarias pasan a fila con filetes.
  Solo tocaron `index.html` y `styles.css`: `app.js` no cambió.
- Datos en localStorage, clave `diarioEstudioSesiones`. Sin cambios de formato entre
  versiones.
- Spec `specs/001-heat-map/spec.md` activa (mapa de calor, 12 semanas, 4 niveles de
  color), cerrada sin dudas abiertas. Plan y tasks en la misma carpeta.
- v6 (2026-10-07): mapa de calor de las 12 semanas (specs/001-heat-map). `logic.js`
  (lógica pura con `hoy`, export con guarda `module.exports`) + `logic.test.js` →
  `node --test` 16/16 en verde. `index.html`: sección + leyenda; `styles.css`: rejilla
  12×7 con `.level-*`; `app.js`: `renderHeatmap()` en `pintarTodo()` y tooltip con
  eventos de puntero. `logic.js` se carga antes que `app.js`. Sin dependencias nuevas.
- Spec verificada el 2026-10-07: 16 tests de lógica + 24 comprobaciones de interfaz con
  Chrome real vía CDP (headless, sin paquetes; el MCP de Chrome DevTools no estaba
  disponible). Consola limpia, móvil 375 px sin scroll horizontal. 4 capturas en
  `Temp/opencode/heatmap-verif-*.png`.

## Decisiones (y por qué)
- Sin backend ni dependencias: cualquiera debe poder abrirlo con doble clic.
- Fecha editable en el formulario: permite registrar días pasados y ver la racha crecer.
- Formato de datos = el del código (`{ id, fecha, tema, minutos }`): la fuente de verdad
  es el código y cambiarlo haría perder lo ya guardado.
- Semana = lunes a domingo (no "últimos 7 días"): se reinicia cada lunes, convención en
  España. Las fechas futuras no cuentan, igual que en las rachas.
- Mes = natural, del día 1 a hoy (no "últimos 30 días"): coherente con el criterio
  semanal. Último día del mes con `new Date(año, mes, 0)` (local, válido en febrero y
  bisiestos).
- Rediseño v5: identidad propia en vez del kit genérico de tarjetas con degradado. El
  amarillo significa "lo que importa" (número de racha resaltado, píldora de minutos).
  Georgia en sistema (sin webfonts) para que funcione offline.
- El texto del mapa se acota al contenedor (centrado en la celda sin salirse de la
  tarjeta): centrado a secas sobresalía y provocaba scroll horizontal al tocar la última
  celda a 375 px. Bug encontrado en la verificación CDP y corregido en `app.js`.

## Aprendizajes y errores a evitar
- Nunca `toISOString()` ni `new Date("AAAA-MM-DD")`: usan UTC y desplazan el día.
- No renombrar la clave de localStorage ni sus campos: el usuario pierde sus sesiones.
- Borrar los scripts de prueba temporales de Node: el repo solo debe tener los archivos
  del proyecto.

## Próximos pasos
- Hallazgo fuera de alcance de 001: `calcularMinutosSemana()` concatena texto si
  `minutos` no es número (visible con datos editados a mano; el formulario no lo
  produce). Necesita spec propia; el mapa sí ignora esos datos correctamente (RF-4).
