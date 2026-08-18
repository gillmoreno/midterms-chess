/**
 * Political houses mapped onto chess roles.
 * White = the Right. Black = the Left.
 * Rooks/bishops/knights have a queenside and kingside character.
 */
(function (root) {
  "use strict";

  var HEIGHTS = { k: 1.22, q: 1.16, r: 0.98, b: 1.02, n: 1.0, p: 0.82 };

  var ROSTER = {
    w: {
      side: "right",
      house: "The Right",
      slogan: "America First",
      kingName: "Donald Trump",
      k: {
        id: "trump",
        name: "Donald Trump",
        role: "King",
        model: "assets/models/right-king.glb",
        portrait: "assets/portraits/trump.jpg",
      },
      q: {
        id: "melania",
        name: "Melania Trump",
        role: "Queen",
        model: "assets/models/right-queen.glb",
        portrait: "assets/portraits/melania.jpg",
      },
      r: [
        {
          id: "mcconnell",
          name: "Mitch McConnell",
          role: "Rook",
          model: "assets/models/right-rook.glb",
          portrait: "assets/portraits/mcconnell.jpg",
        },
        {
          id: "rubio",
          name: "Marco Rubio",
          role: "Rook",
          model: "assets/models/right-rook-ks.glb",
          portrait: "assets/portraits/rubio.jpg",
        },
      ],
      b: [
        {
          id: "cruz",
          name: "Ted Cruz",
          role: "Bishop",
          model: "assets/models/right-bishop.glb",
          portrait: "assets/portraits/cruz.jpg",
        },
        {
          id: "graham",
          name: "Lindsey Graham",
          role: "Bishop",
          model: "assets/models/right-bishop-ks.glb",
          portrait: "assets/portraits/graham.jpg",
        },
      ],
      n: [
        {
          id: "vance",
          name: "JD Vance",
          role: "Knight",
          model: "assets/models/right-knight.glb",
          portrait: "assets/portraits/vance.jpg",
        },
        {
          id: "desantis",
          name: "Ron DeSantis",
          role: "Knight",
          model: "assets/models/right-knight-ks.glb",
          portrait: "assets/portraits/desantis.jpg",
        },
      ],
      p: {
        id: "maga",
        name: "Open-carry MAGA",
        role: "Pawn",
        model: "assets/models/right-pawn.glb",
        portrait: "assets/portraits/pawn-right.jpg",
      },
    },
    b: {
      side: "left",
      house: "The Left",
      slogan: "The Resistance",
      kingName: "Gavin Newsom",
      k: {
        id: "newsom",
        name: "Gavin Newsom",
        role: "King",
        model: "assets/models/left-king.glb",
        portrait: "assets/portraits/newsom.jpg",
      },
      q: {
        id: "aoc",
        name: "AOC",
        role: "Queen",
        model: "assets/models/left-queen.glb",
        portrait: "assets/portraits/aoc.jpg",
      },
      r: [
        {
          id: "sanders",
          name: "Bernie Sanders",
          role: "Rook",
          model: "assets/models/left-rook.glb",
          portrait: "assets/portraits/sanders.jpg",
        },
        {
          id: "schumer",
          name: "Chuck Schumer",
          role: "Rook",
          model: "assets/models/left-rook-ks.glb",
          portrait: "assets/portraits/schumer.jpg",
        },
      ],
      b: [
        {
          id: "harris",
          name: "Kamala Harris",
          role: "Bishop",
          model: "assets/models/left-bishop.glb",
          portrait: "assets/portraits/harris.jpg",
        },
        {
          id: "warren",
          name: "Elizabeth Warren",
          role: "Bishop",
          model: "assets/models/left-bishop-ks.glb",
          portrait: "assets/portraits/warren.jpg",
        },
      ],
      n: [
        {
          id: "buttigieg",
          name: "Pete Buttigieg",
          role: "Knight",
          model: "assets/models/left-knight.glb",
          portrait: "assets/portraits/buttigieg.jpg",
        },
        {
          id: "booker",
          name: "Cory Booker",
          role: "Knight",
          model: "assets/models/left-knight-ks.glb",
          portrait: "assets/portraits/booker.jpg",
        },
      ],
      p: {
        id: "activist",
        name: "Blue-hair riflewoman",
        role: "Pawn",
        model: "assets/models/left-pawn.glb",
        portrait: "assets/portraits/pawn-left.jpg",
      },
    },
  };

  function wingIndex(file) {
    return file != null && file >= 5 ? 1 : 0;
  }

  function asList(entry) {
    if (!entry) return [];
    return Array.isArray(entry) ? entry : [entry];
  }

  function entry(color, type, file) {
    var e = ROSTER[color] && ROSTER[color][type];
    if (!e) return null;
    if (Array.isArray(e)) return e[wingIndex(file)];
    return e;
  }

  function entryFor(piece, file) {
    if (!piece) return null;
    var list = asList(ROSTER[piece.c] && ROSTER[piece.c][piece.t]);
    if (!list.length) return null;
    if (piece.id) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].id === piece.id) return list[i];
      }
    }
    return entry(piece.c, piece.t, file);
  }

  function allEntries() {
    var out = [];
    ["w", "b"].forEach(function (c) {
      ["k", "q", "r", "b", "n", "p"].forEach(function (t) {
        asList(ROSTER[c][t]).forEach(function (e) {
          out.push({ color: c, type: t, entry: e });
        });
      });
    });
    return out;
  }

  function stamp(game) {
    ["w", "b"].forEach(function (c) {
      var rank = c === "w" ? 0 : 7;
      var files = { r: [0, 7], n: [1, 6], b: [2, 5] };
      Object.keys(files).forEach(function (t) {
        files[t].forEach(function (f) {
          var p = game.board[rank * 8 + f];
          var e = entry(c, t, f);
          if (p && e) p.id = e.id;
        });
      });
      var home = [
        { f: 3, t: "q" },
        { f: 4, t: "k" },
      ];
      home.forEach(function (h) {
        var p = game.board[rank * 8 + h.f];
        var e = entry(c, h.t);
        if (p && e) p.id = e.id;
      });
      var pawnRank = c === "w" ? 1 : 6;
      var pe = entry(c, "p");
      for (var f = 0; f < 8; f++) {
        var pawn = game.board[pawnRank * 8 + f];
        if (pawn && pe) pawn.id = pe.id;
      }
    });
    return game;
  }

  function stampPromo(piece, file) {
    if (!piece) return piece;
    var e = entry(piece.c, piece.t, file);
    if (e) piece.id = e.id;
    return piece;
  }

  function heightFor(type) {
    return HEIGHTS[type] || 0.8;
  }

  var api = {
    ROSTER: ROSTER,
    HEIGHTS: HEIGHTS,
    entry: entry,
    entryFor: entryFor,
    allEntries: allEntries,
    stamp: stamp,
    stampPromo: stampPromo,
    heightFor: heightFor,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.Roster = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
