# Plan de implementación — Editar o borrar sesiones (002)

La spec define el QUÉ y el POR QUÉ. Aquí: la técnica para conseguirlo, respetando la
constitución (nº de archivo → RF que cubre). Los datos guardados no cambian de formato:
`{ id, fecha, tema, minutos }` (constitución 5).

## 1. Archivos y responsabilidades

| Archivo | Acción | Responsabilidad | RF |
|---|---|---|---|
| `logic.js` | Modificado | Funciones puras: validar cambios, editar, borrar y restaurar. Sin DOM ni localStorage; nunca mutan la entrada. | RF-1 (núcleo), RF-2, RF-3, RF-7 |
| `logic.test.js` | Modificado | Tests de esas funciones con `node --test`: primero en rojo, después en verde. | RF-1, RF-2, RF-3, RF-7, casos límite 1–2 |
| `app.js` | Modificado | Solo interfaz: botones Editar/Borrar en la lista, edición inline con mensaje de error, confirmación inline, aviso de deshacer con temporizador; `guardarSesiones()` + `pintarTodo()` tras cada operación. | RF-1, RF-4, RF-5, RF-6, RF-8 (pintado) |
| `styles.css` | Modificado | Estilos de botones, formulario inline, error y aviso de deshacer; ajuste a 375 px. | RNF-2 |
| `index.html` | Sin cambios (previsiblemente) | La lista y los estados transitorios se generan desde JS, como ya ocurre. | — |

## 2. Funciones puras (en `logic.js`)

Todas reciben la lista y devuelven una **nueva** lista u objeto; ni el array ni los
objetos se tocan (constitución 5, tests de inmutabilidad).

- `isValidMinutes(minutes)` → `true` si es número finito mayor que 0. Extraído de
  `isValidSession` para que la regla de "minutos válidos" viva en un solo sitio y no
  diverjan el mapa y la edición.
- `validateSessionChanges(changes)` → `[]` de códigos de error (`emptyTopic`,
  `invalidMinutes`); vacío si es válido. Los textos en español los pinta `app.js`.
- `editSession(sessions, id, changes)` → `{ ok, errors, sessions }`. Solo aplica `tema`
  (recortado) y `minutos`; **ignora cualquier `fecha` en `changes`** → RF-3.
- `removeSession(sessions, id)` → nueva lista sin esa sesión; la quitada no se modifica
  (hace falta intacta para deshacer).
- `restoreSession(sessions, session)` → nueva lista con la sesión devuelta; la lista se
  reordena al pintar, por eso basta con reinsertarla.

**Sobre `hoy`**: ninguna de estas funciones lo necesita: editar y borrar no dependen de
la fecha (decisión T1).

## 3. Algoritmo (pseudocódigo)

### Validar cambios (RF-2)

```
validateSessionChanges(changes):
  errores = []
  SI changes.tema no es texto O trim(changes.tema) está vacío:
    errores += "emptyTopic"
  SI changes.minutos no pasa isValidMinutes:
    errores += "invalidMinutes"
  DEVOLVER errores
```

### Editar (RF-1, RF-3)

```
editSession(sessions, id, changes):
  errores = validateSessionChanges(changes)
  SI errores no vacío: DEVOLVER { ok: false, errors: errores, sessions }   // RF-2
  nuevaLista = PARA CADA s EN sessions:
    SI s.id == id:  { ...s, tema: trim(changes.tema), minutos: changes.minutos }
    EN otro caso:   s                                                     // RF-3: id y fecha intactos
  DEVOLVER { ok: true, errors: [], sessions: nuevaLista }
```

### Borrar y deshacer (RF-4…RF-7)

```
al pulsar Borrar en la fila:
  la fila muestra "¿Borrar esta sesión?" → [Borrar] [Cancelar]
  SI Cancelar: la sesión sigue ahí                    // RF-5 (también antes de confirmar)
  AL PULSAR Borrar:
    borrado = copia de la sesión
    sesiones = removeSession(sesiones, id)
    guardarSesiones(); pintarTodo()                   // RF-8
    mostrar aviso "Sesión borrada · Deshacer"         // RF-6
    arrancar temporizador de 5 s
    SI se pulsa Deshacer ANTES de que acabe:
      sesiones = restoreSession(sesiones, borrado)
      guardarSesiones(); pintarTodo()                 // RF-7
    AL ACABAR EL TIEMPO: quitar el aviso (borrado definitivo)
```

