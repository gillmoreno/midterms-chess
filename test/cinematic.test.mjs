import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { clipFor } from "../js/cinematic.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

test("only pawn-on-pawn gets a kill reel", () => {
  const right = clipFor({ t: "p", c: "w" }, { t: "p", c: "b" });
  const left = clipFor({ t: "p", c: "b" }, { t: "p", c: "w" });
  assert.equal(right.src, "assets/cinematics/right-kills.mp4");
  assert.equal(right.line, "You're pronouns are: You, dead!");
  assert.equal(left.src, "assets/cinematics/left-kills.mp4");
  assert.equal(left.line, "I am aborting you now!");
  assert.equal(clipFor({ t: "p", c: "w" }, { t: "q", c: "b" }), null);
  assert.equal(clipFor({ t: "n", c: "w" }, { t: "p", c: "b" }), null);
  assert.equal(clipFor({ t: "p", c: "w" }, null), null);
});

test("kill reels and posters are on disk", () => {
  ["left-kills.mp4", "right-kills.mp4", "left-kills.jpg", "right-kills.jpg"].forEach((name) => {
    const p = path.join(root, "assets", "cinematics", name);
    assert.ok(fs.existsSync(p), name);
    assert.ok(fs.statSync(p).size > 1000, name + " too small");
  });
});
