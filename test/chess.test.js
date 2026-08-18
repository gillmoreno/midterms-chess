/**
 * Unit tests for shipped chess rules.
 * node --test test/chess.test.js
 */
"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const Chess = require(path.join(__dirname, "..", "js", "chess.js"));

function dests(game, fromAlg) {
  const from = Chess.parseSquare(fromAlg);
  return Chess.legalMovesFrom(game, from).map((m) => {
    const s = Chess.algebraic(m.to);
    return m.promo ? s + m.promo : s;
  });
}

describe("starting position", () => {
  it("places both kings on their home squares", () => {
    const g = Chess.createGame();
    const wk = Chess.pieceAt(g, "e1");
    const bk = Chess.pieceAt(g, "e8");
    assert.ok(wk && wk.t === "k" && wk.c === "w");
    assert.ok(bk && bk.t === "k" && bk.c === "b");
  });

  it("white has exactly 20 legal opening moves", () => {
    const g = Chess.createGame();
    assert.equal(Chess.allLegalMoves(g).length, 20);
  });

  it("white pawns can step one or two; knights jump", () => {
    const g = Chess.createGame();
    const e = dests(g, "e2").sort();
    assert.deepEqual(e, ["e3", "e4"]);
    const n = dests(g, "b1").sort();
    assert.deepEqual(n, ["a3", "c3"]);
  });

  it("blocked pieces have no leap through their own pawns", () => {
    const g = Chess.createGame();
    assert.deepEqual(dests(g, "a1"), []);
    assert.deepEqual(dests(g, "c1"), []);
    assert.deepEqual(dests(g, "d1"), []);
  });
});

describe("turns and captures", () => {
  it("rejects a black move on white's turn", () => {
    const g = Chess.createGame();
    const r = Chess.play(g, "e7", "e5");
    assert.equal(r.ok, false);
    assert.equal(Chess.pieceAt(g, "e7").t, "p");
  });

  it("alternates turns after a legal pawn advance", () => {
    const g = Chess.createGame();
    const r = Chess.play(g, "e2", "e4");
    assert.equal(r.ok, true);
    assert.equal(g.turn, "b");
    assert.equal(Chess.pieceAt(g, "e4").t, "p");
    assert.equal(Chess.pieceAt(g, "e2"), null);
  });

  it("captures replace the occupant", () => {
    const g = Chess.createGame();
    Chess.play(g, "e2", "e4");
    Chess.play(g, "d7", "d5");
    const r = Chess.play(g, "e4", "d5");
    assert.equal(r.ok, true);
    assert.ok(r.captured && r.captured.t === "p" && r.captured.c === "b");
    assert.equal(Chess.pieceAt(g, "d5").c, "w");
  });
});

