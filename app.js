/* ===== Diario de Estudio - lógica de la web ===== */

// Clave donde guardamos las sesiones en el navegador
const CLAVE_STORAGE = "diarioEstudioSesiones";

// Cargamos las sesiones guardadas (o empezamos con una lista vacía)
let sesiones = cargarSesiones();

// ---- Referencias a los elementos de la página ----
const formulario = document.getElementById("formularioSesion");
const campoFecha = document.getElementById("fecha");
const campoTema = document.getElementById("tema");
const campoMinutos = document.getElementById("minutos");
const listaSesiones = document.getElementById("listaSesiones");
const mensajeVacio = document.getElementById("mensajeVacio");
const rachaNumero = document.getElementById("rachaNumero");
const rachaTexto = document.getElementById("rachaTexto");
const mejorRachaNumero = document.getElementById("mejorRachaNumero");
const minutosSemanaNumero = document.getElementById("minutosSemanaNumero");
const minutosSemanaTexto = document.getElementById("minutosSemanaTexto");
const diasMesNumero = document.getElementById("diasMesNumero");
const diasMesTexto = document.getElementById("diasMesTexto");
const heatmapGrid = document.getElementById("heatmapGrid");
const heatmapTooltip = document.getElementById("heatmapTooltip");

// ---- Funciones de fecha (siempre fecha local, nunca UTC) ----

// Devuelve la fecha de hoy en formato "YYYY-MM-DD" usando la hora local
function hoyEnFormato() {
  return fechaEnFormato(new Date());
}

