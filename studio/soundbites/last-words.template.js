/**
 * Last words. A last word is the line a piece says when it gets taken.
 * Distinct from click barks, and from house taunts on check / mate.
 *
 * Generated from studio/soundbites/last-words.json — edit there, or
 * hit Captured on a card in the studio player.
 */

export const LAST_WORDS = {
/*LAST_WORDS*/
};

/** Shared lose bed per piece. Mute unless `baked`. Overlay a random onReel last word. */
export const LOSE_REELS = {
  harris: {
    src: "assets/cinematics/kamala-lose-mute.mp4",
    poster: "assets/cinematics/kamala-lose.jpg",
  },
  aoc: {
    src: "assets/cinematics/aoc-bartender.mp4",
    poster: "assets/cinematics/aoc-bartender.jpg",
    baked: true,
  },
};

export const FATE_KICKER = {
  captured: "Taken",
  fired: "Fired",
  jail: "Jailed",
  cancun: "Cancun",
  deported: "Deported",
};

let lastSrc = "";

export function pickLastWord(list, previousSrc) {
  if (!list || !list.length) return { word: null, lastSrc: previousSrc || "" };
  let i = Math.floor(Math.random() * list.length);
  if (list.length > 1 && list[i].src === previousSrc) i = (i + 1) % list.length;
  return { word: list[i], lastSrc: list[i].src };
}

export function lastWordFor(pieceId, opts) {
  const all = LAST_WORDS[pieceId];
  let list = all;
  if (opts && opts.reel && all && all.length) {
    const pool = all.filter((w) => w.onReel);
    if (pool.length) list = pool;
  }
  const { word, lastSrc: next } = pickLastWord(list, lastSrc);
  lastSrc = next;
  return word;
}

export function loseReelFor(pieceId) {
  return LOSE_REELS[pieceId] || null;
}

export function fateKicker(fate) {
  return FATE_KICKER[fate] || FATE_KICKER.captured;
}
