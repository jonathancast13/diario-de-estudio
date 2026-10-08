# Tareas — Spec 002: Editar o borrar sesiones

Orden de dependencia. Una tarea cada vez: primero los tests (en rojo), después el
código, `node --test` en verde, marcar y seguir.

- [x] **T1. Tests rojos de las funciones puras en `logic.test.js`.** RF-1, RF-2, RF-3, RF-7
 - Hecho cuando: `node --test` falla porque aún no existen `isValidMinutes`,
   `validateSessionChanges`, `editSession`, `removeSession` y `restoreSession`.
- [x] **T2. Funciones puras en `logic.js`.** RF-1, RF-2, RF-3, RF-7
 - Hecho cuando: `node --test` queda en verde con los tests de T1 sin tocarlos
   (incluidos los casos límite 1 y 2).
- [x] **T3. Edición inline en la lista (app.js + styles.css).** RF-1, RF-2, RF-3, RF-8
 - Hecho cuando: en el navegador, Editar abre el formulario en la propia fila (solo
   Tema y Minutos), Guardar actualiza y recalcula racha/métricas/mapa, y tema vacío o
   minutos vacíos o 0 muestran el error en español sin guardar nada (el rechazo de tipos,
   p. ej. `"45"` como texto, queda cubierto en T1–T2, a nivel de lógica pura).
- [x] **T4. Borrado con confirmación inline.** RF-4, RF-5, RF-8
 - Hecho cuando: Cancelar deja la sesión intacta, y Borrar la elimina con recálculo
   inmediato de racha, semana, mes y mapa.
- [x] **T5. Aviso de deshacer de 5 s.** RF-6, RF-7
 - Hecho cuando: tras confirmar aparece «Sesión borrada · Deshacer», con Deshacer se
   restaura la sesión con sus valores originales y a los 5 s el aviso desaparece.
- [x] **T6. Verificación integral en el navegador (Chrome DevTools).** RNF-1, RNF-2, RNF-3
 - Hecho cuando: consola limpia, vista de 375 px sin scroll horizontal, la edición
   30 → 31 min cambia el color de la celda en el mapa y todos los flujos (editar,
   error, cancelar, borrar, deshacer) funcionan de punta a punta.
