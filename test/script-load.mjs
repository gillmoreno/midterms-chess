/**
 * Load shipped browser scripts in a window-like sandbox.
 */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadClassic(rel) {
  const code = fs.readFileSync(path.join(root, rel), "utf8");
  const sandbox = { console, module: { exports: {} }, exports: {} };
  sandbox.globalThis = sandbox;
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: rel });
  return sandbox;
}

test("chess.js installs Chess without Node globals leaking into the page path", () => {
  const s = loadClassic("js/chess.js");
  assert.equal(typeof s.Chess.createGame, "function");
  const g = s.Chess.createGame();
  assert.equal(s.Chess.allLegalMoves(g).length, 20);
});

test("roster.js names the required kings and AOC as left queen", () => {
  const s = loadClassic("js/roster.js");
  assert.equal(s.Roster.entry("w", "k").name, "The Peacemaker");
  assert.equal(s.Roster.entry("w", "k").aka, "Donald Trump");
  assert.equal(s.Roster.entry("b", "k").name, "Newscum");
  assert.equal(s.Roster.entry("b", "q").name, "AOC");
  assert.equal(s.Roster.entry("w", "q").name, "Karoline");
  assert.equal(s.Roster.entry("w", "q").id, "leavitt");
  assert.equal(s.Roster.entry("w", "r", 0).name, "Dr. Rand");
  assert.equal(s.Roster.entry("w", "r", 7).name, "Little Marco");
  assert.equal(s.Roster.entry("b", "n", 6).name, "Comrade Zohran");
  assert.equal(s.Roster.entry("b", "b", 5).name, "Chuck-U");
  assert.equal(s.Roster.entry("b", "r", 7).name, "Pocahontas");
  assert.equal(s.Roster.entry("b", "b", 2).name, "Comrade Kamala");
  assert.equal(s.Roster.entry("w", "b", 2).name, "Cancun Cruz");
  assert.equal(s.Roster.entry("w", "b", 2).aka, "Ted Cruz");
  assert.equal(s.Roster.entry("w", "b", 5).name, "Bobby");
  assert.equal(s.Roster.entry("w", "b", 5).aka, "RFK Jr.");
});

test("McConnell stays on the right-side bench with his assets", () => {
  const s = loadClassic("js/roster.js");
  const bench = s.Roster.BENCH.w;
  assert.ok(Array.isArray(bench));
  const mitch = bench.find((e) => e.id === "mcconnell");
  assert.ok(mitch);
  assert.equal(mitch.name, "Moscow Mitch");
  assert.equal(mitch.aka, "Mitch McConnell");
  assert.equal(mitch.portrait, "assets/portraits/mcconnell.jpg");
  assert.equal(mitch.model, "assets/models/right-rook.glb");
  assert.ok(s.Roster.allEntries().every((row) => row.entry.id !== "mcconnell"));
  const melania = bench.find((e) => e.id === "melania");
  assert.ok(melania);
  assert.equal(melania.role, "Queen");
  assert.equal(melania.portrait, "assets/portraits/melania.jpg");
  assert.ok(s.Roster.allEntries().every((row) => row.entry.id !== "melania"));
});

test("roster stamp gives each wing rook its own identity", () => {
  const chess = loadClassic("js/chess.js");
  const roster = loadClassic("js/roster.js");
  const g = roster.Roster.stamp(chess.Chess.createGame());
  assert.equal(g.board[chess.Chess.parseSquare("a1")].id, "paul");
  assert.equal(g.board[chess.Chess.parseSquare("h1")].id, "rubio");
  assert.equal(g.board[chess.Chess.parseSquare("a8")].id, "sanders");
  assert.equal(g.board[chess.Chess.parseSquare("h8")].id, "warren");
  assert.equal(g.board[chess.Chess.parseSquare("f8")].id, "schumer");
});

test("main.js only imports names barks.js actually exports", () => {
  const main = fs.readFileSync(path.join(root, "js", "main.js"), "utf8");
  const barks = fs.readFileSync(path.join(root, "js", "barks.js"), "utf8");
  const m = main.match(/import\s*\{([^}]+)\}\s*from\s*"\.\/barks\.js"/);
  assert.ok(m, "main.js imports barks.js");
  m[1].split(",").map((s) => s.trim()).filter(Boolean).forEach((name) => {
    const re = new RegExp("export (?:function|const|let|var) " + name + "\\b");
    assert.match(barks, re, "barks.js must export " + name);
  });
});

