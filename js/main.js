import { createBoard3D } from "./board3d.js";
import { clipFor, playCinematic, cancelCinematic, isPlaying } from "./cinematic.js";
import { createEngine } from "./engine.js";
import { playClip, playBark, stopClip, isMuted, setMuted, unlockFx } from "./fx.js";
import { tauntFor, tauntHoldMs } from "./taunts.js";
import { barkFor, linesFor } from "./barks.js";
import { lastWordFor, fateKicker, loseReelFor } from "./last-words.js";
import { orderFor, kingOrderFor } from "./orders.js";

const Chess = window.Chess;
const Roster = window.Roster;
const $ = (id) => document.getElementById(id);

function showFileHintIfNeeded() {
  if (location.protocol !== "file:") return false;
  const el = $("file-hint");
  if (el) el.hidden = false;
  return true;
}

function renderCaptured(game) {
  const left = $("captured-left");
  const right = $("captured-right");
  left.innerHTML = "";
  right.innerHTML = "";
  game.history.forEach((h) => {
    if (!h.captured) return;
    const img = document.createElement("img");
    const e = Roster.entryFor(h.captured);
    img.src = e.portrait;
    img.alt = e.name;
    img.title = e.name;
    if (h.captured.c === "b") right.appendChild(img);
    else left.appendChild(img);
  });
}

function renderTicker(game) {
  const el = $("ticker");
  if (!game.history.length) {
    el.textContent = "The floor is open. White to move — Trump's house.";
    return;
  }
  const bits = game.history.map((h, i) => {
    const n = Math.floor(i / 2) + 1;
    return i % 2 === 0 ? n + ". " + h.san : h.san;
  });
  el.textContent = bits.join("   ·   ");
}

function renderStatus(game) {
  const st = Chess.status(game);
  const pill = $("turn-pill");
  const line = $("status-line");
  if (st.result === "checkmate") {
    const winner = st.winner === "w" ? Roster.ROSTER.w : Roster.ROSTER.b;
    pill.textContent = "Checkmate";
    pill.dataset.side = st.winner === "w" ? "right" : "left";
    line.textContent = winner.house + " takes the chamber. " + winner.kingName + " remains standing.";
    $("result-card").hidden = false;
    $("result-title").textContent = winner.house + " wins";
    $("result-body").textContent =
      winner.kingName + " delivers mate. The other caucus has no legal reply.";
    return;
  }
  if (st.result === "stalemate") {
    pill.textContent = "Stalemate";
    pill.dataset.side = "";
    line.textContent = "No legal move. The session adjourns drawn.";
    $("result-card").hidden = false;
    $("result-title").textContent = "Drawn session";
    $("result-body").textContent = "Stalemate — the king is safe, but the caucus is frozen.";
    return;
  }
  const side = st.turn === "w" ? Roster.ROSTER.w : Roster.ROSTER.b;
  pill.textContent = side.house;
  pill.dataset.side = side.side;
  line.textContent = st.inCheck
    ? side.kingName + " is in check."
    : side.kingName + " to move. " + side.slogan + ".";
  $("result-card").hidden = true;
}

function refreshHud(game) {
  renderStatus(game);
  renderTicker(game);
  renderCaptured(game);
}

function renderMini(game, selected) {
  const root = $("miniboard");
  if (!root) return;
  root.innerHTML = "";
  for (let rank = 7; rank >= 0; rank--) {
    for (let file = 0; file < 8; file++) {
      const sq = Chess.sq(file, rank);
      const cell = document.createElement("button");
      cell.type = "button";
      cell.dataset.lite = (file + rank) % 2 === 1 ? "1" : "0";
      cell.dataset.on = selected === sq ? "1" : "0";
      cell.dataset.file = String(file);
      cell.dataset.rank = String(rank);
      const p = game.board[sq];
      if (p) {
        const e = Roster.entryFor(p, file);
        const img = document.createElement("img");
        img.src = "assets/ui/staunton/" + p.c + p.t.toUpperCase() + ".svg";
        img.alt = e.name;
        img.title = e.name;
        cell.appendChild(img);
      }
      root.appendChild(cell);
    }
  }
}

