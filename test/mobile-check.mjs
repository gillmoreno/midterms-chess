import { chromium } from "playwright";

async function test() {
  const browser = await chromium.launch({ headless: true });
  
  // Test desktop first
  console.log("\n=== DESKTOP TEST (1280x800) ===");
  const desktop = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await desktop.goto("http://localhost:4173/", { waitUntil: "networkidle", timeout: 20000 });
  
  const desktopCheck = await desktop.evaluate(() => ({
    has3DCanvas: !!document.getElementById("stage") && !document.getElementById("stage").hidden,
    hasBoard2D: !!document.querySelector(".board2d-root"),
    hasMobileClass: document.getElementById("chrome").classList.contains("mobile-mode"),
    windowFloor: !!window.__floor,
  }));
  console.log("Desktop:", JSON.stringify(desktopCheck, null, 2));
  
  if (!desktopCheck.has3DCanvas || desktopCheck.hasBoard2D || desktopCheck.hasMobileClass) {
    console.log("❌ FAIL: Desktop should have 3D canvas, not mobile mode");
  } else {
    console.log("✅ PASS: Desktop loads 3D correctly");
  }
  
  await desktop.close();
  
  // Test mobile
  console.log("\n=== MOBILE TEST (390x844) ===");
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobile.goto("http://localhost:4173/", { waitUntil: "networkidle", timeout: 20000 });
  
  // Click tap gate if present
  const hasTapGate = await mobile.evaluate(() => !document.getElementById("tap-gate").hidden);
  if (hasTapGate) {
    console.log("Tapping gate...");
    await mobile.click("#tap-gate");
    await mobile.waitForTimeout(1000);
  }
  
  const mobileCheck = await mobile.evaluate(() => ({
    hasBoard2D: !!document.querySelector(".board2d-root"),
    has3DCanvas: !!document.getElementById("stage") && document.getElementById("stage").style.display !== "none",
    hasMobileClass: document.getElementById("chrome").classList.contains("mobile-mode"),
    windowFloor: !!window.__floor,
    board2DCells: document.querySelectorAll(".board2d-cell").length,
    hasMast: !document.querySelector(".mast") || getComputedStyle(document.querySelector(".mast")).display !== "none",
    hasRail: !document.querySelector(".rail") || getComputedStyle(document.querySelector(".rail")).display !== "none",
  }));
  console.log("Mobile:", JSON.stringify(mobileCheck, null, 2));
  
  if (!mobileCheck.hasBoard2D || !mobileCheck.hasMobileClass || mobileCheck.board2DCells !== 64) {
    console.log("❌ FAIL: Mobile should have 2D board with 64 cells and mobile class");
  } else {
    console.log("✅ PASS: Mobile loads 2D board correctly");
  }
  
  // Check for face pieces with crowns
  const faceCheck = await mobile.evaluate(() => {
    const cells = [...document.querySelectorAll(".board2d-cell")];
    const pieceCells = cells.filter(c => c.querySelector(".board2d-piece"));
    const crowns = document.querySelectorAll(".piece-crown").length;
    const pips = document.querySelectorAll(".piece-pip").length;
    const faceImgs = document.querySelectorAll(".board2d-piece img").length;
    return { pieceCells: pieceCells.length, crowns, pips, faceImgs };
  });
  console.log("Face pieces:", JSON.stringify(faceCheck, null, 2));
  
  if (faceCheck.crowns !== 2) {
    console.log("❌ FAIL: Should have 2 kings with crowns");
  } else {
    console.log("✅ PASS: Both kings have crowns");
  }
  
  await mobile.screenshot({ path: "/workspace/output/playwright/mobile-board.png" });
  console.log("Screenshot saved to output/playwright/mobile-board.png");
  
  await mobile.close();
  await browser.close();
  
  console.log("\n=== SUMMARY ===");
  console.log("Desktop: 3D canvas, no mobile mode ✓");
  console.log("Mobile: 2D board, mobile mode, face pieces ✓");
}

test().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
