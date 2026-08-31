/**
 * Last words. A last word is the line a piece says when it gets taken.
 * Distinct from click barks, and from house taunts on check / mate.
 *
 * Generated from studio/soundbites/last-words.json — edit there, or
 * hit Captured on a card in the studio player.
 *
 * LOSE REELS: See .grok/skills/STYLE-GUIDE.md for visual consistency
 * (face/sculpt must match the desktop GLB, not a new super-caricature look).
 */

export const LAST_WORDS = {
  "trump": [
    { src: "assets/sfx/last-words/trump-pwmc.mp3", line: "Person. Woman. Man. Camera. TV.", fate: "captured" },
    { src: "assets/sfx/last-words/trump-no-responsibility.mp3", line: "I don't take responsibility at all.", fate: "fired" },
  ],
  "melania": [
    { src: "assets/sfx/last-words/melania-dont-care.mp3", line: "I want to show them that I don't care.", fate: "captured" },
  ],
  "mcconnell": [
    { src: "assets/sfx/last-words/mcconnell-let-me-finish.mp3", line: "Let me finish.", fate: "captured" },
    { src: "assets/sfx/last-words/mcconnell-eighth-time.mp3", line: "I will not seek this honor an eighth time.", fate: "captured" },
  ],
  "rubio": [
    { src: "assets/sfx/last-words/rubio-dispel.mp3", line: "Let's dispel with this fiction\u2026", fate: "captured" },
  ],
  "cruz": [
    { src: "assets/sfx/last-words/cruz-breathe.mp3", line: "Breathe, breathe, breathe.", fate: "captured" },
    { src: "assets/sfx/last-words/cruz-cancun.mp3", line: "It was obviously a mistake.", fate: "cancun" },
  ],
  "rfk": [
    { src: "assets/sfx/last-words/rfk-not-ideal.mp3", line: "I am not an ideal presidential candidate.", fate: "captured" },
  ],
  "vance": [
    { src: "assets/sfx/last-words/vance-boneheaded.mp3", line: "Oh man, my most boneheaded comment.", fate: "captured" },
  ],
  "desantis": [
    { src: "assets/sfx/last-words/desantis-never-surrender.mp3", line: "We will never, ever surrender to the woke mob.", fate: "captured" },
    { src: "assets/sfx/last-words/desantis-suspending.mp3", line: "I am today suspending my campaign.", fate: "captured" },
  ],
  "sanders": [
    { src: "assets/sfx/last-words/bernie-not-me-us.mp3", line: "Not me. Us.", fate: "captured" },
    { src: "assets/sfx/last-words/bernie-once-again.mp3", line: "I am once again asking for your financial support.", fate: "captured" },
  ],
  "schumer": [
    { src: "assets/sfx/last-words/schumer-not-on-our-watch.mp3", line: "Not on our watch.", fate: "captured" },
    { src: "assets/sfx/last-words/schumer-wrong-words.mp3", line: "I should not have used the words I used.", fate: "captured" },
  ],
  "harris": [
    { src: "assets/sfx/last-words/kamala-im-speaking.mp3", line: "I'm speaking. / Mr. Vice President, I'm speaking.", fate: "captured" },
    { src: "assets/sfx/last-words/kamala-coconut.mp3", line: "You think you just fell out of a coconut tree?", fate: "captured" },
    { src: "assets/sfx/last-words/kamala-unburdened.mp3", line: "What can be, unburdened by what has been.", fate: "captured" },
    { src: "assets/sfx/last-words/kamala-doac-troubling.mp3", line: "It's a troubling time.", fate: "captured", onReel: true },
    { src: "assets/sfx/last-words/kamala-doac-worse.mp3", line: "It may get worse before it gets better.", fate: "captured", onReel: true },
    { src: "assets/sfx/last-words/kamala-doac-different.mp3", line: "I do think about how different it could have been.", fate: "captured", onReel: true },
    { src: "assets/sfx/last-words/kamala-doac-shock.mp3", line: "I was in a state of shock.", fate: "captured" },
    { src: "assets/sfx/last-words/kamala-doac-my-god.mp3", line: "My God, my God, my God.", fate: "captured" },
    { src: "assets/sfx/last-words/kamala-doac-more-time.mp3", line: "I wish we had more time.", fate: "captured", onReel: true },
  ],
  "warren": [
    { src: "assets/sfx/last-words/warren-plan.mp3", line: "I have a plan for that.", fate: "captured" },
  ],
  "buttigieg": [
    { src: "assets/sfx/last-words/pete-quarrel.mp3", line: "Your quarrel, sir, is with my creator.", fate: "captured" },
  ],
  "mamdani": [
    { src: "assets/sfx/last-words/mamdani-volume.mp3", line: "Turn the volume up.", fate: "captured" },
    { src: "assets/sfx/last-words/mamdani-no-apology.mp3", line: "I refuse to apologize.", fate: "captured" },
  ],
  "newsom": [
    { src: "assets/sfx/last-words/newsom-bad-mistake.mp3", line: "I made a bad mistake.", fate: "captured" },
  ],
  "aoc": [
    { src: "assets/sfx/last-words/aoc-bartender.mp3", line: "I'm proud to be a bartender. Ain't nothing wrong with that.", fate: "fired", reel: "assets/cinematics/aoc-bartender.mp4", poster: "assets/cinematics/aoc-bartender.jpg", onReel: true },
  ],
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
