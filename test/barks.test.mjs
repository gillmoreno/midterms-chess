import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { barkFor, pickBark, BARKS, linesFor } from "../js/barks.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

test("a piece with no barks is silent", () => {
  assert.equal(barkFor("nobody"), null);
  assert.equal(pickBark([], "x").bark, null);
  assert.equal(pickBark(undefined, "x").bark, null);
});

test("pickBark returns the only line", () => {
  const list = [{ src: "assets/sfx/barks/aoc-devil.mp3", line: "deal" }];
  const { bark, lastSrc } = pickBark(list, "");
  assert.equal(bark.src, list[0].src);
  assert.equal(lastSrc, list[0].src);
});

test("pickBark skips the previous src when there is another", () => {
  const list = [
    { src: "a.mp3", line: "a" },
    { src: "b.mp3", line: "b" },
  ];
  const seen = new Set();
  for (let i = 0; i < 20; i++) {
    const { bark } = pickBark(list, "a.mp3");
    seen.add(bark.src);
  }
  assert.equal(seen.has("a.mp3"), false);
  assert.equal(seen.has("b.mp3"), true);
});

test("click barks play the recorded file with no chamber sting", () => {
  const fx = fs.readFileSync(path.join(root, "js", "fx.js"), "utf8");
  const main = fs.readFileSync(path.join(root, "js", "main.js"), "utf8");
  assert.match(fx, /export function playBark/);
  assert.match(main, /playBark\(bark\.src\)/);
  assert.doesNotMatch(fx, /function gavel/);
  assert.doesNotMatch(fx, /lead = 0\.5/);
  assert.doesNotMatch(main, /playSelect/);
});

test("every assigned bark file is on disk", () => {
  Object.values(BARKS).forEach((list) => {
    list.forEach((b) => {
      assert.ok(fs.existsSync(path.join(root, b.src)), b.src);
      assert.ok(b.line && b.line.length > 0, "bark needs a line");
    });
  });
});

test("linesFor is empty for a character with no click bark", () => {
  assert.deepEqual(linesFor("warren"), []);
  assert.deepEqual(linesFor("mcconnell"), []);
  assert.deepEqual(linesFor("nobody"), []);
  assert.ok(linesFor("aoc").length >= 1);
  assert.ok(linesFor("leavitt").length >= 1);
});

test("The Peacemaker has an Iran-obliterated click bark on disk", () => {
  const list = linesFor("trump");
  assert.ok(list.some((b) => /obliterat/i.test(b.line) && /navy/i.test(b.line)));
  list.forEach((b) => assert.ok(fs.existsSync(path.join(root, b.src)), b.src));
});

test("Little Marco has yoga and diplomacy click barks on disk", () => {
  const list = linesFor("rubio");
  assert.ok(list.length >= 2);
  assert.ok(list.some((b) => /yoga/i.test(b.line)));
  assert.ok(list.some((b) => /diplomacy/i.test(b.line)));
  list.forEach((b) => assert.ok(fs.existsSync(path.join(root, b.src)), b.src));
});

test("Cancun Cruz has a click bark on disk", () => {
  const list = linesFor("cruz");
  assert.equal(list.length, 1);
  assert.match(list[0].line, /mistake/i);
  assert.ok(fs.existsSync(path.join(root, list[0].src)), list[0].src);
});

test("the barks ledger page lists click coverage", () => {
  const html = fs.readFileSync(path.join(root, "barks.html"), "utf8");
  const js = fs.readFileSync(path.join(root, "js", "barks-page.js"), "utf8");
  assert.match(html, /js\/barks-page.js/);
  assert.match(html, /id="grid-right"/);
  assert.match(html, /id="grid-left"/);
  assert.match(html, /id="grid-bench"/);
  assert.match(js, /linesFor/);
  assert.match(js, /allEntries/);
  assert.match(js, /Needs a click bark/);
});
