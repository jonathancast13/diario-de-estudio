// Tests for logic.js — run with: node --test
// Only built-in modules: node:test + node:assert (constitution, rule 4).
"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  getMondayOfWeek,
  classifyMinutes,
  isValidSession,
  buildDayTotals,
  buildHeatmap,
} = require("./logic.js");

// Fixed local dates used across tests
const WED = "2026-10-07"; // a Wednesday
const MON = "2026-10-05"; // Monday of the same week
const SUN = "2026-10-11"; // Sunday of the same week

// ---- getMondayOfWeek (RF-1, RNF-5) ----

test("getMondayOfWeek returns the local Monday of the week", () => {
  assert.equal(getMondayOfWeek(WED), "2026-10-05");
  assert.equal(getMondayOfWeek(MON), MON);
  assert.equal(getMondayOfWeek(SUN), MON); // Sunday closes its Mon-Sun week
});

test("getMondayOfWeek crosses month and year boundaries (local dates)", () => {
  assert.equal(getMondayOfWeek("2026-10-01"), "2026-09-28");
  assert.equal(getMondayOfWeek("2026-01-01"), "2025-12-29");
});

// ---- classifyMinutes (RF-2, case 6) ----

test("classifyMinutes: threshold boundaries", () => {
  assert.equal(classifyMinutes(0), "empty");
  assert.equal(classifyMinutes(1), "soft");
  assert.equal(classifyMinutes(30), "soft");
  assert.equal(classifyMinutes(31), "medium");
  assert.equal(classifyMinutes(60), "medium");
  assert.equal(classifyMinutes(61), "high");
  assert.equal(classifyMinutes(500), "high");
  assert.equal(classifyMinutes(-5), "empty");
  assert.equal(classifyMinutes(NaN), "empty");
});

// ---- isValidSession (RF-4) ----

test("isValidSession: strict validation of date and minutes", () => {
  assert.equal(isValidSession({ fecha: "2026-10-05", minutos: 30 }), true);
  // The date must be a real calendar day
  assert.equal(isValidSession({ fecha: "2026-02-30", minutos: 30 }), false);
  assert.equal(isValidSession({ fecha: "not-a-date", minutos: 30 }), false);
  assert.equal(isValidSession({ fecha: "05/10/2026", minutos: 30 }), false);
  // Minutes must be a finite number greater than 0
  assert.equal(isValidSession({ fecha: "2026-10-05", minutos: 0 }), false);
  assert.equal(isValidSession({ fecha: "2026-10-05", minutos: -10 }), false);
  assert.equal(isValidSession({ fecha: "2026-10-05", minutos: "45" }), false);
  assert.equal(isValidSession({ fecha: "2026-10-05" }), false);
  assert.equal(isValidSession(null), false);
});

// ---- buildDayTotals (RF-2, RF-3, RF-4) ----

test("buildDayTotals sums only valid, non-future minutes", () => {
  const totals = buildDayTotals(
    [
      { fecha: "2026-10-05", minutos: 20 },
      { fecha: "2026-10-05", minutos: 10 }, // same day: summed
      { fecha: "2026-10-04", minutos: 45 },
      { fecha: "2026-12-01", minutos: 999 }, // future: ignored
      { fecha: "2026-02-30", minutos: 60 }, // impossible date: ignored
      { fecha: "2026-10-05", minutos: "45" }, // wrong type: ignored
    ],
    WED
  );
  assert.deepStrictEqual(totals, {
    "2026-10-05": 30,
    "2026-10-04": 45,
  });
});

// ---- buildHeatmap (RF-1, RF-2, RF-3, RF-9) ----

test("heatmap window: 12 weeks, from the Monday 11 weeks ago up to today (RF-1)", () => {
  const cells = buildHeatmap(WED, []);
  assert.equal(cells[0].fecha, "2026-07-20"); // Monday 11 weeks before 2026-10-05
  assert.equal(cells[cells.length - 1].fecha, WED); // never shows days after today
  assert.equal(cells.length, 80); // 84 minus the 4 future days (Oct 8-11)
  assert.deepStrictEqual(cells[0], { fecha: "2026-07-20", minutos: 0, nivel: "empty" });
});

test("last column depends on the weekday (case 2): Monday=78, Sunday=84", () => {
  const lunes = buildHeatmap(MON, []);
  assert.equal(lunes.length, 78); // 11 complete weeks + only Monday
  assert.equal(lunes[lunes.length - 1].fecha, MON);

  const domingo = buildHeatmap(SUN, []);
  assert.equal(domingo.length, 84); // complete window
  assert.equal(domingo[domingo.length - 1].fecha, SUN);
});

