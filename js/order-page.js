const Roster = window.Roster;
const $ = (id) => document.getElementById(id);

const byId = {};
if (Roster) {
  Roster.allEntries().forEach((row) => {
    byId[row.entry.id] = row.entry;
  });
}

function nameFor(id) {
  return (byId[id] && byId[id].name) || id;
}

function closeCine() {
  const cine = $("cine");
  const video = $("cine-video");
  video.pause();
  video.removeAttribute("src");
  video.load();
  cine.hidden = true;
  cine.removeAttribute("data-side");
}

function playBed(bed) {
  const cine = $("cine");
  const video = $("cine-video");
  $("cine-stamp").textContent = "Order · mute";
  $("cine-line").textContent = nameFor(bed.id) + " takes the order";
  cine.dataset.side = bed.side;
  video.poster = bed.still;
  video.src = bed.mute;
  video.muted = true;
  video.currentTime = 0;
  cine.hidden = false;
  video.onended = closeCine;
  video.onerror = closeCine;
  const p = video.play();
  if (p && p.catch) p.catch(() => {
    video.muted = true;
    video.play().catch(closeCine);
  });
}

function card(bed) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "order-card";
  btn.dataset.id = bed.id;
  btn.dataset.side = bed.side;
  const img = document.createElement("img");
  img.src = bed.still;
  img.alt = nameFor(bed.id);
  const who = document.createElement("strong");
  who.textContent = nameFor(bed.id);
  const role = document.createElement("small");
  role.textContent = (byId[bed.id] && byId[bed.id].role) || bed.type;
  btn.appendChild(img);
  btn.appendChild(who);
  btn.appendChild(role);
  btn.addEventListener("click", () => playBed(bed));
  return btn;
}

async function boot() {
  const status = $("orders-status");
  let data;
  try {
    const res = await fetch("studio/capture-order/beds.json");
    if (!res.ok) throw new Error("missing catalog");
    data = await res.json();
  } catch (err) {
    status.textContent =
      "Studio beds are local-only. Run npm start in this folder — Pages does not ship studio/.";
    return;
  }
  const beds = data.beds || [];
  const shown = beds.filter((b) => byId[b.id]);
  shown
    .filter((b) => b.side === "right")
    .forEach((b) => $("grid-right").appendChild(card(b)));
  shown
    .filter((b) => b.side === "left")
    .forEach((b) => $("grid-left").appendChild(card(b)));
  status.textContent =
    "Mute six-second takes. King from behind, piece receiving. Click a still.";
  $("status-line").textContent =
    shown.length + " mute beds. Overlay a soundbite later.";

  window.__orders = {
    beds,
    play: (id) => {
      const bed = beds.find((b) => b.id === id);
      if (bed) playBed(bed);
      return !!bed;
    },
    cine: () => ({
      hidden: $("cine").hidden,
      line: $("cine-line").textContent,
      stamp: $("cine-stamp").textContent,
      muted: $("cine-video").muted,
      src: $("cine-video").currentSrc || $("cine-video").src || "",
    }),
    skip: closeCine,
  };
}

$("cine-skip").addEventListener("click", (e) => {
  e.stopPropagation();
  closeCine();
});
$("cine").addEventListener("click", (e) => {
  if (e.target.id === "cine" || e.target.id === "cine-video") closeCine();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeCine();
});

boot();
