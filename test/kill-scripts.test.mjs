import { createRequire } from "node:module";
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  LINES,
  VOICES,
  DELIVERY,
  proposedLine,
  lineFor,
  hooksFor,
  isFilmed,
  allMatchups,
} from "../js/kill-scripts.js";

const require = createRequire(import.meta.url);
const Roster = require("../js/roster.js");

const ids = Roster.allEntries().map((row) => row.entry.id);
const right = Roster.allEntries()
  .filter((row) => row.color === "w")
  .map((row) => row.entry.id);
const left = Roster.allEntries()
  .filter((row) => row.color === "b")
  .map((row) => row.entry.id);

test("every roster character has a voice, delivery, and line pack", () => {
  ids.forEach((id) => {
    assert.ok(LINES[id], "missing lines for " + id);
    assert.ok(VOICES[id], "missing voice for " + id);
    assert.ok(DELIVERY[id], "missing delivery for " + id);
    assert.ok(LINES[id].vs, "missing vs pack for " + id);
  });
});

test("every cross-house pair has five distinct hooks of mixed heat", () => {
  function check(k, v) {
    const hooks = hooksFor(k, v);
    assert.equal(hooks.length, 5, k + " vs " + v);
    const texts = hooks.map((h) => h.text);
    assert.equal(new Set(texts).size, 5, k + " vs " + v + " duplicates");
    texts.forEach((t) => assert.ok(t.length > 8, k + " vs " + v + " too short"));
    const heats = new Set(hooks.map((h) => h.heat));
    assert.ok(heats.has("hot"), k + " vs " + v + " needs a hot hook");
    assert.ok(heats.has("soft"), k + " vs " + v + " needs a soft hook");
  }
  right.forEach((k) => left.forEach((v) => check(k, v)));
  left.forEach((k) => right.forEach((v) => check(k, v)));
  assert.equal(allMatchups(Roster.allEntries()).length, right.length * left.length * 2);
});

test("filmed pawn lines stay the spoken ones", () => {
  assert.equal(isFilmed("maga", "activist"), true);
  assert.equal(isFilmed("activist", "maga"), true);
  assert.equal(isFilmed("aoc", "maga"), true);
  assert.equal(isFilmed("rfk", "activist"), true);
  assert.equal(isFilmed("trump", "aoc"), false);
  assert.equal(lineFor("maga", "activist"), "You're pronouns are: You, dead!");
  assert.equal(lineFor("activist", "maga"), "I am aborting you now!");
  assert.equal(lineFor("aoc", "maga"), "This will go viral, you are not");
  assert.equal(lineFor("rfk", "activist"), "I'll get rid of seed oils, and you");
});
