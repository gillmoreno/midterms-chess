/**
 * Pure chess rules. No DOM. Works in the browser and under Node.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  if (root) root.Chess = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var FILES = "abcdefgh";
  var WHITE = "w";
  var BLACK = "b";
  var BACK = ["r", "n", "b", "q", "k", "b", "n", "r"];

  var KNIGHT = [
    [1, 2],
    [2, 1],
    [-1, 2],
    [-2, 1],
    [1, -2],
    [2, -1],
    [-1, -2],
    [-2, -1],
  ];
  var KING = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];
  var BISHOP = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];
  var ROOK = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  function opp(c) {
    return c === WHITE ? BLACK : WHITE;
  }
  function sq(f, r) {
    return r * 8 + f;
  }
  function fileOf(i) {
    return i & 7;
  }
  function rankOf(i) {
    return i >> 3;
  }
  function onBoard(f, r) {
    return f >= 0 && f < 8 && r >= 0 && r < 8;
  }
  function alg(i) {
    return FILES[fileOf(i)] + String(rankOf(i) + 1);
  }
  function parseAlg(s) {
    if (!s || s.length < 2) return -1;
    var f = FILES.indexOf(s[0]);
    var r = parseInt(s[1], 10) - 1;
    return onBoard(f, r) ? sq(f, r) : -1;
  }

  function startingBoard() {
    var b = new Array(64);
    var i, f;
    for (i = 0; i < 64; i++) b[i] = null;
    for (f = 0; f < 8; f++) {
      b[sq(f, 0)] = { t: BACK[f], c: WHITE };
      b[sq(f, 1)] = { t: "p", c: WHITE };
      b[sq(f, 6)] = { t: "p", c: BLACK };
      b[sq(f, 7)] = { t: BACK[f], c: BLACK };
    }
    return b;
  }

  function clonePiece(p) {
    return p ? { t: p.t, c: p.c } : null;
  }

  function cloneBoard(board) {
    var out = new Array(64);
    for (var i = 0; i < 64; i++) out[i] = clonePiece(board[i]);
    return out;
  }

  function createGame() {
    return {
      board: startingBoard(),
      turn: WHITE,
      castling: { wK: true, wQ: true, bK: true, bQ: true },
      ep: null,
      halfmove: 0,
      fullmove: 1,
      history: [],
      result: null,
      winner: null,
    };
  }

  function cloneGame(g) {
    return {
      board: cloneBoard(g.board),
      turn: g.turn,
      castling: {
        wK: g.castling.wK,
        wQ: g.castling.wQ,
        bK: g.castling.bK,
        bQ: g.castling.bQ,
      },
      ep: g.ep,
      halfmove: g.halfmove,
      fullmove: g.fullmove,
      history: g.history.slice(),
      result: g.result,
      winner: g.winner,
    };
  }

  function kingIndex(board, color) {
    for (var i = 0; i < 64; i++) {
      var p = board[i];
      if (p && p.t === "k" && p.c === color) return i;
    }
    return -1;
  }

  function slide(board, from, dirs, color, out) {
    var f0 = fileOf(from);
    var r0 = rankOf(from);
    for (var d = 0; d < dirs.length; d++) {
      var f = f0 + dirs[d][0];
      var r = r0 + dirs[d][1];
      while (onBoard(f, r)) {
        var i = sq(f, r);
        var occ = board[i];
        if (!occ) out.push({ from: from, to: i });
        else {
          if (occ.c !== color) out.push({ from: from, to: i });
          break;
        }
        f += dirs[d][0];
        r += dirs[d][1];
      }
    }
  }

  function isSquareAttacked(board, target, byColor) {
    var tf = fileOf(target);
    var tr = rankOf(target);
    var f, r, p, k;

    var pdir = byColor === WHITE ? 1 : -1;
    for (k = 0; k < 2; k++) {
      f = tf + (k === 0 ? -1 : 1);
      r = tr - pdir;
      if (onBoard(f, r)) {
        p = board[sq(f, r)];
        if (p && p.t === "p" && p.c === byColor) return true;
      }
    }

    for (k = 0; k < KNIGHT.length; k++) {
      f = tf + KNIGHT[k][0];
      r = tr + KNIGHT[k][1];
      if (onBoard(f, r)) {
        p = board[sq(f, r)];
        if (p && p.t === "n" && p.c === byColor) return true;
      }
    }

    for (k = 0; k < KING.length; k++) {
      f = tf + KING[k][0];
      r = tr + KING[k][1];
      if (onBoard(f, r)) {
        p = board[sq(f, r)];
        if (p && p.t === "k" && p.c === byColor) return true;
      }
    }

    function rayHits(dirs, types) {
      for (var d = 0; d < dirs.length; d++) {
        f = tf + dirs[d][0];
        r = tr + dirs[d][1];
        while (onBoard(f, r)) {
          p = board[sq(f, r)];
          if (p) {
            if (p.c === byColor && types.indexOf(p.t) !== -1) return true;
            break;
          }
          f += dirs[d][0];
          r += dirs[d][1];
        }
      }
      return false;
    }

    return rayHits(BISHOP, "bq") || rayHits(ROOK, "rq");
  }

  function inCheck(game, color) {
    var k = kingIndex(game.board, color);
    if (k < 0) return false;
    return isSquareAttacked(game.board, k, opp(color));
  }

  function pushPawn(out, from, to, lastRank) {
    if (rankOf(to) === lastRank) {
      var ps = ["q", "r", "b", "n"];
      for (var i = 0; i < ps.length; i++) {
        out.push({ from: from, to: to, promo: ps[i] });
      }
    } else {
      out.push({ from: from, to: to });
    }
  }

  function pseudoMoves(game, from) {
    var board = game.board;
    var p = board[from];
    if (!p) return [];
    var color = p.c;
    var out = [];
    var f = fileOf(from);
    var r = rankOf(from);
    var i, nf, nr, occ;

    if (p.t === "p") {
      var dir = color === WHITE ? 1 : -1;
      var start = color === WHITE ? 1 : 6;
      var last = color === WHITE ? 7 : 0;
      nr = r + dir;
      if (onBoard(f, nr) && !board[sq(f, nr)]) {
        pushPawn(out, from, sq(f, nr), last);
        if (r === start && !board[sq(f, r + 2 * dir)]) {
          out.push({ from: from, to: sq(f, r + 2 * dir) });
        }
      }
      for (i = -1; i <= 1; i += 2) {
        nf = f + i;
        if (!onBoard(nf, nr)) continue;
        var to = sq(nf, nr);
        occ = board[to];
        if (occ && occ.c !== color) pushPawn(out, from, to, last);
        if (game.ep === to && !occ) out.push({ from: from, to: to, ep: true });
      }
      return out;
    }

    if (p.t === "n") {
      for (i = 0; i < KNIGHT.length; i++) {
        nf = f + KNIGHT[i][0];
        nr = r + KNIGHT[i][1];
        if (!onBoard(nf, nr)) continue;
        occ = board[sq(nf, nr)];
        if (!occ || occ.c !== color) out.push({ from: from, to: sq(nf, nr) });
      }
      return out;
    }

    if (p.t === "b") {
      slide(board, from, BISHOP, color, out);
      return out;
    }
    if (p.t === "r") {
      slide(board, from, ROOK, color, out);
      return out;
    }
    if (p.t === "q") {
      slide(board, from, BISHOP, color, out);
      slide(board, from, ROOK, color, out);
      return out;
    }

    if (p.t === "k") {
      for (i = 0; i < KING.length; i++) {
        nf = f + KING[i][0];
        nr = r + KING[i][1];
        if (!onBoard(nf, nr)) continue;
        occ = board[sq(nf, nr)];
        if (!occ || occ.c !== color) out.push({ from: from, to: sq(nf, nr) });
      }
      if (!inCheck(game, color)) {
        var home = color === WHITE ? 0 : 7;
        var rights = game.castling;
        if (r === home && f === 4) {
          var canK = color === WHITE ? rights.wK : rights.bK;
          var canQ = color === WHITE ? rights.wQ : rights.bQ;
          var enemy = opp(color);
          if (canK && !board[sq(5, home)] && !board[sq(6, home)]) {
            if (
              !isSquareAttacked(board, sq(5, home), enemy) &&
              !isSquareAttacked(board, sq(6, home), enemy)
            ) {
              out.push({ from: from, to: sq(6, home), castle: "K" });
            }
          }
          if (
            canQ &&
            !board[sq(3, home)] &&
            !board[sq(2, home)] &&
            !board[sq(1, home)]
          ) {
            if (
              !isSquareAttacked(board, sq(3, home), enemy) &&
              !isSquareAttacked(board, sq(2, home), enemy)
            ) {
              out.push({ from: from, to: sq(2, home), castle: "Q" });
            }
          }
        }
      }
    }
    return out;
  }

  function applyUnchecked(game, move) {
    var board = game.board;
    var p = board[move.from];
    var captured = board[move.to];
    var epCap = null;
    board[move.from] = null;
    if (move.ep) {
      var capRank = p.c === WHITE ? rankOf(move.to) - 1 : rankOf(move.to) + 1;
      var capSq = sq(fileOf(move.to), capRank);
      epCap = board[capSq];
      board[capSq] = null;
    }
    if (move.castle === "K") {
      var rK = rankOf(move.from);
      board[sq(7, rK)] = null;
      board[sq(5, rK)] = { t: "r", c: p.c };
    } else if (move.castle === "Q") {
      var rQ = rankOf(move.from);
      board[sq(0, rQ)] = null;
      board[sq(3, rQ)] = { t: "r", c: p.c };
    }
    board[move.to] = { t: move.promo || p.t, c: p.c };

    if (p.t === "k") {
      if (p.c === WHITE) {
        game.castling.wK = false;
        game.castling.wQ = false;
      } else {
        game.castling.bK = false;
        game.castling.bQ = false;
      }
    }
    if (p.t === "r") {
      if (p.c === WHITE && move.from === 0) game.castling.wQ = false;
      if (p.c === WHITE && move.from === 7) game.castling.wK = false;
      if (p.c === BLACK && move.from === 56) game.castling.bQ = false;
      if (p.c === BLACK && move.from === 63) game.castling.bK = false;
    }
    if (captured && captured.t === "r") {
      if (move.to === 0) game.castling.wQ = false;
      if (move.to === 7) game.castling.wK = false;
      if (move.to === 56) game.castling.bQ = false;
      if (move.to === 63) game.castling.bK = false;
    }

    game.ep = null;
    if (p.t === "p" && Math.abs(rankOf(move.to) - rankOf(move.from)) === 2) {
      game.ep = sq(fileOf(move.from), (rankOf(move.from) + rankOf(move.to)) / 2);
    }

    if (p.t === "p" || captured || epCap) game.halfmove = 0;
    else game.halfmove += 1;
    if (p.c === BLACK) game.fullmove += 1;
    game.turn = opp(p.c);

    return { captured: captured || epCap, piece: p };
  }

  function legalMovesFrom(game, from) {
    if (game.result) return [];
    var p = game.board[from];
    if (!p || p.c !== game.turn) return [];
    var raw = pseudoMoves(game, from);
    var legal = [];
    for (var i = 0; i < raw.length; i++) {
      var g2 = cloneGame(game);
      applyUnchecked(g2, raw[i]);
      if (!inCheck(g2, p.c)) legal.push(raw[i]);
    }
    return legal;
  }

  function allLegalMoves(game) {
    var moves = [];
    if (game.result) return moves;
    for (var i = 0; i < 64; i++) {
      var p = game.board[i];
      if (p && p.c === game.turn) {
        var ms = legalMovesFrom(game, i);
        for (var j = 0; j < ms.length; j++) moves.push(ms[j]);
      }
    }
    return moves;
  }

  function updateResult(game) {
    var moves = allLegalMoves(game);
    if (moves.length > 0) {
      game.result = null;
      game.winner = null;
      return;
    }
    if (inCheck(game, game.turn)) {
      game.result = "checkmate";
      game.winner = opp(game.turn);
    } else {
      game.result = "stalemate";
      game.winner = null;
    }
  }

  function movesEqual(a, b) {
    return (
      a.from === b.from &&
      a.to === b.to &&
      (a.promo || null) === (b.promo || null)
    );
  }

  function describeMove(gameAfter, move, info) {
    if (move.castle === "K") return "O-O";
    if (move.castle === "Q") return "O-O-O";
    var piece = info.piece.t === "p" ? "" : info.piece.t.toUpperCase();
    var cap = info.captured || move.ep ? "x" : "";
    var dest = alg(move.to);
    var src = info.piece.t === "p" && cap ? FILES[fileOf(move.from)] : "";
    var promo = move.promo ? "=" + move.promo.toUpperCase() : "";
    var chk = "";
    if (gameAfter.result === "checkmate") chk = "#";
    else if (inCheck(gameAfter, gameAfter.turn)) chk = "+";
    return piece + src + cap + dest + promo + chk;
  }

  function makeMove(game, move) {
    if (game.result) return { ok: false, reason: "game over" };
    var legal = legalMovesFrom(game, move.from);
    var found = null;
    for (var i = 0; i < legal.length; i++) {
      if (movesEqual(legal[i], move)) {
        found = legal[i];
        break;
      }
    }
    if (!found) return { ok: false, reason: "illegal" };
    var info = applyUnchecked(game, found);
    updateResult(game);
    var san = describeMove(game, found, info);
    game.history.push({
      from: found.from,
      to: found.to,
      promo: found.promo || null,
      castle: found.castle || null,
      ep: !!found.ep,
      san: san,
      captured: info.captured
        ? { t: info.captured.t, c: info.captured.c }
        : null,
    });
    return { ok: true, move: found, captured: info.captured, san: san };
  }

  function pieceAt(game, square) {
    var i = typeof square === "string" ? parseAlg(square) : square;
    if (i < 0) return null;
    return game.board[i] || null;
  }

  function play(game, fromAlg, toAlg, promo) {
    return makeMove(game, {
      from: parseAlg(fromAlg),
      to: parseAlg(toAlg),
      promo: promo || null,
    });
  }

  function status(game) {
    return {
      turn: game.turn,
      inCheck: inCheck(game, game.turn),
      result: game.result,
      winner: game.winner,
      moveCount: game.history.length,
    };
  }

  return {
    WHITE: WHITE,
    BLACK: BLACK,
    FILES: FILES,
    sq: sq,
    fileOf: fileOf,
    rankOf: rankOf,
    algebraic: alg,
    parseSquare: parseAlg,
    createGame: createGame,
    cloneGame: cloneGame,
    pieceAt: pieceAt,
    inCheck: inCheck,
    isSquareAttacked: isSquareAttacked,
    legalMovesFrom: legalMovesFrom,
    allLegalMoves: allLegalMoves,
    makeMove: makeMove,
    play: play,
    status: status,
    kingIndex: function (g, c) {
      return kingIndex(g.board, c);
    },
  };
});
