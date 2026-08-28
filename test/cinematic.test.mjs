import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { clipFor } from "../js/cinematic.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

test("pawn-on-pawn and left-queen-on-right-pawn get kill reels", () => {
  const right = clipFor({ t: "p", c: "w" }, { t: "p", c: "b" });
  const left = clipFor({ t: "p", c: "b" }, { t: "p", c: "w" });
  const queen = clipFor({ t: "q", c: "b" }, { t: "p", c: "w" });
  const rfk = clipFor({ t: "b", c: "w", id: "rfk" }, { t: "p", c: "b" });
  assert.equal(right.src, "assets/cinematics/right-kills.mp4");
  assert.equal(right.line, "You're pronouns are: You, dead!");
  assert.equal(left.src, "assets/cinematics/left-kills.mp4");
  assert.equal(left.line, "I am aborting you now!");
  assert.equal(queen.src, "assets/cinematics/left-queen-kills.mp4");
  assert.equal(queen.line, "This will go viral, you are not");
  assert.equal(rfk.src, "assets/cinematics/rfk-kills.mp4");
  assert.equal(rfk.line, "I'll get rid of seed oils, and you");
  assert.equal(clipFor({ t: "p", c: "w" }, { t: "q", c: "b" }), null);
  assert.equal(clipFor({ t: "q", c: "b" }, { t: "n", c: "w" }), null);
  assert.equal(clipFor({ t: "b", c: "w", id: "cruz" }, { t: "p", c: "b" }), null);
  assert.equal(clipFor({ t: "n", c: "w" }, { t: "p", c: "b" }), null);
  assert.equal(clipFor({ t: "p", c: "w" }, null), null);
});

test("named-piece captures are not kill reels — defeated beds live on the victim", () => {
  assert.equal(
    clipFor({ t: "p", c: "w", id: "maga" }, { t: "b", c: "b", id: "harris" }),
    null
  );
  assert.equal(
    clipFor({ t: "r", c: "w", id: "mcconnell" }, { t: "b", c: "b", id: "harris" }),
    null
  );
  assert.equal(
    clipFor({ t: "p", c: "w", id: "maga" }, { t: "r", c: "b", id: "warren" }),
    null
  );
  assert.equal(
    clipFor({ t: "n", c: "w", id: "vance" }, { t: "q", c: "b", id: "aoc" }),
    null
  );
});

test("kill reels and posters are on disk", () => {
  [
    "left-kills.mp4",
    "right-kills.mp4",
    "left-kills.jpg",
    "right-kills.jpg",
    "left-queen-kills.mp4",
    "left-queen-kills.jpg",
    "rfk-kills.mp4",
    "rfk-kills.jpg",
  ].forEach((name) => {
    const p = path.join(root, "assets", "cinematics", name);
    assert.ok(fs.existsSync(p), name);
    assert.ok(fs.statSync(p).size > 1000, name + " too small");
  });
});
