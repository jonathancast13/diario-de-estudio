# Tareas — 001-heat-map

Derivadas de `plan.md` (§7 Orden de ejecución). La spec manda: ninguna tarea puede añadir
algo fuera de `spec.md`. Puerta obligatoria: `node --test` en verde antes de avanzar.

- [x] **T1 — Lógica pura + tests**: crear `logic.js` (funciones puras con `hoy` como
  parámetro, en inglés, guarda `module.exports` según decisión T1) y `logic.test.js`;
  ejecutar `node --test` hasta el verde. **RF: 1, 2, 3, 4** (+ RF-9 en su parte de
  lógica) y casos límite 1–8. ✅ 13/13 pasan (2026-10-07).
- [x] **T2 — Sección y estilos**: `index.html` (sección del mapa entre resumen y
  formulario + leyenda) y `styles.css` (rejilla 12×7, 4 niveles, tooltip, 375 px).
  **RF: 6, 8, 9 (marcado visible)** · RNF-1. ✅ Verificado estáticamente: sección en su
  sitio, `logic.js` antes que `app.js`, los 15 ids y las 12 reglas CSS coinciden.
- [x] **T3 — Pintado**: `renderHeatmap()` en `app.js` + llamada en `pintarTodo()`,
  tooltip con eventos de puntero. **RF: 5, 7, 9 (pintado)** · RNF-3, RNF-4. ✅
  `node --check` OK en `app.js` y `logic.js`; `node --test` sigue 13/13.
- [x] **T4 — Verificación en navegador**: Chrome DevTools (guardar sesión → mapa cambia,
  consola sin errores, vista móvil 375 px). Criterios de finalización de la spec.
  ✅ Hecha el 2026-10-07 con Chrome headless vía CDP (el MCP de Chrome DevTools no estaba
  disponible; arnés temporal sin paquetes, ya borrado): **24/24 comprobaciones** — RF-2,
  RF-3, RF-4, RF-5, RF-6, RF-7, RF-8, RF-9, RNF-1 (375 px), RNF-2 (file:// + consola
  limpia), RNF-3 y 4 capturas. Se encontró y corrigió un bug: el texto sobresalía al
  tocar la última celda en móvil (scroll horizontal 422 px → 375 px tras acotarlo).
- [x] **T5 — Documentación**: actualizar `AGENTS.md` (estructura con `logic.js` y
  `logic.test.js`) y `MEMORY.md`. ✅
