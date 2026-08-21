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
  assert.equal(s.Roster.entry("w", "k").name, "Donald Trump");
  assert.equal(s.Roster.entry("b", "k").name, "Newscum");
  assert.equal(s.Roster.entry("b", "q").name, "AOC");
  assert.equal(s.Roster.entry("w", "r", 0).name, "Mitch McConnell");
  assert.equal(s.Roster.entry("w", "r", 7).name, "Marco Rubio");
  assert.equal(s.Roster.entry("b", "n", 6).name, "Comrade Zohran");
  assert.equal(s.Roster.entry("b", "b", 5).name, "Pocahontas");
  assert.equal(s.Roster.entry("b", "b", 2).name, "Comrade Kamala");
  assert.equal(s.Roster.entry("w", "b", 2).name, "Ted Cruz");
  assert.equal(s.Roster.entry("w", "b", 5).name, "RFK Jr.");
});

test("roster stamp gives each wing rook its own identity", () => {
  const chess = loadClassic("js/chess.js");
  const roster = loadClassic("js/roster.js");
  const g = roster.Roster.stamp(chess.Chess.createGame());
  assert.equal(g.board[chess.Chess.parseSquare("a1")].id, "mcconnell");
  assert.equal(g.board[chess.Chess.parseSquare("h1")].id, "rubio");
  assert.equal(g.board[chess.Chess.parseSquare("a8")].id, "sanders");
  assert.equal(g.board[chess.Chess.parseSquare("h8")].id, "schumer");
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
  assert.ok(fs.existsSync(path.join(root, "assets", "ui", "staunton", "wK.svg")));
  assert.ok(fs.existsSync(path.join(root, "assets", "ui", "staunton", "bQ.svg")));
  assert.match(html, /id="hover-card"/);
  assert.match(html, /id="cine"/);
  assert.match(html, /id="cine-video"/);
  assert.match(html, /href="scripts.html"/);
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
  assert.match(src, /FLOOR VOTE/);
});

test("picks.html is the left-gag shop with three stills on disk", () => {
  const html = fs.readFileSync(path.join(root, "picks.html"), "utf8");
  assert.match(html, /js\/picks-page\.js/);
  [
    "harris-2-comrade.jpg",
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

test("scripts.html is a writer room for who-kills-who lines", () => {
  const html = fs.readFileSync(path.join(root, "scripts.html"), "utf8");
  assert.match(html, /id="ledger-body"/);
  assert.match(html, /id="line-edit"/);
  assert.match(html, /id="hooks"/);
  assert.match(html, /js\/scripts-page\.js/);
  assert.match(html, /href="index.html"/);
});