// Convierte un Date a "YYYY-MM-DD" usando los valores locales
function fechaEnFormato(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

// Suma (o resta) días a una fecha en formato "YYYY-MM-DD"
function sumarDias(fechaTexto, dias) {
  const partes = fechaTexto.split("-");
  const fecha = new Date(
    Number(partes[0]),
    Number(partes[1]) - 1,
    Number(partes[2])
  );
  fecha.setDate(fecha.getDate() + dias);
  return fechaEnFormato(fecha);
}

// Formatea "YYYY-MM-DD" para mostrarla en pantalla: "1 de octubre de 2026"
function fechaParaMostrar(fechaTexto) {
  const partes = fechaTexto.split("-");
  const fecha = new Date(
    Number(partes[0]),
    Number(partes[1]) - 1,
    Number(partes[2])
  );
  return fecha.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ---- Guardar y cargar ----

function cargarSesiones() {
  const datos = localStorage.getItem(CLAVE_STORAGE);
  if (!datos) return [];
  try {
    return JSON.parse(datos);
  } catch {
    return [];
  }
}

function guardarSesiones() {
  localStorage.setItem(CLAVE_STORAGE, JSON.stringify(sesiones));
}

// ---- Racha ----

function calcularRacha() {
  // Conjunto con los días que tienen al menos una sesión
  const diasEstudiados = new Set(sesiones.map((s) => s.fecha));

  const hoy = hoyEnFormato();
  const ayer = sumarDias(hoy, -1);

  // Punto de partida:
  // - Si hoy ya he estudiado, la racha termina hoy.
  // - Si hoy todavía no, pero ayer sí, la racha sigue viva hasta que acabe el día.
  // - Si ni hoy ni ayer, no hay racha.
  let diaActual;
  if (diasEstudiados.has(hoy)) {
    diaActual = hoy;
  } else if (diasEstudiados.has(ayer)) {
    diaActual = ayer;
  } else {
    return 0;
  }

  // Contamos hacia atrás los días consecutivos con sesión
  let racha = 0;
  while (diasEstudiados.has(diaActual)) {
    racha++;
    diaActual = sumarDias(diaActual, -1);
  }

  return racha;
}

// Devuelve la racha más larga que se ha conseguido nunca
function calcularMejorRacha() {
  // Días con al menos una sesión, sin repetir
  const hoy = hoyEnFormato();
  const diasEstudiados = new Set(
    sesiones.map((s) => s.fecha).filter((f) => f <= hoy) // las fechas futuras no suman
  );

  // Las fechas ordenadas de más antigua a más reciente
  const diasOrdenados = [...diasEstudiados].sort();

  let mejor = 0;
  let rachaActual = 0;
  let diaAnterior = null;

  for (const dia of diasOrdenados) {
    // Si el día es el siguiente al anterior, la racha continúa;
    // si no, empieza una racha nueva
    if (diaAnterior !== null && dia === sumarDias(diaAnterior, 1)) {
      rachaActual++;
    } else {
      rachaActual = 1;
    }

    if (rachaActual > mejor) {
      mejor = rachaActual;
    }
    diaAnterior = dia;
  }

  return mejor;
}

// Devuelve los minutos estudiados en la semana actual (de lunes a domingo)
function calcularMinutosSemana() {
  const hoy = hoyEnFormato();

  // Calculamos el lunes de esta semana con fecha local (nunca UTC)
  const partes = hoy.split("-");
  const fechaHoy = new Date(
    Number(partes[0]),
    Number(partes[1]) - 1,
    Number(partes[2])
  );
  // getDay(): 0 = domingo, 1 = lunes, ..., 6 = sábado
  const diaSemana = fechaHoy.getDay();
  const diasHastaLunes = diaSemana === 0 ? 6 : diaSemana - 1;
  const lunes = sumarDias(hoy, -diasHastaLunes);
  const domingo = sumarDias(lunes, 6);

  // Sumamos los minutos de las sesiones de la semana (sin fechas futuras)
  let total = 0;
  for (const sesion of sesiones) {
    if (sesion.fecha >= lunes && sesion.fecha <= domingo && sesion.fecha <= hoy) {
      total += sesion.minutos;
    }
  }

  return total;
}

// Devuelve los días con al menos una sesión en el mes en curso
function calcularDiasEstudiadosMes() {
  const hoy = hoyEnFormato();

  // Año y mes actuales con fecha local (nunca UTC)
  const partes = hoy.split("-");
  const anio = Number(partes[0]);
  const mes = partes[1]; // "01" a "12"

  // Primer día del mes y último día (new Date(año, mes, 0) da el último del mes)
  const primerDia = `${anio}-${mes}-01`;
  const ultimoDiaDelMes = new Date(anio, Number(mes), 0).getDate();
  const ultimoDia = `${anio}-${mes}-${String(ultimoDiaDelMes).padStart(2, "0")}`;

  // Días con sesión dentro del mes, sin repetir y sin fechas futuras
  const dias = new Set(
    sesiones
      .map((s) => s.fecha)
      .filter((f) => f >= primerDia && f <= ultimoDia && f <= hoy)
  );

  return dias.size;
}

// ---- Pintar la página ----

function pintarRacha() {
  const racha = calcularRacha();
  rachaNumero.textContent = racha;
  rachaTexto.textContent =
    racha === 1 ? "día seguido estudiando" : "días seguidos estudiando";
  mejorRachaNumero.textContent = calcularMejorRacha();

  // Total de minutos de la semana
  const minutos = calcularMinutosSemana();
  minutosSemanaNumero.textContent = minutos;
  minutosSemanaTexto.textContent = minutos === 1 ? "minuto" : "minutos";

  // Días estudiados este mes
  const diasMes = calcularDiasEstudiadosMes();
  diasMesNumero.textContent = diasMes;
  diasMesTexto.textContent = diasMes === 1 ? "día" : "días";
}

function pintarLista() {
  // Ordenamos de la sesión más reciente a la más antigua
  const ordenadas = [...sesiones].sort((a, b) => {
    // Primero por fecha (más nueva arriba)
    if (a.fecha !== b.fecha) return b.fecha.localeCompare(a.fecha);
    // Si empate, la añadida más tarde arriba
    return b.id - a.id;
  });

  listaSesiones.innerHTML = "";
  mensajeVacio.style.display = ordenadas.length === 0 ? "block" : "none";

  for (const sesion of ordenadas) {
    const li = document.createElement("li");

    const info = document.createElement("div");
    info.className = "sesion-info";

    const tema = document.createElement("span");
    tema.className = "sesion-tema";
    tema.textContent = sesion.tema;

    const fecha = document.createElement("span");
    fecha.className = "sesion-fecha";
    fecha.textContent = fechaParaMostrar(sesion.fecha);

    info.appendChild(tema);
    info.appendChild(fecha);

    const minutos = document.createElement("span");
    minutos.className = "sesion-minutos";
    minutos.textContent = `${sesion.minutos} min`;

    li.appendChild(info);
    li.appendChild(minutos);
    listaSesiones.appendChild(li);
  }
}

// ---- Mapa de calor (specs/001-heat-map) ----

// Pinta las celdas de las últimas 12 semanas con la lógica pura de logic.js
function renderHeatmap() {
  const celdas = buildHeatmap(hoyEnFormato(), sesiones);
  heatmapGrid.innerHTML = "";
  for (const celda of celdas) {
    const div = document.createElement("div");
    div.className = "heatmap-cell level-" + celda.nivel;
    div.dataset.fecha = celda.fecha;
    div.dataset.minutos = String(celda.minutos);
    const detalle = celda.minutos > 0 ? `${celda.minutos} minutos` : "sin sesión";
    div.setAttribute("aria-label", `${fechaParaMostrar(celda.fecha)}: ${detalle}`);
    heatmapGrid.appendChild(div);
  }
}

// Texto flotante (RF-5): aparece al señalar/tocar un día y desaparece al retirarse
heatmapGrid.addEventListener("pointerover", function (evento) {
  const celda = evento.target.closest(".heatmap-cell");
  if (!celda) return;
  const minutos = Number(celda.dataset.minutos);
  const detalle = minutos > 0 ? `${minutos} min` : "sin sesión";
  heatmapTooltip.textContent = `${fechaParaMostrar(celda.dataset.fecha)}: ${detalle}`;
  heatmapTooltip.hidden = false;
  // Clamp the text to its container so it never sticks out of the card
  // (on a 375px phone that would create horizontal scrolling)
  const half = heatmapTooltip.offsetWidth / 2;
  const center = celda.offsetLeft + celda.offsetWidth / 2;
  const limit = heatmapTooltip.parentElement.clientWidth - half;
  heatmapTooltip.style.left = `${Math.max(half, Math.min(center, limit))}px`;
});

heatmapGrid.addEventListener("pointerout", function (evento) {
  if (evento.target.closest(".heatmap-cell")) {
    heatmapTooltip.hidden = true;
  }
});

function pintarTodo() {
  pintarRacha();
  pintarLista();
  renderHeatmap();
}

// ---- Eventos ----

formulario.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const fecha = campoFecha.value;
  const tema = campoTema.value.trim();
  const minutos = Number(campoMinutos.value);

  // Validaciones
  if (!fecha || !tema || !Number.isFinite(minutos) || minutos <= 0) {
    return;
  }

  const sesion = {
    id: Date.now(), // identificador único basado en la hora actual
    fecha: fecha,
    tema: tema,
    minutos: minutos,
  };

  sesiones.push(sesion);
  guardarSesiones();
  pintarTodo();

  // Reiniciamos el formulario para la próxima sesión
  campoFecha.value = hoyEnFormato();
  campoTema.value = "";
  campoMinutos.value = "";
  campoTema.focus();
});

// ---- Primer pintado ----

campoFecha.value = hoyEnFormato(); // la fecha por defecto es hoy
pintarTodo();
