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
  assert.equal(s.Roster.entry("b", "k").name, "Gavin Newsom");
  assert.equal(s.Roster.entry("b", "q").name, "AOC");
});

test("index.html is a module page with a file:// escape hatch", () => {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  assert.match(html, /type="importmap"/);
  assert.match(html, /js\/main\.js/);
  assert.match(html, /id="file-hint"/);
  assert.match(html, /id="stage"/);
});
