const KEY = "floor-vote-left-gags";
const ROOT = "assets/previews/left-gags/";

const PEOPLE = [
  {
    id: "harris",
    name: "Comrade Kamala",
    aka: "Kamala Harris",
    nick: "Comrade Kamala",
    shipped: "comrade",
    gags: [{ id: "comrade", label: "Locked · Mao suit, bishop mitre", file: "harris-4-mao.jpg" }],
  },
  {
    id: "newsom",
    name: "Newscum",
    aka: "Gavin Newsom",
    nick: "Governor Newscum — the Gutfeld hands",
    shipped: "boxfront",
    gags: [{ id: "boxfront", label: "Locked · Invisible box", file: "newsom-7-hands-front.jpg" }],
  },
  {
    id: "aoc",
    name: "AOC",
    aka: "Alexandria Ocasio-Cortez",
    nick: "TikTok queen — talking to the phone",
    shipped: "blacksly",
    gags: [{ id: "blacksly", label: "Locked · Black gown, sly point", file: "aoc-13-black-sly.jpg" }],
  },
  {
    id: "sanders",
    name: "Commie Bernie",
    aka: "Bernie Sanders",
    nick: "Crazy Bernie — pointing rant",
    shipped: "point",
    gags: [{ id: "point", label: "Locked · Pointing rant", file: "sanders-4-point.jpg" }],
  },
  {
    id: "schumer",
    name: "Chuck-U",
    aka: "Chuck Schumer",
    nick: "Cryin' Chuck — hanky bishop",
    shipped: "tear",
    gags: [{ id: "tear", label: "Locked · Hanky, small mitre", file: "schumer-4-tear.jpg" }],
  },
  {
    id: "pete",
    name: "Mayor Pete",
    aka: "Pete Buttigieg",
    nick: "DOT / STOP sign",
    shipped: "pothole",
    gags: [{ id: "pothole", label: "Locked · STOP sign", file: "pete-2-pothole.jpg" }],
  },
];

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

function save(picks) {
  localStorage.setItem(KEY, JSON.stringify(picks));
}

function personStatus(lockedOpen, open) {
  if (open === 0) return "All shipped.";
  return (
    "Shipped pieces stay locked. " +
    lockedOpen +
    " of " +
    open +
    " still open. Click a still, then tell Grok."
  );
}

function paint() {
  const picks = load();
  const root = document.getElementById("picks");
  const hint = document.getElementById("picks-status");
  const open = PEOPLE.filter((p) => !p.shipped).length;
  const lockedOpen = PEOPLE.filter((p) => !p.shipped && picks[p.id]).length;
  hint.textContent = personStatus(lockedOpen, open);

  root.querySelectorAll(".pick-person").forEach((el) => el.remove());
  PEOPLE.forEach((person) => {
    const sec = document.createElement("section");
    sec.className = "pick-person";
    const head = document.createElement("header");
    head.innerHTML =
      "<h2>" +
      person.name +
      "</h2><span class=\"aka\">" +
      person.aka +
      "</span><span class=\"nick\">Trump: " +
      person.nick +
      "</span>";
    const row = document.createElement("div");
    row.className = "gag-row";
    person.gags.forEach((gag) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "gag-card";
      const on = person.shipped === gag.id || picks[person.id] === gag.id;
      btn.dataset.on = on ? "1" : "0";
      if (person.shipped) btn.disabled = true;
      btn.innerHTML =
        "<img src=\"" +
        ROOT +
        gag.file +
        "\" alt=\"" +
        person.name +
        " " +
        gag.label +
        "\"><span>" +
        gag.label +
        (on ? " · picked" : "") +
        "</span>";
      btn.addEventListener("click", () => {
        if (person.shipped) return;
        const next = load();
        next[person.id] = next[person.id] === gag.id ? undefined : gag.id;
        if (!next[person.id]) delete next[person.id];
        save(next);
        paint();
      });
      row.appendChild(btn);
    });
    sec.appendChild(head);
    sec.appendChild(row);
    root.appendChild(sec);
  });
}

paint();
window.__picks = { PEOPLE, load };
