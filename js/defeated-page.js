import { playCinematic, cancelCinematic } from "./cinematic.js";
import { LAST_WORDS, LOSE_REELS, fateKicker, lastWordFor } from "./last-words.js";

const Roster = window.Roster;
const $ = (id) => document.getElementById(id);

const entries = Roster.allEntries();
let selectedId = "harris";

function rowFor(id) {
  return entries.find((row) => row.entry.id === id);
}

function wordsFor(id) {
  return LAST_WORDS[id] || [];
}

function filmed(id) {
  return !!(LOSE_REELS[id] || wordsFor(id).some((w) => w.reel));
}

function paintCast() {
  ["left", "right"].forEach((house) => {
    const root = document.querySelector('.cast[data-house="' + house + '"]');
    root.innerHTML = "";
    const color = house === "right" ? "w" : "b";
    entries
      .filter((row) => row.color === color && wordsFor(row.entry.id).length)
      .forEach((row) => {
        const e = row.entry;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "cast-card";
        btn.dataset.id = e.id;
        if (e.id === selectedId) btn.dataset.sel = "on";
        if (filmed(e.id)) btn.dataset.filmed = "1";
        const n = wordsFor(e.id).length;
        btn.innerHTML =
          "<img src=\"" +
          e.portrait +
          "\" alt=\"\">" +
          "<span class=\"who\"><strong>" +
          e.name +
          "</strong><small>" +
          (filmed(e.id) ? "Filmed · " : "") +
          n +
          (n === 1 ? " line" : " lines") +
          "</small></span>";
        btn.addEventListener("click", () => {
          selectedId = e.id;
          paint();
        });
        root.appendChild(btn);
      });
  });
}

function playLose(word) {
  const lose = LOSE_REELS[selectedId];
  const reel = (word && word.reel) || (lose && lose.src);
  if (!reel) return;
  const baked = lose && lose.baked;
  playCinematic({
    src: lose ? lose.src : word.reel,
    poster: (lose && lose.poster) || (word && word.poster) || "",
    line: word ? word.line : "",
    audio: baked ? null : word && word.src,
    side: rowFor(selectedId).color === "w" ? "right" : "left",
    stamp: fateKicker(word && word.fate),
  });
}

function paintHero() {
  const row = rowFor(selectedId);
  const words = wordsFor(selectedId);
  const lose = LOSE_REELS[selectedId];
  const hero = $("hero");
  if (!row || !words.length) {
    hero.hidden = true;
    return;
  }
  hero.hidden = false;
  const e = row.entry;
  const poster = (lose && lose.poster) || e.portrait;
  $("hero-poster").src = poster;
  $("hero-name").textContent = e.name;
  $("hero-role").textContent = e.role;
  $("hero-status").textContent = lose
    ? lose.baked
      ? "Filmed · baked line"
      : "Filmed · random last word"
    : "Audio only";
  const list = $("lines");
  list.innerHTML = "";
  words.forEach((w) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "line-btn";
    if (w.onReel || w.reel) btn.dataset.reel = "1";
    btn.textContent = "“" + w.line + "”";
    btn.addEventListener("click", () => playLose(w));
    list.appendChild(btn);
  });
  const play = $("btn-play");
  play.hidden = !filmed(selectedId);
  $("status-line").textContent = e.name + " · " + words.length + " last words.";
}

function paint() {
  paintCast();
  paintHero();
}

$("btn-play").addEventListener("click", () => {
  playLose(lastWordFor(selectedId, { reel: true }));
});

$("cine-skip").addEventListener("click", (e) => {
  e.stopPropagation();
  cancelCinematic();
});
$("cine").addEventListener("click", (e) => {
  if (e.target.id === "cine" || e.target.id === "cine-video") cancelCinematic();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") cancelCinematic();
});

paint();
