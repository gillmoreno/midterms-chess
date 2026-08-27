import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  LAST_WORDS,
  LOSE_REELS,
  lastWordFor,
  pickLastWord,
  fateKicker,
  loseReelFor,
} from "../js/last-words.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

test("a piece with no last words is silent", () => {
  assert.equal(lastWordFor("nobody"), null);
  assert.equal(pickLastWord([], "x").word, null);
  assert.equal(pickLastWord(undefined, "x").word, null);
});

test("pickLastWord returns the only line", () => {
  const list = [
    { src: "assets/sfx/last-words/warren-plan.mp3", line: "I have a plan for that.", fate: "captured" },
  ];
  const { word, lastSrc } = pickLastWord(list, "");
  assert.equal(word.src, list[0].src);
  assert.equal(lastSrc, list[0].src);
});

test("fate kicker maps fired / cancun / captured", () => {
  assert.equal(fateKicker("fired"), "Fired");
  assert.equal(fateKicker("cancun"), "Cancun");
  assert.equal(fateKicker("captured"), "Taken");
  assert.equal(fateKicker("nope"), "Taken");
});

test("every assigned last-word file is on disk", () => {
  Object.values(LAST_WORDS).forEach((list) => {
    list.forEach((w) => {
      assert.ok(fs.existsSync(path.join(root, w.src)), w.src);
      assert.ok(w.line && w.line.length > 0, "last word needs a line");
      assert.ok(w.fate, "last word needs a fate");
      if (w.reel) {
        assert.ok(fs.existsSync(path.join(root, w.reel)), w.reel);
      }
    });
  });
});

test("AOC bartender last word has a defeated reel", () => {
  const aoc = LAST_WORDS.aoc.find((w) => w.src.includes("aoc-bartender"));
  assert.ok(aoc);
  assert.ok(aoc.reel);
  assert.ok(fs.existsSync(path.join(root, aoc.reel)));
});

test("named pieces other than pawns have a last word", () => {
  const need = [
    "trump",
    "melania",
    "mcconnell",
    "rubio",
    "cruz",
    "rfk",
    "vance",
    "desantis",
    "newsom",
    "aoc",
    "sanders",
    "schumer",
    "harris",
    "warren",
    "buttigieg",
    "mamdani",
  ];
  need.forEach((id) => {
    assert.ok(LAST_WORDS[id] && LAST_WORDS[id].length, id + " needs a last word");
  });
});

test("capture playback prefers the victim last word over house taunts", () => {
  const src = fs.readFileSync(path.join(root, "js", "main.js"), "utf8");
  assert.match(src, /lastWordFor/);
  assert.match(src, /announceLastWord/);
  assert.match(src, /if \(lastWord\) announceLastWord/);
  assert.match(src, /loseReelFor/);
});

test("Kamala lose bed is mute and four last words ride it", () => {
  const reel = loseReelFor("harris");
  assert.ok(reel);
  assert.ok(fs.existsSync(path.join(root, reel.src)), reel.src);
  assert.equal(reel.baked, undefined);
  const pool = LAST_WORDS.harris.filter((w) => w.onReel);
  assert.equal(pool.length, 4);
  pool.forEach((w) => {
    assert.ok(fs.existsSync(path.join(root, w.src)), w.src);
  });
  const picks = new Set();
  for (let i = 0; i < 40; i++) {
    const w = lastWordFor("harris", { reel: true });
    assert.ok(w.onReel);
    picks.add(w.src);
  }
  assert.ok(picks.size >= 2, "reel pool should shuffle");
});

test("defeated.html is the last-words room", () => {
  const html = fs.readFileSync(path.join(root, "defeated.html"), "utf8");
  assert.match(html, /js\/defeated-page.js/);
  assert.match(html, /id="btn-play"/);
  assert.match(html, /href="index.html"/);
});
