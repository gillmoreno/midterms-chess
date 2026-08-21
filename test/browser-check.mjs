/**
 * Headless launch check: serve the page, assert it paints, drive one opening.
 */
import { createServer } from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const scratch = process.env.SCRATCH || path.join(root, "output", "playwright");
fs.mkdirSync(scratch, { recursive: true });

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".glb": "model/gltf-binary",
  ".json": "application/json",
  ".mp4": "video/mp4",
  ".mp3": "audio/mpeg",
};

function startServer() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      let urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
      if (urlPath === "/") urlPath = "/index.html";
      const filePath = path.join(root, urlPath.replace(/^\//, ""));
      if (!filePath.startsWith(root) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        res.writeHead(404);
        res.end("not found");
        return;
      }
      const ext = path.extname(filePath);
      res.writeHead(200, { "Content-Type": mime[ext] || "application/octet-stream" });
      fs.createReadStream(filePath).pipe(res);
    });
    server.listen(0, "127.0.0.1", () => {
      resolve({ server, port: server.address().port });
    });
  });
}

const lines = [];
function log(m) {
  lines.push(m);
  console.log(m);
}

let ok = true;

async function main() {
  const { server, port } = await startServer();
  const url = `http://127.0.0.1:${port}/`;
  log("Serving " + url);

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push(String(e)));

    await page.goto(url, { waitUntil: "networkidle", timeout: 20000 });
    await page.waitForFunction(() => window.Chess && window.Roster && window.__floor, null, {
      timeout: 10000,
    });
    await page.waitForTimeout(800);

    if (pageErrors.length) {
      ok = false;
      log("FAIL page errors: " + pageErrors.join(" | "));
    } else {
      log("OK: zero page errors");
    }

    const info = await page.evaluate(() => {
      const c = document.getElementById("stage");
      return {
        w: c.clientWidth,
        h: c.clientHeight,
        legal: window.Chess.allLegalMoves(window.Chess.createGame()).length,
        hintHidden: document.getElementById("file-hint").hidden,
      };
    });
    log(JSON.stringify(info));
    if (info.w < 400 || info.h < 300) {
      ok = false;
      log("FAIL canvas too small");
    }
    if (info.legal !== 20) {
      ok = false;
      log("FAIL opening legal count");
    }
    if (!info.hintHidden) {
      ok = false;
      log("FAIL file hint showing on http");
    }

    const hasPicker = await page.evaluate(() => !!document.getElementById("backdrops"));
    if (hasPicker) {
      ok = false;
      log("FAIL chamber picker should be gone");
    }

    const camHome = await page.evaluate(() => window.__floor.cam());
    await page.evaluate(() => window.__floor.pick(3, 7));
    const inspectAoc = await page.evaluate(() => {
      const card = document.getElementById("hover-card");
      return {
        name: document.getElementById("hover-name").textContent,
        note: document.getElementById("hover-note").textContent,
        inspectFlag: card.dataset.inspect,
        cam: window.__floor.cam(),
      };
    });
    log("inspect " + JSON.stringify({ name: inspectAoc.name, note: inspectAoc.note, flag: inspectAoc.inspectFlag }));
    if (inspectAoc.name !== "AOC" || inspectAoc.inspectFlag !== "1") {
      ok = false;
      log("FAIL inspect card did not open on the opponent queen");
    }
    if (
      Math.abs(inspectAoc.cam.x - camHome.x) > 0.01 ||
      Math.abs(inspectAoc.cam.y - camHome.y) > 0.01 ||
      Math.abs(inspectAoc.cam.z - camHome.z) > 0.01
    ) {
      ok = false;
      log("FAIL camera moved on inspect: " + JSON.stringify(inspectAoc.cam));
    } else {
      log("OK: inspect does not move the camera");
    }

    await page.evaluate(() => window.__floor.play("e2", "e4"));
    const after = await page.evaluate(() => window.__floor.status());
    if (after.turn !== "b" || after.moveCount !== 1) {
      ok = false;
      log("FAIL e4 did not switch turn: " + JSON.stringify(after));
    } else {
      log("OK: e2-e4 played, black to move");
    }

    await page.evaluate(() => window.__floor.play("d7", "d5"));
    const capturePending = page.evaluate(() => window.__floor.playLive("e4", "d5"));
    try {
      await page.waitForFunction(() => window.__floor.cine && !window.__floor.cine().hidden, {
        timeout: 5000,
      });
      const cine = await page.evaluate(() => window.__floor.cine());
      log("cine " + JSON.stringify(cine));
      if (cine.hidden || cine.side !== "right" || cine.line.indexOf("pronouns") < 0) {
        ok = false;
        log("FAIL pawn-take reel did not open as MAGA kill cam");
      } else {
        log("OK: MAGA kill cam on e4xd5");
      }
      await page.screenshot({ path: path.join(scratch, "pawn-cine.png") });
      await page.evaluate(() => window.__floor.skipCine());
      await capturePending;
      const cineAfter = await page.evaluate(() => window.__floor.cine());
      if (!cineAfter.hidden) {
        ok = false;
        log("FAIL kill cam stayed up after skip");
      }
      const afterCap = await page.evaluate(() => window.__floor.status());
      if (afterCap.turn !== "b" || afterCap.moveCount !== 3) {
        ok = false;
        log("FAIL after pawn take: " + JSON.stringify(afterCap));
      } else {
        log("OK: skip returns the board, black to move");
      }

      await page.click("#btn-new");
      await page.evaluate(() => {
        window.__floor.play("e2", "e4");
        window.__floor.play("e7", "e5");
        window.__floor.play("d2", "d4");
      });
      const leftCap = page.evaluate(() => window.__floor.playLive("e5", "d4"));
      await page.waitForFunction(() => window.__floor.cine && !window.__floor.cine().hidden, {
        timeout: 5000,
      });
      const leftCine = await page.evaluate(() => window.__floor.cine());
      log("left cine " + JSON.stringify(leftCine));
      if (leftCine.hidden || leftCine.side !== "left" || leftCine.line.indexOf("aborting") < 0) {
        ok = false;
        log("FAIL left pawn reel did not open");
      } else {
        log("OK: blue-hair kill cam on e5xd4");
      }
      await page.screenshot({ path: path.join(scratch, "pawn-cine-left.png") });
      await page.evaluate(() => window.__floor.skipCine());
      await leftCap;
      const camAfter = await page.evaluate(() => window.__floor.cam());
      if (
        Math.abs(camAfter.x - camHome.x) > 0.01 ||
        Math.abs(camAfter.y - camHome.y) > 0.01 ||
        Math.abs(camAfter.z - camHome.z) > 0.01
      ) {
        ok = false;
        log("FAIL camera moved after kill cam: " + JSON.stringify(camAfter));
      } else {
        log("OK: kill cam left the camera put");
      }

      await page.click("#btn-new");
      await page.evaluate(() => {
        window.__floor.play("e2", "e4");
        window.__floor.play("e7", "e5");
        window.__floor.play("g1", "f3");
        window.__floor.play("d7", "d6");
      });
      const knightTake = await page.evaluate(() => window.__floor.playLive("f3", "e5"));
      const afterKnight = await page.evaluate(() => ({
        cine: window.__floor.cine(),
        status: window.__floor.status(),
      }));
      log("knight take " + JSON.stringify({ ok: knightTake, ...afterKnight }));
      if (!knightTake || !afterKnight.cine.hidden) {
        ok = false;
        log("FAIL knight capture opened a pawn kill cam");
      } else {
        log("OK: named-piece captures stay off the kill cam");
      }

      await page.click("#btn-new");
      await page.evaluate(() => {
        window.__floor.play("e2", "e4");
        window.__floor.play("e7", "e5");
        window.__floor.play("d1", "h5");
        window.__floor.play("b8", "c6");
      });
      const checkPending = page.evaluate(() => window.__floor.playLive("h5", "e5"));
      await page.waitForFunction(() => window.__floor.taunt && !window.__floor.taunt().hidden, {
        timeout: 8000,
      });
      const taunt = await page.evaluate(() => window.__floor.taunt());
      log("taunt " + JSON.stringify(taunt));
      if (taunt.hidden || taunt.who !== "Trump" || taunt.kicker !== "Check" || !taunt.line) {
        ok = false;
        log("FAIL Trump check taunt did not show");
      } else {
        log("OK: Trump check taunt");
      }
      await page.screenshot({ path: path.join(scratch, "taunt-check.png") });
      await checkPending;

      await page.click("#btn-new");
      await page.evaluate(() => {
        window.__floor.play("e2", "e4");
        window.__floor.play("e7", "e5");
        window.__floor.play("g1", "f3");
        window.__floor.play("b8", "c6");
        window.__floor.play("f1", "b5");
        window.__floor.play("a7", "a6");
      });
      const takePending = page.evaluate(() => window.__floor.playLive("b5", "c6"));
      await page.waitForFunction(() => window.__floor.taunt && !window.__floor.taunt().hidden, {
        timeout: 8000,
      });
      const taken = await page.evaluate(() => window.__floor.taunt());
      log("capture taunt " + JSON.stringify(taken));
      if (taken.hidden || taken.who !== "Trump" || taken.kicker !== "Taken" || !taken.line) {
        ok = false;
        log("FAIL Trump capture taunt did not show");
      } else {
        log("OK: Trump capture taunt");
      }
      await page.screenshot({ path: path.join(scratch, "taunt-capture.png") });
      await takePending;

      await page.setViewportSize({ width: 390, height: 844 });
      await page.click("#btn-new");
      await page.evaluate(() => {
        window.__floor.play("e2", "e4");
        window.__floor.play("d7", "d5");
      });
      const mobileCap = page.evaluate(() => window.__floor.playLive("e4", "d5"));
      await page.waitForFunction(() => window.__floor.cine && !window.__floor.cine().hidden, {
        timeout: 5000,
      });
      await page.screenshot({ path: path.join(scratch, "pawn-cine-mobile.png") });
      await page.evaluate(() => window.__floor.skipCine());
      await mobileCap;
      log("OK: mobile kill cam screenshot");
    } catch (err) {
      ok = false;
      log("FAIL kill cam " + err.message);
      await capturePending.catch(() => {});
    }

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(url + "scripts.html", { waitUntil: "networkidle", timeout: 20000 });
    await page.waitForFunction(() => window.__scripts && window.Roster, null, { timeout: 8000 });
    const opening = await page.evaluate(() => ({
      pair: window.__scripts.pair(),
      line: window.__scripts.line(),
      rows: document.querySelectorAll("#ledger-body tr").length,
    }));
    log("scripts " + JSON.stringify(opening));
    if (opening.pair.killer !== "maga" || opening.pair.victim !== "activist") {
      ok = false;
      log("FAIL scripts room did not open on the filmed pawn pair");
    }
    if (!/pronouns/.test(opening.line || "")) {
      ok = false;
      log("FAIL filmed MAGA line missing");
    }
    if (opening.rows !== 162) {
      ok = false;
      log("FAIL expected 162 ledger rows, got " + opening.rows);
    }
    await page.click('.cast-card[data-id="aoc"]');
    await page.click('.cast-card[data-id="trump"]');
    await page.click(".takes");
    const aocTrump = await page.evaluate(() => ({
      pair: window.__scripts.pair(),
      line: window.__scripts.line(),
    }));
    log("aoc-trump " + JSON.stringify(aocTrump));
    if (aocTrump.pair.killer !== "aoc" || aocTrump.pair.victim !== "trump") {
      ok = false;
      log("FAIL could not stage AOC takes Trump");
    }
    if (!/billionaire/i.test(aocTrump.line || "")) {
      ok = false;
      log("FAIL AOC vs Trump line missing");
    }
    await page.screenshot({ path: path.join(scratch, "scripts-aoc-trump.png") });
    await page.click("#btn-try");
    const tryOpen = await page.evaluate(() => !document.getElementById("cine").hidden);
    if (!tryOpen) {
      ok = false;
      log("FAIL try cam did not open");
    }
    await page.screenshot({ path: path.join(scratch, "scripts-try.png") });
    await page.click("#cine-skip");

    const shot = path.join(scratch, "floor-vote.png");
    await page.screenshot({ path: shot, fullPage: true });
    log("screenshot " + shot);
    if (pageErrors.length) {
      ok = false;
      log("FAIL late page errors: " + pageErrors.join(" | "));
    }
  } catch (err) {
    ok = false;
    log("FAIL " + err.stack);
  } finally {
    if (browser) await browser.close();
    server.close();
  }

  fs.writeFileSync(path.join(scratch, "browser-check.log"), lines.join("\n"));
  if (!ok) process.exit(1);
}

main();
