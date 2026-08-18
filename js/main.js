import { createBoard3D } from "./board3d.js";

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

function boot() {
  if (showFileHintIfNeeded()) return;

  const canvas = $("stage");
  const board = createBoard3D(canvas);
  let game = Roster.stamp(Chess.createGame());
  let selected = null;
  let legal = [];

  function legalFor(from) {
    return Chess.legalMovesFrom(game, from).map((m) => {
      const occ = game.board[m.to];
      return Object.assign({}, m, { capturedHint: !!(occ || m.ep) });
    });
  }

  function paint() {
    const last = game.history.length
      ? game.history[game.history.length - 1]
      : null;
    board.setHighlights(selected, legal, last);
    refreshHud(game);
    const tip = $("hover-card");
    if (selected == null || !game.board[selected]) {
      tip.hidden = true;
    } else {
      const p = game.board[selected];
      const e = Roster.entryFor(p, Chess.fileOf(selected));
      $("hover-img").src = e.portrait;
      $("hover-name").textContent = e.name;
      $("hover-role").textContent = e.role + " · " + Roster.ROSTER[p.c].house;
      tip.hidden = false;
    }
  }

  function rebuild() {
    board.rebuildPieces(game);
    selected = null;
    legal = [];
    paint();
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

  async function tryMove(from, to) {
    const matches = Chess.legalMovesFrom(game, from).filter((m) => m.to === to);
    if (!matches.length) return false;
    let chosen = matches[0];
    if (matches.length > 1 && matches.some((m) => m.promo)) {
      chosen = await askPromo(from, to, matches);
    }
    const before = { from: chosen.from, to: chosen.to };
    const r = Chess.makeMove(game, chosen);
    if (!r.ok) return false;
    if (chosen.promo) Roster.stampPromo(game.board[chosen.to], Chess.fileOf(chosen.to));
    selected = null;
    legal = [];
    board.setHighlights(null, [], r.move);
    await new Promise((res) => board.animateMove(before.from, before.to, res));
    board.rebuildPieces(game);
    paint();
    return true;
  }

  board.onPick((file, rank) => {
    if (game.result || board.busy()) return;
    const sq = Chess.sq(file, rank);
    const piece = game.board[sq];
    if (selected == null) {
      if (piece && piece.c === game.turn) {
        selected = sq;
        legal = legalFor(sq);
        paint();
      }
      return;
    }
    if (piece && piece.c === game.turn) {
      selected = sq;
      legal = legalFor(sq);
      paint();
      return;
    }
    tryMove(selected, sq).then((ok) => {
      if (!ok) {
        selected = null;
        legal = [];
        paint();
      }
    });
  });

  $("btn-new").addEventListener("click", () => {
    game = Roster.stamp(Chess.createGame());
    rebuild();
  });
  $("btn-again").addEventListener("click", () => {
    game = Roster.stamp(Chess.createGame());
    rebuild();
  });
  $("btn-flip").addEventListener("click", () => board.flipView());

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
    pick: (file, rank) => {
      const sq = Chess.sq(file, rank);
      const piece = game.board[sq];
      if (piece && piece.c === game.turn) {
        selected = sq;
        legal = legalFor(sq);
        paint();
        return { selected: true, legal: legal.length };
      }
      return { selected: false };
    },
    status: () => Chess.status(game),
    history: () => game.history.slice(),
  };

  board.readyPromise.then(rebuild);
  refreshHud(game);
}

boot();
