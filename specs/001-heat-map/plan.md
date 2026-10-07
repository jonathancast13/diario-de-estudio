# Plan de implementación — Mapa de calor (001-heat-map)

La spec define el QUÉ y el POR QUÉ. Aquí: la técnica para conseguirlo, respetando la
constitución (nº de archivo → RF que cubre).

## 1. Archivos creados y modificados

| Archivo | Acción | Responsabilidad | RF |
|---|---|---|---|
| `logic.js` | **Nuevo** | Toda la lógica pura del mapa: ventana de 12 semanas, suma de minutos por día, clasificación de intensidad. Sin DOM, sin localStorage, con `hoy` como parámetro. Exporta para Node con guarda `module.exports` (ver decisión T1). | RF-1, RF-2, RF-3, RF-4 |
| `app.js` | Modificado | Solo capa de interfaz: nueva `renderHeatmap()` (pinta celdas y tooltip) y su llamada dentro de `pintarTodo()`. No se tocan las funciones `calcular*` existentes. | RF-5, RF-7, RF-9 (pintado) |
| `index.html` | Modificado | Sección propia entre el resumen y el formulario: contenedor del grid + leyenda estática en español. | RF-6, RF-8, RF-9 |
| `styles.css` | Modificado | Rejilla CSS del mapa (12×7), 4 niveles de color con las tintas existentes del "cuaderno", tooltip y ajuste a 375 px. | RNF-1, niveles de RF-2 |
| `logic.test.js` | **Nuevo** | Tests unitarios de `logic.js` con `node:test` (sin dependencias). | RF-1…RF-4 y casos límite 1–8 |
| `AGENTS.md` | Modificado | Añadir `logic.js` y `logic.test.js` a la estructura; mandar a leer el plan por spec. | Proceso |
| `MEMORY.md` | Modificado | Estado de la implementación al terminar. | Criterio final |

No se cambia el formato de los datos guardados (fuera de alcance; constitución 5).

## 2. Funciones puras de lógica (en inglés, constitución 6; todas reciben `hoy`)

- `getMondayOfWeek(hoy)` → lunes de la semana de `hoy` en fecha local. *(RF-1, RNF-5)*
- `classifyMinutes(minutos)` → `"empty" | "soft" | "medium" | "high"` con los umbrales
  0 / 1–30 / 31–60 / 61+. *(RF-2, caso 6)*
- `isValidSession(sesión)` → fecha con pinta `AAAA-MM-DD` **y** día real (p. ej.
  2026-02-30 no lo es), y `minutos` numérico finito > 0. *(define RF-4)*
- `buildDayTotals(sesiones, hoy)` → mapa `fecha → suma de minutos válidos`; descarta
  inválidas (RF-4) y futuras (RF-3) **sin modificar** el array recibido. *(RF-2 suma,
  RF-3, RF-4, casos 3–5, 8)*
- `buildHeatmap(hoy, sesiones)` → lista de celdas `{ fecha, minutos, nivel }` de las 12
  semanas (columnas lun–dom, de la semana de `hoy` y las 11 anteriores), omitiendo los
  días posteriores a `hoy`. *(RF-1, RF-3, casos 1–2)*

El pintado de fechas en español (`fechaParaMostrar`) ya existe y es pura: se reutiliza
desde la capa de interfaz; no se duplica.

## 3. Algoritmo del mapa (pseudocódigo)

```
CONSTRUIR MAPA(hoy, sesiones):
    totales ← mapa vacío
    PARA CADA s EN sesiones:
        SI NO esSesiónVálida(s) ENTONCES omitir          // RF-4: ignora, no borra
        SI s.fecha > hoy ENTONCES omitir                  // RF-3: futuro no suma
        totales[s.fecha] ← totales[s.fecha] + s.minutos   // RF-2: suma del día

    lunesInicio ← lunesDeLaSemana(hoy) - 11 semanas       // RF-1: 12 columnas
    celdas ← []
    PARA semana ← 0 HASTA 11:
        PARA fila ← 0 HASTA 6:                            // lunes…domingo
            fecha ← lunesInicio + semana·7 + fila
            SI fecha > hoy ENTONCES omitir                // RF-3: última col. incompleta
            min ← totales[fecha] SI EXISTE, si no 0
            AÑADIR celda(fecha, min, clasificarMinutos(min))   // RF-2
    DEVOLVER celdas

CLASIFICAR(MINUTOS): 0 → vacío | 1–30 → suave | 31–60 → medio | ≥61 → alto
```

## 4. Pintado en la interfaz

1. **Sección** (RF-8): en `index.html`, entre el resumen de racha y el formulario:
   título «📅 Últimas 12 semanas», contenedor del grid, leyenda (RF-6: «Sin sesión ·
   1–30 · 31–60 · 61+ min») y un único nodo de texto flotante. **Siempre visible** (RF-9).
2. **`renderHeatmap()`** (en `app.js`): llama a `buildHeatmap(hoyEnFormato(), sesiones)`,
   vacía el contenedor y crea las celdas en orden columna→fila (12×7 máximo) con su
   clase de nivel y un `aria-label` con fecha y minutos (RNF-3: no depender solo del
   color). *(RF-5, RNF-3)*
