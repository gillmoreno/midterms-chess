/** Pawn kill reels. Named-piece deaths use defeated beds in last-words.js. Overlay only — the board camera never moves. */

const CLIPS = {
  w: {
    src: "https://assets.chess.the-idea-guy.com/cinematics/right-kills-v3.mp4",
    poster: "https://assets.chess.the-idea-guy.com/cinematics/right-kills-v3.jpg",
    line: "You're pronouns are: You, dead!",
    side: "right",
  },
  b: {
    src: "https://assets.chess.the-idea-guy.com/cinematics/left-kills-v2.mp4",
    poster: "https://assets.chess.the-idea-guy.com/cinematics/left-kills-v2.jpg",
    line: "I am aborting you now!",
    side: "left",
  },
  leftQueen: {
    src: "assets/cinematics/left-queen-kills.mp4",
    poster: "assets/cinematics/left-queen-kills.jpg",
    line: "This will go viral, you are not",
    side: "left",
  },
  rfk: {
    src: "assets/cinematics/rfk-kills.mp4",
    poster: "assets/cinematics/rfk-kills.jpg",
    line: "I'll get rid of seed oils, and you",
    side: "right",
  },
};

let active = null;

export function clipFor(attacker, victim) {
  if (!attacker || !victim) return null;
  if (attacker.t === "q" && attacker.c === "b" && victim.t === "p" && victim.c === "w") {
    return CLIPS.leftQueen;
  }
  if (attacker.id === "rfk" && victim.t === "p" && victim.c === "b") {
    return CLIPS.rfk;
  }
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

    const stamp = root.querySelector(".cine-stamp");
    let overlay = null;
    const cues = Array.isArray(clip.lines) && clip.lines.length
      ? clip.lines.slice().sort((a, b) => a.at - b.at)
      : clip.line
        ? [{ at: 0, text: clip.line }]
        : [];

    const syncLine = () => {
      if (!line || !cues.length) return;
      const t = video.currentTime || 0;
      let text = cues[0].text;
      for (let i = 0; i < cues.length; i++) {
        if (cues[i].at <= t) text = cues[i].text;
      }
      line.textContent = text;
    };

    let skipTimer = 0;
    const finish = () => {
      if (!active || active.done) return;
      active.done = true;
      clearTimeout(skipTimer);
      video.pause();
      video.removeAttribute("src");
      video.load();
      if (overlay) {
        overlay.pause();
        overlay.removeAttribute("src");
        overlay = null;
      }
      root.hidden = true;
      root.removeAttribute("data-side");
      document.removeEventListener("keydown", onKey);
      root.removeEventListener("pointerdown", onTap);
      root.removeEventListener("click", onTap);
      video.removeEventListener("timeupdate", syncLine);
      video.onended = null;
      video.onerror = null;
      if (line) line.textContent = "";
      if (stamp) stamp.textContent = "Kill cam";
      active = null;
      resolve();
    };

    const onKey = (e) => {
      if (e.repeat) return;
      if (e.key === "Escape" || e.key === " " || e.key === "Enter") {
        e.preventDefault();
        finish();
      }
    };

    const onTap = (e) => {
      e.preventDefault();
      finish();
    };

    active = { finish, done: false };
    if (stamp) stamp.textContent = clip.stamp || "Kill cam";
    syncLine();
    root.dataset.side = clip.side || "left";
    video.poster = clip.poster || "";
    video.muted = true;
    root.hidden = false;
    root.removeAttribute("hidden");

    video.addEventListener("timeupdate", syncLine);
    video.onended = () => {
      if (video.currentTime > 0.25) finish();
    };
    video.onerror = () => {};
    
    // Wire skip immediately for mobile
    document.addEventListener("keydown", onKey);
    root.addEventListener("pointerdown", onTap);
    root.addEventListener("click", onTap);

    video.src = clip.src;
    const kick = () => {
      const play = video.play();
      if (play && play.then) {
        play.then(() => {
          if (!clip.audio) video.muted = false;
        }).catch(() => {});
      }
    };
    if (video.readyState >= 1) kick();
    else video.addEventListener("loadedmetadata", kick, { once: true });

    if (clip.audio) {
      overlay = new Audio(clip.audio);
      overlay.volume = 0.9;
      const ov = overlay.play();
      if (ov && ov.catch) ov.catch(() => {});
    }
  });
}
