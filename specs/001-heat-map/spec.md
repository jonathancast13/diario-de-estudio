# Especificación — Mapa de calor de días estudiados (001-heat-map)

## Contexto y objetivo

El Diario de Estudio ya registra sesiones y muestra la racha actual, la mejor racha, los
minutos de la semana y los días del mes. Esos datos responden a "cómo llevo ahora" y a
"mi récord", pero no dejan ver el patrón de las últimas semanas: los huecos y el ritmo
real de estudio solo se intuyen recorriendo la lista.

Objetivo: mostrar un mapa de calor tipo GitHub con las últimas 12 semanas, donde el
color de cada día refleja los minutos estudiados, para que el usuario reconozca su
constancia (y sus huecos) de un vistazo y se motive.

## Usuarios

- **Estudiante** (principal): usa el diario a diario y quiere ver su hábito reciente de
  un vistazo.
- **Persona que revisa el progreso** (secundario): mira el diario de otra persona
  (p. ej. enseñándolo); solo consulta, no aporta datos.

## Historias de usuario

- US-1: Como estudiante, quiero ver mis últimas 12 semanas en un mapa, para reconocer de
  un vistazo mis días de estudio y mis huecos.
- US-2: Como estudiante, quiero saber los minutos de un día concreto al señalarlo, para
  recordar ese día sin buscar en la lista.
- US-3: Como usuario recién estrenado, quiero ver el mapa aunque esté vacío, para
  entender dónde aparecerá mi progreso.
- US-4: Como usuario, quiero que no aparezcan días futuros, para no confundirlos con
  días sin estudiar.

## Requisitos funcionales

**RF-1 — Ventana y estructura.**
Siempre que se muestre el diario, entonces el mapa presenta la semana en curso y las 11
anteriores (12 en total), con una columna por semana y una fila por día de la semana.
Dado que la semana del diario es de lunes a domingo, entonces cada columna representa un
lunes–domingo y las filas van de lunes (arriba) a domingo (abajo).

**RF-2 — Intensidad por minutos.**
Cuando un día tiene sesiones registradas, entonces su color refleja la suma de los
minutos de ese día: sin ninguna sesión → celda vacía; 1–30 min → nivel suave; 31–60 min
→ nivel medio; 61 min o más → nivel alto.
Dado que un mismo día puede tener varias sesiones, cuando se calcula su color, entonces
se suman todos sus minutos válidos.

**RF-3 — Días futuros.**
Si un día de la ventana es posterior a hoy, entonces no se representa en el mapa; la
última columna puede quedar incompleta.

**RF-4 — Datos inválidos.**
Si una sesión guardada tiene fecha o minutos inválidos, entonces el mapa la ignora para
calcular el color, no muestra ningún error y no modifica ni elimina esos datos.
Si una sesión guardada tiene fecha futura, entonces no aporta color a ningún día.

**RF-5 — Texto al señalar un día.**
Cuando el usuario señala con el ratón o toca un día, entonces aparece un texto con su
fecha en formato largo en español (p. ej. «5 de octubre de 2026») y sus minutos
totales; si el día no tiene sesión, entonces el texto indica «sin sesión».
Mientras que el puntero deja de señalar el día (o se retira el dedo), entonces el texto
desaparece.

**RF-6 — Leyenda.**
Siempre que se muestra el mapa, entonces aparece una leyenda que asocia cada nivel de
intensidad con su rango de minutos, de modo que el color no sea la única explicación.

**RF-7 — Actualización.**
Cuando el usuario guarda una nueva sesión, entonces el mapa refleja el cambio en ese
momento, junto al resto de los datos del diario.

**RF-8 — Ubicación.**
Siempre que se muestra la página, entonces el mapa ocupa una sección propia entre el
resumen de racha y el formulario de nueva sesión.

**RF-9 — Sin sesiones.**
Cuando no hay ninguna sesión registrada, entonces la sección se muestra con todas las
celdas vacías en lugar de ocultarse.

## Requisitos no funcionales

- RNF-1: El mapa completo se ve en móvil (375 px de ancho) sin desplazamiento horizontal.
- RNF-2: Se muestra sin conexión, al abrir el diario con doble clic, como el resto.
- RNF-3: La información de un día no depende solo del color: la leyenda y el texto al
  señalarlo la transmiten también.
- RNF-4: El mapa se actualiza al instante al guardar una sesión, sin pasos extra.
- RNF-5: Se respetan las reglas de fecha local del diario (nunca UTC).

## Casos límite

1. Menos de 12 semanas de historial → las columnas anteriores quedan vacías.
2. Hoy es lunes → la última columna solo contiene lunes; hoy es domingo → columna
   completa de 7 días.
3. Solo existen sesiones con fecha futura → mapa vacío; esas sesiones se conservan
   intactas.
4. Un día con una sesión válida y otra inválida → se suma solo la válida.
5. Un día cuyas sesiones son todas inválidas → celda vacía.
6. Días en los bordes de umbral: 30 min → suave, 31 → medio, 60 → medio, 61 → alto.
7. La página queda abierta cruzando medianoche → el mapa usa el nuevo "hoy" en el
   siguiente repintado.
8. Más de 12 semanas de historial → solo se muestran las últimas 12; lo anterior no
   aparece en el mapa y no se elimina.

## Fuera de alcance (esta versión)

- Pulsar un día para filtrar la lista de sesiones.
- Editar o borrar sesiones desde el mapa.
- Navegar a semanas anteriores ni ampliar la ventana de 12 semanas.
- Configurar los umbrales de color o el número de semanas.
- Etiquetas de mes, estadísticas o comparativas dentro del mapa.
- Exportar, imprimir o compartir el mapa.
- Cualquier cambio en el formato de los datos guardados.

## Criterios de finalización

- Todos los RF-1…RF-9 tienen sus criterios EARS cumplidos, incluidos los casos límite 1–8.
- Los tests automatizados de la lógica están en verde (`node --test`), sin instalar nada.
- Verificación en navegador (Chrome DevTools): funcionalidad probada, consola sin
  errores y vista móvil de 375 px correcta.
- La constitución se respeta: sin dependencias, lógica separada de la interfaz y datos
  del usuario intactos (formato de guardado sin cambios).
- `MEMORY.md` actualizado con el estado de la implementación.

## Dudas abiertas

Ninguna. Todas resueltas el 7 de octubre de 2026:

- **Umbrales de color**: confirmados 1–30 (suave) / 31–60 (medio) / 61+ (alto) min.
- **Cero sesiones**: se muestra la rejilla vacía (RF-9); no se oculta la sección, para
  invitar a empezar, igual que hace la lista con su mensaje vacío.
- **Etiquetas de mes**: fuera de esta versión; se valoran si el mapa se percibe difícil
  de situar en el tiempo.
- **Datos inválidos (RF-4)**: confirmado "ignorar sin borrar ni fallar", en línea con el
  principio "los datos del usuario son sagrados".