function boot() {
  if (showFileHintIfNeeded()) return;

  // Tap-to-enter gate for mobile audio unlock
  const tapGate = $("tap-gate");
  const isMobile = window.matchMedia("(max-width: 860px)").matches;
  if (tapGate && isMobile) {
    tapGate.hidden = false;
    tapGate.addEventListener("click", () => {
      unlockFx();
      tapGate.hidden = true;
    }, { once: true });
  }

  const canvas = $("stage");
  const board = createBoard3D(canvas);
  let game = Roster.stamp(Chess.createGame());
  let selected = null;
  let legal = [];
  let inspecting = false;
  let locked = false;
  let cpuBusy = false;
  let cpuGen = 0;
  const engine = createEngine();

  function decorateMoves(moves) {
    return moves.map((m) => {
      const occ = game.board[m.to];
      return Object.assign({}, m, { capturedHint: !!(occ || m.ep) });
    });
  }

  function legalFor(from) {
    return decorateMoves(Chess.legalMovesFrom(game, from));
  }

  function previewFor(from) {
    return decorateMoves(Chess.previewMoves(game, from));
  }

  function canPlay(from) {
    const p = game.board[from];
    return !!(p && p.c === game.turn);
  }

  function isLegalDest(from, to) {
    return legalFor(from).some((m) => m.to === to);
  }

  function showCard(sq) {
    const tip = $("hover-card");
    if (sq == null || !game.board[sq]) {
      tip.hidden = true;
      return;
    }
    const p = game.board[sq];
    const e = Roster.entryFor(p, Chess.fileOf(sq));
    $("hover-img").src = e.portrait;
    $("hover-name").textContent = e.name;
    $("hover-role").textContent = (e.aka ? e.aka + " · " : "") + e.role + " · " + Roster.ROSTER[p.c].house;
    const n = linesFor(e.id).length;
    const barkEl = $("hover-bark");
    if (barkEl) {
      barkEl.textContent = n
        ? n === 1
          ? "1 click bark"
          : n + " click barks"
        : "No click bark yet";
    }
    $("hover-note").textContent = inspecting
      ? "Scouting — their options, not your move"
      : "Click a lit square to move";
    tip.hidden = false;
    tip.dataset.inspect = inspecting ? "1" : "0";
    tip.dataset.bark = n ? "has" : "none";
    tip.dataset.role = e.role.toLowerCase();
  }

  function paint() {
    const last = game.history.length
      ? game.history[game.history.length - 1]
      : null;
    board.setHighlights(selected, legal, last, inspecting);
    refreshHud(game);
    renderMini(game, selected);
    showCard(selected);
  }

  function selectPiece(sq) {
    const p = game.board[sq];
    selected = sq;
    inspecting = p.c !== game.turn;
    legal = inspecting ? previewFor(sq) : legalFor(sq);
    const bark = barkFor(p.id);
    if (bark) playBark(bark.src);
    paint();
  }

  function clearSelect() {
    selected = null;
    legal = [];
    inspecting = false;
    paint();
  }

  function rebuild() {
    board.rebuildPieces(game);
    clearSelect();
  }

  function askPromo(from, to, choices) {
    return new Promise((resolve) => {
      const modal = $("promo");
      const row = $("promo-choices");
      row.innerHTML = "";
      modal.hidden = false;
      choices.forEach((mv) => {
        const e = Roster.entry(game.turn, mv.promo, Chess.fileOf(to));
        const btn = document.createElement("button");
        btn.type = "button";
        btn.innerHTML =
          "<img src=\"" +
          e.portrait +
          "\" alt=\"\">" +
          "<span>" +
          e.role +
          "</span><small>" +
          e.name +
          "</small>";
        btn.addEventListener("click", () => {
          modal.hidden = true;
          resolve(mv);
        });
        row.appendChild(btn);
      });
    });
  }

  async function tryMove(from, to, promo) {
    const matches = Chess.legalMovesFrom(game, from).filter((m) => m.to === to);
    if (!matches.length) return false;
    let chosen = matches[0];
    if (matches.length > 1 && matches.some((m) => m.promo)) {
      chosen = promo
        ? matches.find((m) => m.promo === promo) || matches[0]
        : await askPromo(from, to, matches);
    }
    const attacker = game.board[chosen.from];
    const victimSq = chosen.ep
      ? Chess.sq(Chess.fileOf(chosen.to), Chess.rankOf(chosen.from))
      : chosen.to;
    const victim = game.board[victimSq];
    let clip = clipFor(attacker, victim);
    // King orders for non-pawn captures
    const order = victim && attacker.t !== "p" ? kingOrderFor(attacker.c, victim.id) : null;
    if (order) {
      if (clip) {
        clip = Object.assign({}, clip, { audio: order.src });
        if (!clip.line) clip.line = order.line;
      } else {
        // Play order even without cinematic
        playClip(order.src);
      }
    }
    const before = { from: chosen.from, to: chosen.to };
    const r = Chess.makeMove(game, chosen);
    if (!r.ok) return false;
    if (chosen.promo) Roster.stampPromo(game.board[chosen.to], Chess.fileOf(chosen.to));
    selected = null;
    legal = [];
    inspecting = false;
    board.setHighlights(null, [], r.move);
    refreshHud(game);
    renderMini(game, null);
    const capSq = r.captured
      ? r.move.ep
        ? Chess.sq(Chess.fileOf(r.move.to), Chess.rankOf(r.move.from))
        : r.move.to
      : null;
    const st = Chess.status(game);
    const tauntKind =
      st.result === "checkmate"
        ? "mate"
        : st.inCheck
          ? "check"
          : r.captured && r.captured.t !== "p"
            ? "capture"
            : null;
    const taunt = tauntKind ? tauntFor(tauntKind, attacker.c) : null;
    const victimEntry = r.captured ? Roster.entryFor(r.captured) : null;
    const lastWord =
      r.captured && r.captured.t !== "p" && victimEntry
        ? lastWordFor(victimEntry.id, { reel: true })
        : null;
    const lose = victimEntry ? loseReelFor(victimEntry.id) : null;
    if (!clip && lose) {
      clip = {
        src: lose.src,
        poster: lose.poster || "",
        line: lastWord ? lastWord.line : "",
        audio: lose.baked ? null : lastWord && lastWord.src,
        side: r.captured.c === "w" ? "right" : "left",
        stamp: fateKicker(lastWord && lastWord.fate),
      };
    } else if (!clip && lastWord && lastWord.reel) {
      clip = {
        src: lastWord.reel,
        poster: lastWord.poster || "",
        line: lastWord.line,
        side: r.captured.c === "w" ? "right" : "left",
        stamp: fateKicker(lastWord.fate),
      };
    }
    locked = true;
    try {
      const animDone = new Promise((res) =>
        board.animateMove(
          {
            from: before.from,
            to: before.to,
            captureSquare: capSq,
          },
          res
        )
      );
      await Promise.all([animDone, clip ? playCinematic(clip) : Promise.resolve()]);
      board.rebuildPieces(game);
      paint();
      if (!clip) {
        if (lastWord) announceLastWord(lastWord, victimEntry);
        else if (taunt) announceTaunt(tauntKind, taunt);
      }
    } finally {
      locked = false;
    }
    scheduleCpu();
    return true;
  }

  board.onPick((file, rank) => {
    if (game.result || board.busy() || locked || cpuBusy || isPlaying()) return;
    if (cpuColor() && game.turn === cpuColor()) return;
    const sq = Chess.sq(file, rank);
    const piece = game.board[sq];
    if (selected != null && !inspecting && canPlay(selected) && isLegalDest(selected, sq)) {
      tryMove(selected, sq);
      return;
    }
    if (piece) {
      if (selected === sq) {
        clearSelect();
        return;
      }
      selectPiece(sq);
      return;
    }
    clearSelect();
  });

  let tauntTimer = 0;
  function announceTaunt(kind, taunt) {
    playClip(taunt.src);
    const box = $("taunt");
    $("taunt-kicker").textContent =
      kind === "mate" ? "Checkmate" : kind === "capture" ? "Taken" : "Check";
    $("taunt-who").textContent = taunt.who;
    $("taunt-line").textContent = taunt.line;
    box.hidden = false;
    clearTimeout(tauntTimer);
    tauntTimer = setTimeout(() => {
      box.hidden = true;
    }, tauntHoldMs(kind));
  }

  function announceLastWord(word, entry) {
    playClip(word.src);
    const box = $("taunt");
    $("taunt-kicker").textContent = fateKicker(word.fate);
    $("taunt-who").textContent = entry && entry.name ? entry.name : "Taken";
    $("taunt-line").textContent = word.line;
    box.hidden = false;
    clearTimeout(tauntTimer);
    tauntTimer = setTimeout(() => {
      box.hidden = true;
    }, tauntHoldMs("capture"));
  }

  function cpuColor() {
    const mode = $("opp-mode").value;
    if (mode === "cpu-b") return "b";
    if (mode === "cpu-w") return "w";
    return null;
  }

  function cpuLevel() {
    return Number($("opp-level").value) || 10;
  }

  function paintOpp() {
    $("opp-level-wrap").hidden = !$("opp-mode").value.startsWith("cpu");
  }

  function scheduleCpu() {
    const color = cpuColor();
    if (!color || game.result || cpuBusy || locked || isPlaying()) return;
    if (game.turn !== color) return;
    runCpu();
  }

  async function runCpu() {
    const my = ++cpuGen;
    cpuBusy = true;
    const house = game.turn === "w" ? "The Right" : "The Left";
    $("status-line").textContent = house + " is thinking…";
    try {
      await engine.ready();
      if (my !== cpuGen) return;
      const mv = await engine.go(Chess.toFen(game), cpuLevel());
      if (my !== cpuGen || !mv) return;
      const from = Chess.parseSquare(mv.from);
      const to = Chess.parseSquare(mv.to);
      if (from < 0 || to < 0) return;
      await tryMove(from, to, mv.promo);
    } catch (err) {
      if (my === cpuGen) {
        $("status-line").textContent = "Engine failed. Try Two humans, or refresh.";
        console.warn(err);
      }
    } finally {
      if (my === cpuGen) cpuBusy = false;
    }
  }

  function newSession() {
    cancelCinematic();
    stopClip();
    locked = false;
    cpuBusy = false;
    cpuGen += 1;
    engine.stop();
    $("taunt").hidden = true;
    game = Roster.stamp(Chess.createGame());
    rebuild();
    scheduleCpu();
  }

  const MINI_KEY = "floor-vote-mini-size";
  const wrap = $("miniboard-wrap");
  function setMiniSize(size) {
    wrap.dataset.size = size === "sm" ? "sm" : "lg";
    $("miniboard-size").textContent = wrap.dataset.size === "lg" ? "Smaller" : "Bigger";
    try {
      localStorage.setItem(MINI_KEY, wrap.dataset.size);
    } catch (_) {}
  }
  try {
    const saved = localStorage.getItem(MINI_KEY);
    setMiniSize(saved === "lg" ? "lg" : "sm");
  } catch (_) {
    setMiniSize("sm");
  }
  $("miniboard-size").addEventListener("click", (e) => {
    e.stopPropagation();
    setMiniSize(wrap.dataset.size === "lg" ? "sm" : "lg");
  });

  const CARD_KEY = "floor-vote-card-size";
  const cardEl = $("hover-card");
  function setCardSize(size) {
    cardEl.dataset.size = size === "sm" ? "sm" : "lg";
    $("hover-size").textContent = cardEl.dataset.size === "lg" ? "Smaller" : "Bigger";
    try {
      localStorage.setItem(CARD_KEY, cardEl.dataset.size);
    } catch (_) {}
  }
  try {
    const savedCard = localStorage.getItem(CARD_KEY);
    setCardSize(savedCard === "sm" ? "sm" : "lg");
  } catch (_) {
    setCardSize("lg");
  }
  $("hover-size").addEventListener("click", (e) => {
    e.stopPropagation();
    setCardSize(cardEl.dataset.size === "lg" ? "sm" : "lg");
  });

  $("miniboard").addEventListener("click", (e) => {
    const cell = e.target.closest("button");
    if (!cell || locked || cpuBusy) return;
    if (cpuColor() && game.turn === cpuColor()) return;
    const file = Number(cell.dataset.file);
    const rank = Number(cell.dataset.rank);
    if (!Number.isFinite(file) || !Number.isFinite(rank)) return;
    const sq = Chess.sq(file, rank);
    const piece = game.board[sq];
    if (selected != null && !inspecting && canPlay(selected) && isLegalDest(selected, sq)) {
      tryMove(selected, sq);
      return;
    }
    if (piece) {
      if (selected === sq) {
        clearSelect();
        return;
      }
      selectPiece(sq);
      return;
    }
    clearSelect();
  });

  $("opp-mode").addEventListener("change", () => {
    paintOpp();
    scheduleCpu();
  });
  $("opp-level").addEventListener("change", () => {
    if (cpuBusy) {
      cpuGen += 1;
      engine.stop();
      cpuBusy = false;
    }
    scheduleCpu();
  });
  paintOpp();

  function paintSound() {
    $("btn-sound").textContent = isMuted() ? "Sound off" : "Sound on";
  }
  paintSound();
  $("btn-sound").addEventListener("click", () => {
    setMuted(!isMuted());
    paintSound();
  });

  $("btn-new").addEventListener("click", newSession);
  $("btn-again").addEventListener("click", newSession);
  $("btn-flip").addEventListener("click", () => board.flipView());
  $("cine-skip").addEventListener("click", (e) => {
    e.stopPropagation();
    cancelCinematic();
  });
  $("cine").addEventListener("click", (e) => {
    if (e.target.id === "cine" || e.target.id === "cine-video") cancelCinematic();
  });

  window.__floor = {
    play: (a, b, promo) => {
      const r = Chess.play(game, a, b, promo);
      if (r.ok) {
        if (promo) Roster.stampPromo(game.board[r.move.to], Chess.fileOf(r.move.to));
        board.rebuildPieces(game);
      }
      paint();
      return r;
    },
    playLive: (a, b) => {
      const from = Chess.parseSquare(a);
      const to = Chess.parseSquare(b);
      return tryMove(from, to);
    },
    pick: (file, rank) => {
      const sq = Chess.sq(file, rank);
      const piece = game.board[sq];
      if (!piece) return { selected: false };
      selectPiece(sq);
      return { selected: true, legal: legal.length, inspect: inspecting };
    },
    status: () => Chess.status(game),
    history: () => game.history.slice(),
    cine: () => ({
      hidden: $("cine").hidden,
      line: $("cine-line").textContent,
      side: $("cine").dataset.side || "",
      stamp: ($("cine-stamp") && $("cine-stamp").textContent) || "",
      src: $("cine-video").currentSrc || $("cine-video").src || "",
    }),
    clipFor,
    playCine: (clip) => playCinematic(clip),
    taunt: () => ({
      hidden: $("taunt").hidden,
      kicker: $("taunt-kicker").textContent,
      who: $("taunt-who").textContent,
      line: $("taunt-line").textContent,
    }),
    skipCine: () => cancelCinematic(),
    ready: () => board.isReady(),
    cam: () => board.cameraPos(),
    fen: () => Chess.toFen(game),
    opp: () => ({ mode: $("opp-mode").value, level: cpuLevel() }),
    mini: () =>
      [...$("miniboard").querySelectorAll("button")].map((cell) => ({
        file: Number(cell.dataset.file),
        rank: Number(cell.dataset.rank),
        on: cell.dataset.on,
        piece: cell.querySelector("img") ? cell.querySelector("img").alt : "",
      })),
    card: () => ({
      hidden: $("hover-card").hidden,
      size: $("hover-card").dataset.size,
      name: $("hover-name").textContent,
      role: $("hover-role").textContent,
      btn: $("hover-size").textContent,
    }),
  };

  board.readyPromise.then(rebuild);
  refreshHud(game);
}

boot();
