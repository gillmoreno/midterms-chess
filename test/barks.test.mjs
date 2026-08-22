import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { barkFor, pickBark, BARKS } from "../js/barks.js";

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

test("every assigned bark file is on disk", () => {
  Object.values(BARKS).forEach((list) => {
    list.forEach((b) => {
      assert.ok(fs.existsSync(path.join(root, b.src)), b.src);
      assert.ok(b.line && b.line.length > 0, "bark needs a line");
    });
  });
});
