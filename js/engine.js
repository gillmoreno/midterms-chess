/** Client-side Stockfish 18 lite (WASM worker). Never talks to a server. */

const WORKER_URL = new URL(
  "../vendor/stockfish/stockfish-18-lite-single.js",
  import.meta.url
);

const LEVELS = [
  { skill: 0, depth: 1, movetime: 80 },
  { skill: 2, depth: 2, movetime: 150 },
  { skill: 5, depth: 3, movetime: 250 },
  { skill: 8, depth: 4, movetime: 350 },
  { skill: 11, movetime: 450 },
  { skill: 13, movetime: 600 },
  { skill: 15, movetime: 800 },
  { skill: 17, movetime: 1100 },
  { skill: 19, movetime: 1500 },
  { skill: 20, movetime: 2200 },
];

function parseBest(line) {
  const m = /\bbestmove\s+([a-h][1-8][a-h][1-8]([qrbn])?)/i.exec(line);
  if (!m) return null;
  const u = m[1].toLowerCase();
  return {
    from: u.slice(0, 2),
    to: u.slice(2, 4),
    promo: u.length > 4 ? u[4] : null,
  };
}

export function createEngine() {
  let worker = null;
  let boot = null;
  let waiters = [];

  function onLine(line) {
    if (typeof line !== "string") return;
    waiters.slice().forEach((w) => w(line));
  }

  function send(cmd) {
    if (worker) worker.postMessage(cmd);
  }

  function until(pred, ms) {
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => {
        waiters = waiters.filter((w) => w !== on);
        reject(new Error("engine timeout"));
      }, ms);
      function on(line) {
        if (!pred(line)) return;
        clearTimeout(t);
        waiters = waiters.filter((w) => w !== on);
        resolve(line);
      }
      waiters.push(on);
    });
  }

  async function ready() {
    if (boot) return boot;
    boot = (async () => {
      worker = new Worker(WORKER_URL);
      worker.onmessage = (e) => onLine(e.data);
      worker.onerror = () => {};
      send("uci");
      await until((l) => l === "uciok" || /\buciok\b/.test(l), 20000);
      send("setoption name Hash value 16");
      send("isready");
      await until((l) => l === "readyok" || /\breadyok\b/.test(l), 20000);
    })();
    return boot;
  }

  async function go(fen, level) {
    await ready();
    const spec = LEVELS[Math.max(0, Math.min(9, (level | 0) - 1))];
    const startTime = Date.now();
    const minThinkMs = 600 + Math.random() * 300; // 600-900ms human-feel delay
    send("stop");
    send("ucinewgame");
    send("setoption name Skill Level value " + spec.skill);
    send("isready");
    await until((l) => l === "readyok" || /\breadyok\b/.test(l), 8000).catch(() => {});
    send("position fen " + fen);
    if (spec.depth) send("go depth " + spec.depth + " movetime " + spec.movetime);
    else send("go movetime " + spec.movetime);
    const line = await until((l) => /\bbestmove\b/.test(l), spec.movetime + 8000);
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, minThinkMs - elapsed);
    if (remaining > 0) {
      await new Promise(res => setTimeout(res, remaining));
    }
    return parseBest(line);
  }

  function stop() {
    send("stop");
  }

  return { ready, go, stop, LEVELS };
}
