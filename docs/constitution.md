# Constitución — Diario de Estudio

Principios innegociables. Toda spec, plan y tarea debe cumplirlos.

1. **Stack**: solo HTML/CSS/JS puros, sin dependencias ni build. Se comprueba: `index.html` abre con doble clic y la consola queda limpia.
2. **La spec manda**: solo se implementa lo que cubre la spec activa; si falta una decisión, se para y se pregunta. Se comprueba: cada RF tiene su tarea y su comprobación.
3. **Lógica ≠ interfaz**: los cálculos van en funciones puras sin DOM ni localStorage y con `hoy` como parámetro (`logic.js`); `app.js` pinta y gestiona eventos. Migrar las `calcular*` de v1–v4 es deuda declarada.
4. **Tests**: `node --test` en verde para terminar cualquier tarea, sin instalar nada. Un rojo bloquea el avance.
5. **Datos sagrados**: clave `diarioEstudioSesiones` y formato `{ id, fecha, tema, minutos }` intactos; lo inválido se ignora, nunca se borra ni se repara. Se comprueba: tests de inmutabilidad en verde.
6. **Idioma**: identificadores y comentarios en inglés; interfaz, specs y docs en español; fechas locales, nunca UTC.
