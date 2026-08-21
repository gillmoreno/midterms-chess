/** Chamber SFX. Web Audio only — nothing is hosted or fetched. */

let ctx = null;
let muted = false;

try {
  muted = localStorage.getItem("floor-vote-sfx") === "off";
} catch (_) {}

function ac() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

export function unlockFx() {
  return ac();
}

export function isMuted() {
  return muted;
}

export function setMuted(on) {
  muted = !!on;
  try {
    localStorage.setItem("floor-vote-sfx", muted ? "off" : "on");
  } catch (_) {}
}

function envGain(ctx, start, peak, dur) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(peak, start + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  return g;
}

function noiseBuf(ctx, seconds) {
  const n = Math.max(1, Math.floor(ctx.sampleRate * seconds));
  const buf = ctx.createBuffer(1, n, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < n; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

function burst(ctx, start, spec) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf(ctx, spec.noiseDur || 0.08);
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = spec.noiseHz;
  bp.Q.value = spec.q || 2.2;
  const ng = envGain(ctx, start, spec.noiseGain, spec.dur);
  src.connect(bp);
  bp.connect(ng);
  ng.connect(ctx.destination);
  src.start(start);
  src.stop(start + spec.dur + 0.02);

  const osc = ctx.createOscillator();
  osc.type = spec.wave || "triangle";
  osc.frequency.setValueAtTime(spec.freq, start);
  osc.frequency.exponentialRampToValueAtTime(Math.max(40, spec.freq * spec.drop), start + spec.dur);
  const og = envGain(ctx, start, spec.toneGain, spec.dur);
  osc.connect(og);
  og.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + spec.dur + 0.02);
}

function play(kind) {
  if (muted) return;
  const ctx = ac();
  const t = ctx.currentTime;
  if (kind === "select") {
    burst(ctx, t, {
      freq: 920,
      drop: 0.55,
      dur: 0.07,
      toneGain: 0.045,
      noiseHz: 2400,
      noiseGain: 0.07,
      noiseDur: 0.05,
      q: 3.2,
      wave: "sine",
    });
    return;
  }
  if (kind === "move") {
    burst(ctx, t, {
      freq: 210,
      drop: 0.42,
      dur: 0.14,
      toneGain: 0.09,
      noiseHz: 520,
      noiseGain: 0.11,
      noiseDur: 0.09,
      q: 1.6,
      wave: "triangle",
    });
    return;
  }
  burst(ctx, t, {
    freq: 140,
    drop: 0.35,
    dur: 0.18,
    toneGain: 0.11,
    noiseHz: 380,
    noiseGain: 0.14,
    noiseDur: 0.12,
    q: 1.2,
    wave: "sine",
  });
  burst(ctx, t + 0.04, {
    freq: 330,
    drop: 0.5,
    dur: 0.09,
    toneGain: 0.05,
    noiseHz: 1800,
    noiseGain: 0.08,
    noiseDur: 0.05,
    q: 2.4,
    wave: "triangle",
  });
}

export function playSelect() {
  play("select");
}

export function playMove() {
  play("move");
}

export function playCapture() {
  play("capture");
}

export function playCheck() {
  if (muted) return;
  const ctx = ac();
  const t = ctx.currentTime;
  burst(ctx, t, {
    freq: 880,
    drop: 0.7,
    dur: 0.16,
    toneGain: 0.08,
    noiseHz: 1600,
    noiseGain: 0.04,
    noiseDur: 0.08,
    q: 4,
    wave: "square",
  });
  burst(ctx, t + 0.12, {
    freq: 1175,
    drop: 0.75,
    dur: 0.2,
    toneGain: 0.09,
    noiseHz: 2200,
    noiseGain: 0.03,
    noiseDur: 0.06,
    q: 5,
    wave: "square",
  });
}

let clipEl = null;

export function playClip(src) {
  if (muted || !src) return;
  ac();
  if (!clipEl) clipEl = new Audio();
  clipEl.pause();
  clipEl.src = src;
  clipEl.currentTime = 0;
  clipEl.volume = 0.9;
  const p = clipEl.play();
  if (p && p.catch) p.catch(() => {});
}

export function stopClip() {
  if (!clipEl) return;
  clipEl.pause();
  clipEl.removeAttribute("src");
}
