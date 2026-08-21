import {
  VOICES,
  DELIVERY,
  lineFor,
  proposedLine,
  hooksFor,
  pickHook,
  selectedIndex,
  saveLine,
  resetLine,
  isEdited,
  isFilmed,
  allMatchups,
} from "./kill-scripts.js";

const Roster = window.Roster;
const $ = (id) => document.getElementById(id);

const FILMED_SRC = {
  "maga:activist": {
    src: "assets/cinematics/right-kills.mp4",
    poster: "assets/cinematics/right-kills.jpg",
  },
  "activist:maga": {
    src: "assets/cinematics/left-kills.mp4",
    poster: "assets/cinematics/left-kills.jpg",
  },
};

const entries = Roster.allEntries();
const byId = {};
entries.forEach((row) => {
  byId[row.entry.id] = row;
});

let leftId = "activist";
let rightId = "maga";
let killerHouse = "right";
let filter = "all";

function killerId() {
  return killerHouse === "right" ? rightId : leftId;
}

function victimId() {
  return killerHouse === "right" ? leftId : rightId;
}

function paintCast() {
  ["left", "right"].forEach((house) => {
    const root = document.querySelector('.cast[data-house="' + house + '"]');
    root.innerHTML = "";
    const color = house === "right" ? "w" : "b";
    entries
      .filter((row) => row.color === color)
      .forEach((row) => {
        const e = row.entry;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "cast-card";
        btn.dataset.id = e.id;
        if (e.id === killerId()) btn.dataset.sel = "killer";
        else if (e.id === victimId()) btn.dataset.sel = "victim";
        btn.innerHTML =
          "<img src=\"" +
          e.portrait +
          "\" alt=\"\">" +
          "<span class=\"who\"><strong>" +
          e.name +
          "</strong><small>" +
          e.role +
          "</small></span>";
        btn.addEventListener("click", () => pick(e.id));
        root.appendChild(btn);
      });
  });
}

function pick(id) {
  const row = byId[id];
  if (!row) return;
  if (row.color === "w") rightId = id;
  else leftId = id;
  paint();
}

function flipTakes() {
  killerHouse = killerHouse === "right" ? "left" : "right";
  paint();
}

function fillFigure(prefix, id, emptyRole) {
  const row = id && byId[id];
  const img = $("img-" + prefix);
  const name = $("name-" + prefix);
  const role = $("role-" + prefix);
  if (!row) {
    img.removeAttribute("src");
    name.textContent = prefix === "killer" ? "Choose a killer" : "Choose a victim";
    role.textContent = emptyRole;
    return;
  }
  img.src = row.entry.portrait;
  name.textContent = row.entry.name;
  role.textContent =
    (row.entry.aka ? row.entry.aka + " · " : "") +
    row.entry.role +
    " · " +
    Roster.ROSTER[row.color].house;
}

function paintStage() {
  fillFigure("killer", killerId(), "Killer");
  fillFigure("victim", victimId(), "Victim");
  const card = $("line-card");
  const k = killerId();
  const v = victimId();
  if (!k || !v) {
    card.hidden = true;
    return;
  }
  card.hidden = false;
  const filmed = isFilmed(k, v);
  const edited = isEdited(k, v);
  $("line-status").textContent = filmed ? "Filmed" : edited ? "Edited draft" : "Draft — not filmed";
  const voice = VOICES[k];
  $("line-voice").textContent = voice ? "Voice: " + voice.label : "";
  $("line-delivery").textContent = DELIVERY[k] || "";
  $("line-edit").value = isEdited(k, v) ? lineFor(k, v) : "";
  $("btn-try").textContent = filmed ? "Play filmed cam" : "Try the cam";
  paintHooks(k, v);
}

function paintHooks(k, v) {
  const root = $("hooks");
  root.innerHTML = "";
  const chosen = lineFor(k, v);
  const sel = selectedIndex(k, v);
  hooksFor(k, v).forEach((hook) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "hook";
    btn.dataset.heat = hook.heat;
    if (!isEdited(k, v) && hook.i === (sel < 0 ? 0 : sel)) btn.classList.add("on");
    if (isEdited(k, v) && hook.text === chosen) btn.classList.add("on");
    btn.innerHTML =
      "<span class=\"heat\">" +
      hook.heat +
      "</span><span class=\"said\">“" +
      hook.text +
      "”</span>";
    btn.addEventListener("click", () => {
      pickHook(k, v, hook.i);
      paint();
    });
    root.appendChild(btn);
  });
}