3. **Actualización** (RF-7, RNF-4): `pintarTodo()` llama también a `renderHeatmap()`;
   al guardar una sesión se repinta el mapa con el resto. *(caso 7: el siguiente repintado
   usa el nuevo "hoy")*
4. **Texto flotante** (RF-5): un nodo tooltip compartido; al señalar una celda (eventos de
   puntero: ratón y táctil) muestra «5 de octubre de 2026: 75 min» o «…: sin sesión»;
   al retirarse, desaparece.
5. **CSS** (RNF-1): `display: grid` con 12 columnas; celdas cuadradas de ~18–20 px con
   separación de 3 px → ~250 px, holgado en 375 px sin scroll horizontal. Niveles con
   tintas derivadas del acento `--marcador`; vacío con `--linea`.

## 5. Decisiones técnicas (alternativa descartada)

- **T1 — `logic.js` como script clásico con guarda `if (typeof module !== "undefined")
  module.exports = …`**: así el mismo archivo sirve en el navegador (doble clic, sin
  build) y en Node (`require`). *Descartado: módulos ES (`type="module"`), que rompen
  `file://` por CORS (AGENTS); y leer/`eval` de `app.js` en los tests, frágil y contrario
  a la constitución 3 (la lógica vive en un archivo con DOM).*
- **T2 — Repinta completo del grid** en cada `renderHeatmap()` (84 celdas máx.).
  *Descartado: actualización granular (parchear solo el día guardado): mucha complejidad
  para 84 nodos; además sigue el patrón de `pintarLista()` que ya vacía y rellena.*
- **T3 — Un único tooltip compartido** con eventos de puntero. *Descartado: atributo
  `title` nativo (no funciona al tocar, sin estilo, retardo) y un tooltip por celda (84
  nodos y eventos redundantes).*
- **T4 — Nivel por clases CSS** (`.level-soft`…). *Descartado: estilos en línea, que
  mezclarían color en JS y romperían la separación interfaz/estilo.*
- **T5 — Identificadores en inglés para lo nuevo** (constitución 6), sin renombrar lo
  existente. *Descartado: renombrar `calcular*`/`pintar*` ahora: es refactor que la spec
  no cubre (constitución 2). Queda como tarea futura con su propia spec.*
- **T6 — Validación estricta** en `isValidSession` (fecha real, minutos número > 0);
  los datos malos solo se ignoran al pintar. *Descartado: "arreglar" o borrar datos al
  leerlos (constitución 5: los datos del usuario son sagrados) y aceptar convenciones
  ambiguas ("45" como string), que enmascararían corrupciones.*
- **T7 — La lógica recibe `hoy` como parámetro** (constitución 3). *Descartado: llamar
  a `hoyEnFormato()` dentro de la lógica (como hace el código previo): hace la función
  impura e intesteable; el código antiguo queda así por alcance, no por diseño.*

## 6. Estrategia de tests (`node --test`, sin instalar nada)

- **Archivo**: `logic.test.js`, con `require("node:test")` y `require("node:assert/strict")`
  (ambos incorporados a Node) y `require("./logic.js")`. Sin `package.json`: los `.js`
  se tratan como CommonJS y `node --test` descubre los archivos `*.test.js` solo.
- **Puerta** (constitución 4): primero lógica + tests en verde; prohibido pasar a la
  interfaz con tests en rojo.

| Test | RF / caso límite |
|---|---|
| Ventana = 12 columnas, empieza en lunes hace 11 semanas | RF-1 |
| `hoy` = lunes → 78 celdas (11·7+1); `hoy` = domingo → 84 | RF-1/RF-3, caso 2 |
| Umbrales: 0/1/30/31/60/61 | RF-2, caso 6 |
| Varias sesiones mismo día → suma | RF-2, caso 2 spec |
| Días anteriores a 12 semanas no aparecen y el array de entrada no cambia | RF-3/RF-4, caso 8 |
| Días futuros ausentes; sesión futura no aporta y **no se borra** (deep-equal antes/después) | RF-3/RF-4, casos 3–4 |
| Fecha corrupta o minutos ≤ 0 / no numéricos → día ignorado | RF-4, casos 4–5 |
| `hoy` distinto cambia la ventana (prueba del medianoche) | RF-3, caso 7 |
| Cero sesiones → todas las celdas `"empty"` | RF-9 (lógica) |

- **No cubierto por `node --test`** (pintado, tooltip, leyenda, sección, 375 px, offline):
  se verifica en navegador con Chrome DevTools según `AGENTS.md` (funcionalidad, consola
  limpia y vista móvil), que es lo que exigen los criterios de finalización de la spec.

## 7. Orden de ejecución

1. `logic.js` + `logic.test.js` → `node --test` en verde (RF-1…RF-4, casos 1–8).
2. `index.html` + `styles.css` → sección, leyenda y rejilla (RF-6, RF-8, RNF-1).
3. `renderHeatmap()` en `app.js` → pintado, tooltip y llamada en `pintarTodo()`
   (RF-5, RF-7, RF-9).
4. Verificación Chrome DevTools: guardar sesión → mapa cambia; consola sin errores; 375 px.
5. Actualizar `AGENTS.md` (estructura) y `MEMORY.md`.