describe("check and mate", () => {
  it("a back-rank queen checkmate ends the game", () => {
    const g = Chess.createGame();
    for (let i = 0; i < 64; i++) g.board[i] = null;
    g.board[Chess.parseSquare("g1")] = { t: "k", c: "w" };
    g.board[Chess.parseSquare("g2")] = { t: "p", c: "w" };
    g.board[Chess.parseSquare("h2")] = { t: "p", c: "w" };
    g.board[Chess.parseSquare("f2")] = { t: "p", c: "w" };
    g.board[Chess.parseSquare("g8")] = { t: "k", c: "b" };
    g.board[Chess.parseSquare("f7")] = { t: "p", c: "b" };
    g.board[Chess.parseSquare("g7")] = { t: "p", c: "b" };
    g.board[Chess.parseSquare("h7")] = { t: "p", c: "b" };
    g.board[Chess.parseSquare("a1")] = { t: "q", c: "w" };
    g.turn = "w";
    g.castling = { wK: false, wQ: false, bK: false, bQ: false };
    g.ep = null;
    const r = Chess.play(g, "a1", "a8");
    assert.equal(r.ok, true);
    assert.equal(g.result, "checkmate");
    assert.equal(g.winner, "w");
    assert.equal(Chess.allLegalMoves(g).length, 0);
    assert.match(r.san, /#/);
  });

  it("a piece pinned to its king cannot step off the pin line", () => {
    const g = Chess.createGame();
    for (let i = 0; i < 64; i++) g.board[i] = null;
    g.board[Chess.parseSquare("e1")] = { t: "k", c: "w" };
    g.board[Chess.parseSquare("e2")] = { t: "n", c: "w" };
    g.board[Chess.parseSquare("e8")] = { t: "r", c: "b" };
    g.board[Chess.parseSquare("a8")] = { t: "k", c: "b" };
    g.turn = "w";
    g.castling = { wK: false, wQ: false, bK: false, bQ: false };
    g.ep = null;
    const nMoves = dests(g, "e2");
    assert.ok(
      nMoves.every((s) => s[0] === "e"),
      "pinned knight may only stay on the e-file, got " + nMoves.join(",")
    );
    assert.ok(!nMoves.includes("d4") && !nMoves.includes("f4"));
  });

  it("fools mate is checkmate for black on move 2", () => {
    const g = Chess.createGame();
    assert.ok(Chess.play(g, "f2", "f3").ok);
    assert.ok(Chess.play(g, "e7", "e5").ok);
    assert.ok(Chess.play(g, "g2", "g4").ok);
    const r = Chess.play(g, "d8", "h4");
    assert.equal(r.ok, true);
    assert.equal(g.result, "checkmate");
    assert.equal(g.winner, "b");
  });
});

describe("castling", () => {
  function clearForCastle(side) {
    const g = Chess.createGame();
    if (side === "whiteK") {
      Chess.play(g, "g1", "f3");
      Chess.play(g, "g8", "f6");
      Chess.play(g, "e2", "e3");
      Chess.play(g, "e7", "e6");
      Chess.play(g, "f1", "e2");
      Chess.play(g, "f8", "e7");
    }
    return g;
  }

  it("white can castle kingside when the path is clear", () => {
    const g = clearForCastle("whiteK");
    const r = Chess.play(g, "e1", "g1");
    assert.equal(r.ok, true);
    assert.equal(Chess.pieceAt(g, "g1").t, "k");
    assert.equal(Chess.pieceAt(g, "f1").t, "r");
    assert.equal(Chess.pieceAt(g, "h1"), null);
    assert.equal(r.san, "O-O");
  });

  it("cannot castle after the king has moved", () => {
    const g = clearForCastle("whiteK");
    Chess.play(g, "e1", "f1");
    Chess.play(g, "b8", "c6");
    Chess.play(g, "f1", "e1");
    Chess.play(g, "c6", "b8");
    const r = Chess.play(g, "e1", "g1");
    assert.equal(r.ok, false);
  });

  it("cannot castle through check", () => {
    const g = Chess.createGame();
    for (let i = 0; i < 64; i++) g.board[i] = null;
    g.board[Chess.parseSquare("e1")] = { t: "k", c: "w" };
    g.board[Chess.parseSquare("h1")] = { t: "r", c: "w" };
    g.board[Chess.parseSquare("e8")] = { t: "k", c: "b" };
    g.board[Chess.parseSquare("a6")] = { t: "q", c: "b" };
    g.turn = "w";
    g.castling = { wK: true, wQ: false, bK: false, bQ: false };
    g.ep = null;
    assert.ok(!dests(g, "e1").includes("g1"));
    assert.ok(dests(g, "e1").includes("d1") || dests(g, "e1").includes("d2") || dests(g, "e1").includes("f1"));
  });
});

describe("en passant", () => {
  it("a pawn that double-stepped can be captured en passant next move only", () => {
    const g = Chess.createGame();
    Chess.play(g, "e2", "e4");
    Chess.play(g, "a7", "a6");
    Chess.play(g, "e4", "e5");
    Chess.play(g, "d7", "d5");
    const r = Chess.play(g, "e5", "d6");
    assert.equal(r.ok, true);
    assert.ok(r.captured && r.captured.t === "p");
    assert.equal(Chess.pieceAt(g, "d5"), null);
    assert.equal(Chess.pieceAt(g, "d6").c, "w");
  });

  it("en passant expires if not taken immediately", () => {
    const g = Chess.createGame();
    Chess.play(g, "e2", "e4");
    Chess.play(g, "a7", "a6");
    Chess.play(g, "e4", "e5");
    Chess.play(g, "d7", "d5");
    Chess.play(g, "g1", "f3");
    Chess.play(g, "a6", "a5");
    const r = Chess.play(g, "e5", "d6");
    assert.equal(r.ok, false);
    assert.ok(Chess.pieceAt(g, "d5"));
  });
});

describe("promotion", () => {
  function promoSetup() {
    const g = Chess.createGame();
    for (let i = 0; i < 64; i++) g.board[i] = null;
    g.board[Chess.parseSquare("e1")] = { t: "k", c: "w" };
    g.board[Chess.parseSquare("e8")] = { t: "k", c: "b" };
    g.board[Chess.parseSquare("a7")] = { t: "p", c: "w" };
    g.turn = "w";
    g.castling = { wK: false, wQ: false, bK: false, bQ: false };
    g.ep = null;
    return g;
  }

  it("a pawn reaching the 8th rank becomes the chosen piece", () => {
    const g = promoSetup();
    const r = Chess.play(g, "a7", "a8", "q");
    assert.equal(r.ok, true);
    const q = Chess.pieceAt(g, "a8");
    assert.ok(q && q.t === "q" && q.c === "w");
    assert.match(r.san, /=Q/);
  });

  it("promotion to knight is legal when specified", () => {
    const g = promoSetup();
    const r = Chess.play(g, "a7", "a8", "n");
    assert.equal(r.ok, true);
    assert.equal(Chess.pieceAt(g, "a8").t, "n");
  });
});

describe("stalemate", () => {
  it("no legal moves and not in check is stalemate", () => {
    const g = Chess.createGame();
    // Clear the board and place a known stalemate: white king a1, white queen c2? 
    // Classic: black king a8, white king a6, white queen c7 — black to move, stalemate.
    for (let i = 0; i < 64; i++) g.board[i] = null;
    g.board[Chess.parseSquare("a8")] = { t: "k", c: "b" };
    g.board[Chess.parseSquare("a6")] = { t: "k", c: "w" };
    g.board[Chess.parseSquare("c7")] = { t: "q", c: "w" };
    g.turn = "b";
    g.castling = { wK: false, wQ: false, bK: false, bQ: false };
    g.ep = null;
    // Trigger result by a dummy white move that doesn't change this? Result is computed after makeMove.
    // Call allLegalMoves + inCheck to assert the condition, then play a waiting move from a clone
    // by giving white the turn first and making a queen shuffle that preserves stalemate.
    assert.equal(Chess.allLegalMoves(g).length, 0);
    assert.equal(Chess.inCheck(g, "b"), false);
    // Apply a null-effect through makeMove from white after flipping:
    g.turn = "w";
    const r = Chess.play(g, "c7", "c8");
    // After Qc8, black may or may not be stalemated. Use Qa7-c7 style.
    // Reset: white to move queen from b7 to c7, leaving the classic mate-net.
    const g2 = Chess.createGame();
    for (let i = 0; i < 64; i++) g2.board[i] = null;
    g2.board[Chess.parseSquare("a8")] = { t: "k", c: "b" };
    g2.board[Chess.parseSquare("a6")] = { t: "k", c: "w" };
    g2.board[Chess.parseSquare("b7")] = { t: "q", c: "w" };
    g2.turn = "w";
    g2.castling = { wK: false, wQ: false, bK: false, bQ: false };
    g2.ep = null;
    const r2 = Chess.play(g2, "b7", "c7");
    assert.equal(r2.ok, true);
    assert.equal(g2.result, "stalemate");
    assert.equal(g2.winner, null);
    assert.ok(r); // silence unused
  });
});