function paintLedger() {
  const rows = allMatchups(entries).filter((m) => {
    const k = m.killer.entry.id;
    const v = m.victim.entry.id;
    if (filter === "killer") return k === killerId();
    if (filter === "filmed") return isFilmed(k, v);
    if (filter === "draft") return !isFilmed(k, v);
    return true;
  });
  $("ledger-count").textContent =
    rows.length + " pair" + (rows.length === 1 ? "" : "s") + " on this list.";
  const body = $("ledger-body");
  body.innerHTML = "";
  rows.forEach((m) => {
    const k = m.killer.entry;
    const v = m.victim.entry;
    const filmed = isFilmed(k.id, v.id);
    const edited = isEdited(k.id, v.id);
    const tr = document.createElement("tr");
    if (k.id === killerId() && v.id === victimId()) tr.className = "on";
    const st = filmed ? "filmed" : edited ? "edit" : "";
    const stLabel = filmed ? "Filmed" : edited ? "Edited" : "Draft";
    tr.innerHTML =
      "<td><img class=\"pair\" src=\"" +
      k.portrait +
      "\" alt=\"\">" +
      k.name +
      "</td>" +
      "<td class=\"arrow\">→</td>" +
      "<td><img class=\"pair\" src=\"" +
      v.portrait +
      "\" alt=\"\">" +
      v.name +
      "</td>" +
      "<td class=\"line-cell\">“" +
      (lineFor(k.id, v.id) || "") +
      "” <small>" +
      hooksFor(k.id, v.id).length +
      " hooks</small></td>" +
      "<td class=\"st " +
      st +
      "\">" +
      stLabel +
      "</td>";
    tr.addEventListener("click", () => {
      if (m.killer.color === "w") {
        rightId = k.id;
        leftId = v.id;
        killerHouse = "right";
      } else {
        leftId = k.id;
        rightId = v.id;
        killerHouse = "left";
      }
      paint();
      $("stage-scripts").scrollIntoView({ block: "start", behavior: "smooth" });
    });
    body.appendChild(tr);
  });
}

function paint() {
  paintCast();
  paintStage();
  paintLedger();
}

function closeTry() {
  const cine = $("cine");
  const video = $("cine-video");
  video.pause();
  video.removeAttribute("src");
  video.load();
  video.hidden = true;
  cine.hidden = true;
}

function tryCam() {
  const k = killerId();
  const v = victimId();
  if (!k || !v) return;
  const cine = $("cine");
  const video = $("cine-video");
  const line = lineFor(k, v);
  $("cine-line").textContent = line || "";
  $("try-killer").src = byId[k].entry.portrait;
  $("try-victim").src = byId[v].entry.portrait;
  const filmed = FILMED_SRC[k + ":" + v];
  $("try-stamp").textContent = filmed ? "Kill cam · filmed" : "Kill cam · draft";
  cine.hidden = false;
  if (filmed) {
    video.hidden = false;
    video.poster = filmed.poster;
    video.src = filmed.src;
    video.currentTime = 0;
    video.muted = false;
    video.onended = closeTry;
    video.onerror = () => {
      video.hidden = true;
    };
    const p = video.play();
    if (p && p.catch) p.catch(() => {
      video.muted = true;
      video.play().catch(() => {
        video.hidden = true;
      });
    });
  } else {
    video.hidden = true;
  }
}

$("btn-save").addEventListener("click", () => {
  saveLine(killerId(), victimId(), $("line-edit").value);
  paint();
});
$("btn-reset").addEventListener("click", () => {
  resetLine(killerId(), victimId());
  paint();
});
document.querySelector(".takes").addEventListener("click", flipTakes);
$("btn-try").addEventListener("click", tryCam);
$("cine-skip").addEventListener("click", closeTry);
$("cine").addEventListener("click", (e) => {
  if (e.target.id === "cine") closeTry();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeTry();
});

document.querySelectorAll(".ledger-filters button").forEach((btn) => {
  btn.addEventListener("click", () => {
    filter = btn.dataset.filter;
    document.querySelectorAll(".ledger-filters button").forEach((b) => {
      b.classList.toggle("on", b === btn);
    });
    paintLedger();
  });
});

window.__scripts = {
  pick,
  flipTakes,
  line: () => lineFor(killerId(), victimId()),
  pair: () => ({ killer: killerId(), victim: victimId() }),
  proposed: (k, v) => proposedLine(k, v),
  hooks: (k, v) => hooksFor(k || killerId(), v || victimId()),
};

paint();
