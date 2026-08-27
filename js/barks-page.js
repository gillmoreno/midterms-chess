import { linesFor } from "./barks.js";

const $ = (id) => document.getElementById(id);
const Roster = window.Roster;

let playing = null;

function people() {
  const out = [];
  if (!Roster) return out;
  Roster.allEntries().forEach((row) => {
    const e = row.entry;
    out.push({
      id: e.id,
      name: e.name,
      aka: e.aka,
      role: e.role,
      portrait: e.portrait,
      house: row.color === "w" ? "right" : "left",
      bench: false,
    });
  });
  ["w", "b"].forEach((c) => {
    (Roster.BENCH[c] || []).forEach((e) => {
      out.push({
        id: e.id,
        name: e.name,
        aka: e.aka,
        role: e.role,
        portrait: e.portrait,
        house: c === "w" ? "right" : "left",
        bench: true,
      });
    });
  });
  return out;
}

function playLine(src) {
  if (playing) {
    playing.pause();
    playing = null;
  }
  const audio = new Audio(src);
  playing = audio;
  audio.play().catch(() => {});
}

function card(person) {
  const lines = linesFor(person.id);
  const el = document.createElement("article");
  el.className = "bark-card";
  el.dataset.id = person.id;
  el.dataset.has = lines.length ? "1" : "0";

  const head = document.createElement("header");
  const img = document.createElement("img");
  img.src = person.portrait;
  img.alt = person.name;
  const meta = document.createElement("div");
  const name = document.createElement("strong");
  name.textContent = person.name;
  const role = document.createElement("small");
  role.textContent =
    (person.bench ? "Bench · " : "") +
    (person.aka ? person.aka + " · " : "") +
    person.role;
  const mark = document.createElement("span");
  mark.className = "mark";
  mark.textContent = lines.length
    ? lines.length === 1
      ? "1 bark"
      : lines.length + " barks"
    : "Missing";
  meta.appendChild(name);
  meta.appendChild(role);
  meta.appendChild(mark);
  head.appendChild(img);
  head.appendChild(meta);
  el.appendChild(head);

  if (!lines.length) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "Needs a click bark.";
    el.appendChild(empty);
    return el;
  }

  const list = document.createElement("ol");
  lines.forEach((line) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "line";
    btn.textContent = line.line;
    btn.addEventListener("click", () => playLine(line.src));
    list.appendChild(btn);
  });
  el.appendChild(list);
  return el;
}

function boot() {
  const roster = people();
  const starters = roster.filter((p) => !p.bench);
  const bench = roster.filter((p) => p.bench);
  const has = (p) => linesFor(p.id).length > 0;
  const filled = starters.filter(has).length;

  starters
    .filter((p) => p.house === "right")
    .forEach((p) => $("grid-right").appendChild(card(p)));
  starters
    .filter((p) => p.house === "left")
    .forEach((p) => $("grid-left").appendChild(card(p)));

  if (bench.length) {
    $("bench-wrap").hidden = false;
    bench.forEach((p) => $("grid-bench").appendChild(card(p)));
  }

  const missing = starters.filter((p) => !has(p));
  $("barks-status").textContent =
    filled +
    " of " +
    starters.length +
    " on the board have a click bark. " +
    missing.length +
    " still need one.";
  $("status-line").textContent = missing.length
    ? "Missing: " + missing.map((p) => p.name).join(", ") + "."
    : "Every starter has at least one click bark.";

  window.__barksLedger = { people: roster, filled, missing: missing.map((p) => p.id) };
}

boot();
