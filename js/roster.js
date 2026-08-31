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
        name: "The Peacemaker",
        aka: "Donald Trump",
        role: "King",
        model: "assets/models/right-king.glb",
        portrait: "assets/portraits/trump.jpg",
        mobileToken: "https://assets.chess.the-idea-guy.com/tokens/trump-king.png",
      },
      q: {
        id: "leavitt",
        name: "Karoline",
        aka: "Karoline Leavitt",
        role: "Queen",
        model: "assets/models/right-queen-leavitt.glb",
        portrait: "assets/portraits/leavitt.jpg",
        mobileToken: "https://assets.chess.the-idea-guy.com/tokens/leavitt-queen.png",
      },
      r: [
        {
          id: "paul",
          name: "Dr. Rand",
          aka: "Rand Paul",
          role: "Rook",
          model: "assets/models/right-rook-paul.glb",
          portrait: "assets/portraits/paul.jpg",
          mobileToken: "https://assets.chess.the-idea-guy.com/tokens/paul-rook.png",
        },
        {
          id: "rubio",
          name: "Little Marco",
          aka: "Marco Rubio",
          role: "Rook",
          model: "assets/models/right-rook-ks.glb",
          portrait: "assets/portraits/rubio.jpg",
          mobileToken: "https://assets.chess.the-idea-guy.com/tokens/rubio-rook.png",
        },
      ],
      b: [
        {
          id: "cruz",
          name: "Cancun Cruz",
          aka: "Ted Cruz",
          role: "Bishop",
          model: "assets/models/right-bishop.glb",
          portrait: "assets/portraits/cruz.jpg",
          mobileToken: "https://assets.chess.the-idea-guy.com/tokens/cruz-bishop.png",
        },
        {
          id: "rfk",
          name: "Bobby",
          aka: "RFK Jr.",
          role: "Bishop",
          model: "assets/models/right-bishop-ks.glb",
          portrait: "assets/portraits/rfk.jpg",
          mobileToken: "https://assets.chess.the-idea-guy.com/tokens/rfk-bishop.png",
        },
      ],
      n: [
        {
          id: "vance",
          name: "JD",
          aka: "JD Vance",
          role: "Knight",
          model: "assets/models/right-knight.glb",
          portrait: "assets/portraits/vance.jpg",
          mobileToken: "https://assets.chess.the-idea-guy.com/tokens/vance-knight.png",
        },
        {
          id: "desantis",
          name: "Ron",
          aka: "Ron DeSantis",
          role: "Knight",
          model: "assets/models/right-knight-ks.glb",
          portrait: "assets/portraits/desantis.jpg",
          mobileToken: "https://assets.chess.the-idea-guy.com/tokens/desantis-knight.png",
        },
      ],
      p: {
        id: "maga",
        name: "Open-carry MAGA",
        role: "Pawn",
        model: "https://assets.chess.the-idea-guy.com/models/right-pawn-v2.glb",
        portrait: "https://assets.chess.the-idea-guy.com/portraits/pawn-right-v2.jpg",
        mobileToken: "https://assets.chess.the-idea-guy.com/tokens/maga-pawn-v2.png",
      },
    },
    b: {
      side: "left",
      house: "The Left",
      slogan: "Our Democracy™",
      kingName: "Newscum",
      k: {
        id: "newsom",
        name: "Newscum",
        aka: "Gavin Newsom",
        role: "King",
        model: "assets/models/left-king.glb",
        portrait: "assets/portraits/newsom.jpg",
        mobileToken: "https://assets.chess.the-idea-guy.com/tokens/newsom-king.png",
      },
      q: {
        id: "aoc",
        name: "AOC",
        aka: "Alexandria Ocasio-Cortez",
        role: "Queen",
        model: "assets/models/left-queen.glb",
        portrait: "assets/portraits/aoc.jpg",
        mobileToken: "https://assets.chess.the-idea-guy.com/tokens/aoc-queen.png",
      },
      r: [
        {
          id: "sanders",
          name: "Commie Bernie",
          aka: "Bernie Sanders",
          role: "Rook",
          model: "assets/models/left-rook.glb",
          portrait: "assets/portraits/sanders.jpg",
          mobileToken: "https://assets.chess.the-idea-guy.com/tokens/sanders-rook.png",
        },
        {
          id: "warren",
          name: "Pocahontas",
          aka: "Elizabeth Warren",
          role: "Rook",
          model: "assets/models/left-rook-warren.glb",
          portrait: "assets/portraits/warren.jpg",
          mobileToken: "https://assets.chess.the-idea-guy.com/tokens/warren-rook.png",
        },
      ],
      b: [
        {
          id: "harris",
          name: "Comrade Kamala",
          aka: "Kamala Harris",
          role: "Bishop",
          model: "assets/models/left-bishop.glb",
          portrait: "assets/portraits/harris.jpg",
          mobileToken: "https://assets.chess.the-idea-guy.com/tokens/harris-bishop.png",
        },
        {
          id: "schumer",
          name: "Chuck-U",
          aka: "Chuck Schumer",
          role: "Bishop",
          model: "assets/models/left-bishop-schumer.glb",
          portrait: "assets/portraits/schumer.jpg",
          mobileToken: "https://assets.chess.the-idea-guy.com/tokens/schumer-bishop.png",
        },
      ],
      n: [
        {
          id: "buttigieg",
          name: "Mayor Pete",
          aka: "Pete Buttigieg",
          role: "Knight",
          model: "assets/models/left-knight.glb",
          portrait: "assets/portraits/buttigieg.jpg",
          mobileToken: "https://assets.chess.the-idea-guy.com/tokens/buttigieg-knight.png",
        },
        {
          id: "mamdani",
          name: "Comrade Zohran",
          aka: "Zohran Mamdani",
          role: "Knight",
          model: "assets/models/left-knight-ks.glb",
          portrait: "assets/portraits/mamdani.jpg",
          mobileToken: "https://assets.chess.the-idea-guy.com/tokens/mamdani-knight.png",
        },
      ],
      p: {
        id: "activist",
        name: "They/Them Rifle",
        aka: "Blue-hair riflewoman",
        role: "Pawn",
        model: "https://assets.chess.the-idea-guy.com/models/left-pawn-v2.glb",
        portrait: "https://assets.chess.the-idea-guy.com/portraits/pawn-left-v2.jpg",
        mobileToken: "https://assets.chess.the-idea-guy.com/tokens/activist-pawn.png",
      },
    },
  };

  /** Starters sit in ROSTER. Everyone else waits here — assets stay, they just don't start. */
  var BENCH = {
    w: [
      {
        id: "mcconnell",
        name: "Moscow Mitch",
        aka: "Mitch McConnell",
        role: "Rook",
        model: "assets/models/right-rook.glb",
        portrait: "assets/portraits/mcconnell.jpg",
      },
      {
        id: "melania",
        name: "Melania",
        aka: "Melania Trump",
        role: "Queen",
        model: "assets/models/right-queen.glb",
        portrait: "assets/portraits/melania.jpg",
      },
    ],
    b: [],
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
    BENCH: BENCH,
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
