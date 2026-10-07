/* ===== Diario de Estudio — heat map logic =====
 * Pure functions: no DOM, no localStorage. "hoy" is always a parameter
 * (constitution rule 3). Dates are always local, never UTC (rule 5).
 * Loaded as a classic <script> in the browser and required from Node tests
 * through the CommonJS guard at the bottom (plan decision T1).
 */
"use strict";

const WEEKS_IN_WINDOW = 12;
const DAYS_IN_WINDOW = WEEKS_IN_WINDOW * 7;

// "YYYY-MM-DD" -> local Date (never UTC)
function parseDate(text) {
  const parts = text.split("-");
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

// Local Date -> "YYYY-MM-DD"
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// The text looks like "YYYY-MM-DD" AND is a real calendar day
// (e.g. "2026-02-30" is rejected)
function isValidDateText(text) {
  if (typeof text !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return false;
  }
  const date = parseDate(text);
  return (
    date.getFullYear() === Number(text.slice(0, 4)) &&
    date.getMonth() === Number(text.slice(5, 7)) - 1 &&
    date.getDate() === Number(text.slice(8, 10))
  );
}

// Adds (or subtracts) days to a local date
function addDays(text, days) {
  const date = parseDate(text);
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

// Monday of the week that contains "hoy" (weeks run Monday to Sunday)
function getMondayOfWeek(hoy) {
  const date = parseDate(hoy);
  const sinceMonday = (date.getDay() + 6) % 7; // Monday = 0 ... Sunday = 6
  date.setDate(date.getDate() - sinceMonday);
  return formatDate(date);
}

// Minutes -> intensity level (RF-2): 0 empty | 1-30 soft | 31-60 medium | 61+ high
function classifyMinutes(minutes) {
  if (!(minutes > 0)) return "empty"; // also covers NaN
  if (minutes <= 30) return "soft";
  if (minutes <= 60) return "medium";
  return "high";
}

// A session is valid when the date is real and the minutes are a
// finite number greater than 0 (RF-4: invalid data is only ignored,
// never repaired or deleted)
function isValidSession(session) {
  if (typeof session !== "object" || session === null) return false;
  if (!isValidDateText(session.fecha)) return false;
  return (
    typeof session.minutos === "number" &&
    Number.isFinite(session.minutos) &&
    session.minutos > 0
  );
}

// "YYYY-MM-DD" -> sum of valid minutes of that day (RF-2).
// Invalid sessions (RF-4) and future days (RF-3) are skipped;
// the input array is never modified (constitution rule 5).
function buildDayTotals(sessions, hoy) {
  const totals = {};
  for (const session of sessions) {
    if (!isValidSession(session)) continue; // RF-4: ignore, do not delete
    if (session.fecha > hoy) continue; // RF-3: future days add nothing
    totals[session.fecha] = (totals[session.fecha] || 0) + session.minutos;
  }
  return totals;
}

// Cells of the heat map: the current week plus the previous 11 weeks,
// one column per week (Monday to Sunday), stopping at "hoy" so days in
// the future are never rendered (RF-1, RF-3).
// Returns [{ fecha, minutos, nivel }, ...] ordered from oldest to newest.
function buildHeatmap(hoy, sessions) {
  const totals = buildDayTotals(sessions, hoy);
  const startMonday = addDays(getMondayOfWeek(hoy), -(DAYS_IN_WINDOW - 7));

  const cells = [];
  for (let offset = 0; offset < DAYS_IN_WINDOW; offset++) {
    const fecha = addDays(startMonday, offset);
    if (fecha > hoy) break; // RF-3: last column may be short
    const minutos = totals[fecha] || 0;
    cells.push({ fecha, minutos, nivel: classifyMinutes(minutos) });
  }
  return cells;
}

// Browser: the functions above become globals.
// Node (tests): export them. No build step needed (plan decision T1).
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    getMondayOfWeek,
    classifyMinutes,
    isValidSession,
    buildDayTotals,
    buildHeatmap,
  };
}
