# Spec 002 — Editar o borrar sesiones
Estado: implementada

## Contexto y objetivo

El diario registra sesiones de estudio y muestra la racha, las métricas y un mapa de
calor. A veces se registran datos incorrectos (tema equivocado, minutos erróneos) o
sesiones por error. Hoy no hay forma de corregirlo: la única opción es borrar los datos
a mano desde el navegador.

Objetivo: permitir editar (tema y minutos) y borrar sesiones de forma segura,
manteniendo siempre correctos la racha, las métricas y el mapa.

## Usuarios

- **Estudiante** (principal): registra sesiones a diario y a veces necesita corregir o
  eliminar lo registrado.
- **Persona que revisa el progreso** (secundario): solo consulta, no edita ni borra.

## Historias de usuario

- HU-1. Como estudiante, quiero editar el tema o los minutos de una sesión para
  corregir errores al registrar.
- HU-2. Como estudiante, quiero borrar una sesión que registré por error para que no
  cuente en mi racha ni en el mapa.
- HU-3. Como estudiante, quiero deshacer un borrado accidental para no perder datos.

## Requisitos funcionales

- RF-1: CUANDO el usuario edita el tema o los minutos de una sesión guardada, EL SISTEMA
  actualiza esos valores y recalcula la racha, las métricas y el mapa.
- RF-2: SI al editar el tema queda vacío o los minutos no son un número mayor que 0,
  ENTONCES EL SISTEMA no guarda el cambio, mantiene el valor anterior y muestra un error.
- RF-3: EL SISTEMA no permite cambiar la fecha de una sesión guardada.
- RF-4: CUANDO el usuario borra una sesión, EL SISTEMA pide confirmación antes de
  eliminarla.
- RF-5: MIENTRAS el usuario no confirma el borrado, EL SISTEMA conserva la sesión.
- RF-6: CUANDO el usuario confirma el borrado, EL SISTEMA elimina la sesión y muestra un
  aviso con opción de deshacer.
- RF-7: SI el usuario deshace un borrado, ENTONCES EL SISTEMA restaura la sesión con
  sus valores originales.
- RF-8: CUANDO se edita o borra una sesión, EL SISTEMA recalcula la racha, los minutos
  de la semana, los días del mes y el mapa de calor.

## Requisitos no funcionales

- RNF-1: El borrado siempre pide confirmación y ofrece deshacer; nunca se pierde una
  sesión sin que el usuario lo haya confirmado.
- RNF-2: Los errores de edición se muestran de forma clara y no dejan la sesión en un
  estado intermedio.
- RNF-3: Tras cualquier edición o borrado, la racha, las métricas y el mapa quedan
  siempre correctos y coherentes.

## Casos límite

1. Editar o borrar la única sesión registrada → el diario vuelve al estado vacío.
2. Varias sesiones el mismo día: editar o borrar una no afecta a las demás.
3. Editar los minutos de forma que cambie el nivel de color del día en el mapa
   (p. ej. de 30 a 31 minutos) → el mapa refleja el nuevo nivel.
4. Borrar una sesión que rompe la racha → la racha se recalcula sin ese día.
5. Deshacer el borrado de una sesión cuando ya se han hecho otras operaciones después →
   la sesión restaurada conserva sus valores originales.

## Fuera de alcance

- Cambiar la fecha de una sesión.
- Editar o borrar desde el mapa (el mapa es de solo lectura).
- Deshacer ediciones (el deshacer es solo para borrados).
- Borrado múltiple o borrado de todas las sesiones.
- Historial de cambios o auditoría de ediciones y borrados.

## Criterios de finalización

- Cada RF tiene su tarea y su comprobación verificable.
- La lógica tiene tests con `node --test` en verde.
- Verificación en navegador: editar, rechazar edición inválida, borrar con confirmación,
  deshacer, y recálculo de racha, métricas y mapa.

## Dudas abiertas

- [NECESITA ACLARACIÓN] Duración exacta del deshacer (se propondrá un valor en el plan,
  p. ej. 5 segundos).