## 4. Interfaz

- Cada fila de la lista añade dos botones pequeños: **Editar** y **Borrar**, discretos,
  que no compitan con la píldora de minutos.
- **Editar**: la fila se sustituye por un formulario inline con *Tema* y *Minutos* y los
  botones *Guardar* y *Cancelar* — **no hay campo de fecha** (RF-3). El formulario
  convierte los minutos a número antes de validarlos. El error de RF-2 aparece debajo,
  en rojo, y el formulario se queda abierto con lo que el usuario escribió (RNF-2).
- **Borrar**: la confirmación ocurre dentro de la propia fila (RF-4); hasta que no se
  pulsa *Borrar*, nada cambia (RF-5).
- Tras borrar: aviso «Sesión borrada · Deshacer» durante 5 s; después desaparece.
- Cada operación cierra los estados transitorios y repinta todo (lista, racha, minutos
  de la semana, días del mes y mapa) de una vez (RF-8).
- Responsive: los botones se reducen a icono por debajo de 480 px, sin scroll
  horizontal a 375 px.

## 5. Decisiones (y alternativa descartada)

- **T1 — Pureza sin `hoy`**: editar/borrar no reciben `hoy` porque su resultado no
  depende de la fecha; sí son puras y viven en `logic.js`.
  *Descartado*: pasar `hoy` como parámetro muerto solo por cumplir la letra de la
  constitución (ruido sin ganancia).
- **T2 — Confirmación inline en la fila** en vez de `window.confirm()`.
  *Descartado*: diálogo nativo (bloquea, no se estiliza y no encaja con el cuaderno).
- **T3 — Deshacer de 5 segundos** con la sesión copiada en memoria.
  *Descartado*: 10 s (el aviso vive demasiado) y barra de deshacer permanente (ocupa
  sitio de forma continua por un error puntual). Resuelve la duda abierta de la spec.
- **T4 — Un solo deshacer pendiente**: un nuevo borrado sustituye al aviso anterior
  (el anterior deja de poder deshacerse).
  *Descartado*: cola de deshaceres (más estados y más UI para un caso improbable).
- **T5 — Edición inline en la propia fila**, sin modal.
  *Descartado*: modal/overlays (piezas extra, peor en móvil).
- **T6 — Mutabilidad cero**: todas las funciones devuelven listas nuevas.
  *Descartado*: mutar `sesiones` en el sitio (rompe los tests de inmutabilidad y
  facilita perder datos, constitución 5).
- **T7 — Códigos de error en `logic.js`, texto español en `app.js`**.
  *Descartado*: cadenas en español dentro de `logic.js` (mezcla capas; la capa pura
  sigue sin textos de interfaz).

## 6. Estrategia de tests (`node --test`)

Primero rojo, después verde (constitución 4). Se añaden a `logic.test.js`:

| Test | RF |
|---|---|
| `editSession` cambia tema y minutos y devuelve lista nueva; la original queda intacta | RF-1 |
| Rechaza tema vacío/solo espacios y minutos 0, negativos, `NaN`, `"45"` o ausentes: `ok=false`, `errors` con el código y lista sin tocar | RF-2 |
| Aunque `changes` incluya `fecha`, la sesión conserva fecha e `id` | RF-3 |
| `removeSession` quita solo la sesión elegida, no muta la entrada y la quitada queda válida | RF-4/RF-5 (base) |
| `restoreSession` la devuelve con valor e `id` originales | RF-7 |
| Borrar/ editar la única sesión → lista vacía | Caso límite 1 |
| Varias sesiones el mismo día: solo cambia la del `id` elegido | Caso límite 2 |

Verificación en navegador (Chrome DevTools, igual que en 001): RF-4 (la confirmación
aparece y cancelar no borra), RF-6 (aviso y caducidad a los 5 s), RF-8 (racha, semana,
mes y mapa cambian al instante), RF-2 por interfaz (error visible y formulario abierto),
RNF-2 y vista móvil de 375 px. El caso límite 3 (cambio de nivel de color) se ve con
una edición de 30 → 31 min.