test("no day after today is ever rendered (RF-3)", () => {
  const cells = buildHeatmap(WED, [{ fecha: "2026-10-09", minutos: 50 }]);
  for (const cell of cells) {
    assert.ok(cell.fecha <= WED, `future cell rendered: ${cell.fecha}`);
  }
  assert.equal(cells.find((c) => c.fecha === "2026-10-09"), undefined);
});

test("several sessions on the same day are summed into one cell (RF-2)", () => {
  const cells = buildHeatmap(MON, [
    { fecha: "2026-10-05", minutos: 20 },
    { fecha: "2026-10-05", minutos: 25 },
  ]);
  const cell = cells.find((c) => c.fecha === "2026-10-05");
  assert.equal(cell.minutos, 45);
  assert.equal(cell.nivel, "medium");
});

test("invalid and future sessions are ignored without mutating the input (RF-4)", () => {
  const sesiones = [
    { id: 1, fecha: "2026-10-05", minutos: 30 }, // valid
    { id: 2, fecha: "2026-10-05", minutos: "45" }, // invalid minutes (case 4)
    { id: 3, fecha: "2026-02-30", minutos: 60 }, // impossible date (case 5)
    { id: 4, fecha: "2026-10-05", minutos: 0 }, // invalid minutes
    { id: 5, fecha: "2026-12-01", minutos: 999 }, // future (case 3)
  ];
  const copia = JSON.parse(JSON.stringify(sesiones));

  const cells = buildHeatmap(WED, sesiones);

  const cell = cells.find((c) => c.fecha === "2026-10-05");
  assert.equal(cell.minutos, 30); // only the valid one counted
  assert.equal(cell.nivel, "soft");
  assert.deepStrictEqual(sesiones, copia); // nothing deleted, nothing changed
});

test("without sessions every cell is empty (RF-9 logic)", () => {
  const cells = buildHeatmap(SUN, []);
  assert.equal(cells.length, 84);
  assert.ok(cells.every((c) => c.nivel === "empty" && c.minutos === 0));
});

test("history older than 12 weeks stays outside the window (case 8)", () => {
  const sesiones = [{ fecha: "2026-07-19", minutos: 60 }]; // Sunday before the window
  const cells = buildHeatmap(WED, sesiones);
  assert.equal(cells[0].fecha, "2026-07-20");
  assert.ok(!cells.some((c) => c.fecha === "2026-07-19"));
  assert.equal(sesiones.length, 1); // still there, untouched
});

test("case 1: short history keeps the earlier columns visible but empty", () => {
  const cells = buildHeatmap(WED, [{ fecha: "2026-10-01", minutos: 10 }]);
  assert.equal(cells.length, 80);
  assert.equal(cells[0].fecha, "2026-07-20"); // column from 11 weeks ago is still there
  assert.equal(cells[0].nivel, "empty");
  const firstStudied = cells.findIndex((c) => c.minutos > 0);
  assert.ok(firstStudied > 0);
  assert.ok(cells.slice(0, firstStudied).every((c) => c.nivel === "empty"));
});

test("case 3: only future sessions -> whole window empty and data untouched", () => {
  const sesiones = [{ id: 5, fecha: "2026-12-01", minutos: 60 }];
  const copia = JSON.parse(JSON.stringify(sesiones));
  const cells = buildHeatmap(WED, sesiones);
  assert.equal(cells.length, 80); // the window is still rendered
  assert.ok(cells.every((c) => c.minutos === 0 && c.nivel === "empty"));
  assert.deepStrictEqual(sesiones, copia); // kept intact
});

test("case 5: a day whose sessions are all invalid ends up empty", () => {
  const cells = buildHeatmap(WED, [
    { fecha: "2026-10-02", minutos: 0 },
    { fecha: "2026-10-02", minutos: "45" },
    { fecha: "2026-10-02", minutos: -10 },
  ]);
  const cell = cells.find((c) => c.fecha === "2026-10-02");
  assert.equal(cell.minutos, 0);
  assert.equal(cell.nivel, "empty");
});

test("the window depends on 'hoy' (midnight, case 7)", () => {
  const ayer = buildHeatmap("2026-10-06", []);
  const hoy = buildHeatmap(WED, []);
  assert.equal(ayer.length, 79); // one day less than today
  assert.equal(hoy.length, 80);
  assert.notEqual(ayer[ayer.length - 1].fecha, hoy[hoy.length - 1].fecha);
});
