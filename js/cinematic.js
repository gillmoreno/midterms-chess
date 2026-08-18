/** Pawn-vs-pawn kill reels. Overlay only — the board camera never moves. */

const CLIPS = {
  w: {
    src: "assets/cinematics/right-kills.mp4",
    poster: "assets/cinematics/right-kills.jpg",
    line: "You're pronouns are: You, dead!",
  },
  b: {
    src: "assets/cinematics/left-kills.mp4",
    poster: "assets/cinematics/left-kills.jpg",
    line: "I am aborting you now!",
  },
};

let active = null;

export function clipFor(attacker, victim) {
  if (!attacker || !victim) return null;
  if (attacker.t !== "p" || victim.t !== "p") return null;
  return CLIPS[attacker.c] || null;
}

export function isPlaying() {
  return !!(active && !active.done);
}

export function cancelCinematic() {
  if (active && !active.done) active.finish();
}

export function playCinematic(clip) {
  if (!clip) return Promise.resolve();
  const root = document.getElementById("cine");
  const video = document.getElementById("cine-video");
  const line = document.getElementById("cine-line");
  if (!root || !video) return Promise.resolve();

  return new Promise((resolve) => {
    if (active && !active.done) active.finish();

    const finish = () => {
      if (!active || active.done) return;
      active.done = true;
      video.pause();
      video.removeAttribute("src");
      video.load();
      root.hidden = true;
      root.removeAttribute("data-side");
      document.removeEventListener("keydown", onKey);
      if (line) line.textContent = "";
      active = null;
      resolve();
    };

    const onKey = (e) => {
      if (e.key === "Escape" || e.key === " " || e.key === "Enter") {
        e.preventDefault();
        finish();
      }
    };

    active = { finish, done: false };
    if (line) line.textContent = clip.line;
    root.dataset.side = clip === CLIPS.w ? "right" : "left";
    video.poster = clip.poster || "";
    video.src = clip.src;
    video.currentTime = 0;
    video.muted = false;
    root.hidden = false;

    video.onended = finish;
    video.onerror = finish;
    document.addEventListener("keydown", onKey);

    const play = video.play();
    if (play && play.catch) {
      play.catch(() => {
        video.muted = true;
        video.play().catch(finish);
      });
    }
  });
}