test("index.html is a module page with a file:// escape hatch", () => {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  assert.match(html, /type="importmap"/);
  assert.match(html, /js\/main\.js/);
  assert.match(html, /id="file-hint"/);
  assert.match(html, /id="stage"/);
  assert.match(html, /id="miniboard"/);
  assert.match(html, /id="miniboard-size"/);
  assert.match(html, /id="miniboard-wrap" data-size="sm"/);
  assert.match(html, /id="hover-size"/);
  assert.match(html, /id="hover-card" hidden data-size="lg"/);
  assert.ok(fs.existsSync(path.join(root, "assets", "ui", "staunton", "wK.svg")));
  assert.ok(fs.existsSync(path.join(root, "assets", "ui", "staunton", "bQ.svg")));
  assert.match(html, /id="hover-card"/);
  assert.match(html, /id="cine"/);
  assert.match(html, /id="cine-video"/);
  assert.match(html, /href="scripts.html"/);
  assert.match(html, /href="defeated.html"/);
  assert.match(html, /href="barks.html"/);
  assert.match(html, /The Midterms/);
  assert.match(html, /id="hover-bark"/);
  assert.match(html, /id="taunt"/);
  assert.match(html, /id="opp-mode"/);
  assert.match(html, /id="opp-level"/);
  assert.doesNotMatch(html, /id="backdrops"/);
});

test("the board sits in a UFC cage on the White House lawn", () => {
  const src = fs.readFileSync(path.join(root, "js", "backdrops.js"), "utf8");
  assert.match(src, /addOctagon/);
  assert.match(src, /addWhiteHouse/);
  assert.match(src, /addCrowd/);
  assert.match(src, /THE MIDTERMS/);
});

test("picks.html is the left-gag shop with three stills on disk", () => {
  const html = fs.readFileSync(path.join(root, "picks.html"), "utf8");
  assert.match(html, /js\/picks-page\.js/);
  [
    "harris-4-mao.jpg",
    "newsom-7-hands-front.jpg",
    "aoc-13-black-sly.jpg",
    "sanders-4-point.jpg",
    "schumer-4-tear.jpg",
    "pete-2-pothole.jpg",
  ].forEach((name) => {
    const p = path.join(root, "assets", "previews", "left-gags", name);
    assert.ok(fs.existsSync(p), name);
  });
});

test("trump taunt mp3s referenced in taunts.js are on disk", () => {
  const src = fs.readFileSync(path.join(root, "js", "taunts.js"), "utf8");
  const files = [...src.matchAll(/djt-[a-z0-9-]+\.mp3/g)].map((m) => m[0]);
  const unique = [...new Set(files)];
  assert.ok(unique.length >= 10, "expected a pool of djt clips, got " + unique.length);
  unique.forEach((name) => {
    assert.ok(fs.existsSync(path.join(root, "assets", "sfx", name)), name);
  });
});

test("order.html lists mute capture-order beds on disk", () => {
  const html = fs.readFileSync(path.join(root, "order.html"), "utf8");
  const js = fs.readFileSync(path.join(root, "js", "order-page.js"), "utf8");
  assert.match(html, /js\/order-page.js/);
  assert.match(js, /studio\/capture-order\/beds.json/);
  const catalog = JSON.parse(
    fs.readFileSync(path.join(root, "studio", "capture-order", "beds.json"), "utf8")
  );
  assert.ok(catalog.beds.length >= 16);
  catalog.beds.forEach((bed) => {
    assert.ok(fs.existsSync(path.join(root, bed.still)), bed.still);
    assert.ok(fs.existsSync(path.join(root, bed.mute)), bed.mute);
  });
  const ids = catalog.beds.map((b) => b.id);
  assert.ok(ids.includes("paul"));
  assert.ok(ids.includes("mcconnell"));
});

test("defeated.html lists last-word lose beds", () => {
  const html = fs.readFileSync(path.join(root, "defeated.html"), "utf8");
  assert.match(html, /js\/defeated-page.js/);
  assert.match(html, /id="hero-poster"/);
  assert.ok(fs.existsSync(path.join(root, "assets", "cinematics", "kamala-lose-mute.mp4")));
  assert.ok(fs.existsSync(path.join(root, "assets", "cinematics", "aoc-bartender.mp4")));
});

test("scripts.html is a writer room for who-kills-who lines", () => {
  const html = fs.readFileSync(path.join(root, "scripts.html"), "utf8");
  assert.match(html, /id="ledger-body"/);
  assert.match(html, /id="line-edit"/);
  assert.match(html, /id="hooks"/);
  assert.match(html, /js\/scripts-page\.js/);
  assert.match(html, /href="index.html"/);
});
