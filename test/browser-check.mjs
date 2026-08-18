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

    await page.evaluate(() => window.__floor.play("e2", "e4"));
    const after = await page.evaluate(() => window.__floor.status());
    if (after.turn !== "b" || after.moveCount !== 1) {
      ok = false;
      log("FAIL e4 did not switch turn: " + JSON.stringify(after));
    } else {
      log("OK: e2-e4 played, black to move");
    }

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
