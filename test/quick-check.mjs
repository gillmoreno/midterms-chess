import { chromium } from "playwright";

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  
  page.on("console", msg => console.log("BROWSER:", msg.text()));
  page.on("pageerror", err => console.log("ERROR:", String(err)));
  
  try {
    await page.goto("http://localhost:4173/", { waitUntil: "networkidle", timeout: 20000 });
    console.log("Page loaded");
    
    const status = await page.evaluate(() => ({
      chess: !!window.Chess,
      roster: !!window.Roster,
      floor: !!window.__floor,
      canvas: !!document.getElementById("stage"),
      board2d: !!document.querySelector(".board2d-root"),
    }));
    console.log("Status:", JSON.stringify(status, null, 2));
    
    await page.waitForTimeout(3000);
    
    const status2 = await page.evaluate(() => ({
      chess: !!window.Chess,
      roster: !!window.Roster,
      floor: !!window.__floor,
    }));
    console.log("After 3s:", JSON.stringify(status2, null, 2));
    
  } catch (err) {
    console.error("Test failed:", err.message);
  } finally {
    await browser.close();
  }
}

test();
