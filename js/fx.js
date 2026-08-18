/** Unlock audio after a click so kill-cam video can play with sound. */

let ctx = null;

export function unlockFx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}
