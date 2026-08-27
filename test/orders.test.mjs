import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ORDERS, orderFor, pickOrder } from "../js/orders.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

test("a matchup with no order is silent", () => {
  assert.equal(orderFor("nobody", "harris"), null);
  assert.equal(orderFor("trump", null), null);
  assert.equal(pickOrder([], "x").order, null);
  assert.equal(pickOrder(undefined, "x").order, null);
});

test("pickOrder returns the only line", () => {
  const list = [
    { src: "assets/sfx/orders/trump-fired.mp3", line: "You are fired. Get out.", speaker: "trump", target: "harris" },
  ];
  const { order, lastSrc } = pickOrder(list, "");
  assert.equal(order.src, list[0].src);
  assert.equal(lastSrc, list[0].src);
});

test("orderFor looks up king then victim", () => {
  const src = fs.readFileSync(path.join(root, "js", "orders.js"), "utf8");
  assert.match(src, /attackerId \+ ":" \+ victimId/);
});

test("every assigned order file is on disk", () => {
  Object.values(ORDERS).forEach((list) => {
    list.forEach((o) => {
      assert.ok(fs.existsSync(path.join(root, o.src)), o.src);
      assert.ok(o.line && o.line.length > 0, "order needs a line");
      assert.ok(o.speaker, "order needs a speaker");
      assert.ok(o.target, "order needs a target");
    });
  });
});

test("studio cards assign Click / Captured / Order, not Keep / Skip", () => {
  const html = fs.readFileSync(path.join(root, "studio", "soundbites", "index.html"), "utf8");
  assert.match(html, /data-use="click"/);
  assert.match(html, /data-use="captured"/);
  assert.match(html, /data-use="order"/);
  assert.match(html, /data-use="reel"/);
  assert.doesNotMatch(html, />Keep</);
  assert.doesNotMatch(html, />Skip</);
  assert.match(html, /\/api\/use/);
});

test("capture playback can overlay an assigned order line", () => {
  const main = fs.readFileSync(path.join(root, "js", "main.js"), "utf8");
  const cine = fs.readFileSync(path.join(root, "js", "cinematic.js"), "utf8");
  assert.match(main, /orderFor/);
  assert.match(main, /audio: order\.src/);
  assert.match(cine, /clip\.audio/);
});
