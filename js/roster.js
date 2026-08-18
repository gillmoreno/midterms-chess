/**
 * Political houses mapped onto chess roles.
 * White = the Right. Black = the Left.
 */
(function (root) {
  "use strict";

  var HEIGHTS = { k: 1.08, q: 1.02, r: 0.84, b: 0.88, n: 0.86, p: 0.7 };

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
      r: {
        id: "mcconnell",
        name: "Mitch McConnell",
        role: "Rook",
        model: "assets/models/right-rook.glb",
        portrait: "assets/portraits/mcconnell.jpg",
      },
      b: {
        id: "cruz",
        name: "Ted Cruz",
        role: "Bishop",
        model: "assets/models/right-bishop.glb",
        portrait: "assets/portraits/cruz.jpg",
      },
      n: {
        id: "vance",
        name: "JD Vance",
        role: "Knight",
        model: "assets/models/right-knight.glb",
        portrait: "assets/portraits/vance.jpg",
      },
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
      r: {
        id: "sanders",
        name: "Bernie Sanders",
        role: "Rook",
        model: "assets/models/left-rook.glb",
        portrait: "assets/portraits/sanders.jpg",
      },
      b: {
        id: "harris",
        name: "Kamala Harris",
        role: "Bishop",
        model: "assets/models/left-bishop.glb",
        portrait: "assets/portraits/harris.jpg",
      },
      n: {
        id: "buttigieg",
        name: "Pete Buttigieg",
        role: "Knight",
        model: "assets/models/left-knight.glb",
        portrait: "assets/portraits/buttigieg.jpg",
      },
      p: {
        id: "activist",
        name: "Blue-hair riflewoman",
        role: "Pawn",
        model: "assets/models/left-pawn.glb",
        portrait: "assets/portraits/pawn-left.jpg",
      },
    },
  };

  function entry(color, type) {
    return ROSTER[color] && ROSTER[color][type] ? ROSTER[color][type] : null;
  }

  function heightFor(type) {
    return HEIGHTS[type] || 0.8;
  }

  var api = {
    ROSTER: ROSTER,
    HEIGHTS: HEIGHTS,
    entry: entry,
    heightFor: heightFor,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.Roster = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
