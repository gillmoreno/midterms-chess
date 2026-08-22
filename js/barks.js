/**
 * Click barks. A bark is a short line a piece says when you click it.
 * Distinct from taunts, which fire on check / capture / mate.
 *
 * Generated from studio/soundbites/assignments.json — edit there, or
 * hit "Save as click bark" in the studio player.
 */

export const BARKS = {
  "harris": [
    { src: "assets/sfx/barks/kamala-coconut.mp3", line: "You think you just fell out of a coconut tree?" },
  ],
  "schumer": [
    { src: "assets/sfx/barks/schumer-whirlwind.mp3", line: "You have released the whirlwind." },
    { src: "assets/sfx/barks/schumer-gone-november.mp3", line: "You're gone in November." },
    { src: "assets/sfx/barks/schumer-not-on-our-watch.mp3", line: "Not on our watch." },
  ],
  "aoc": [
    { src: "assets/sfx/barks/aoc-devil.mp3", line: "This bill is a deal with the devil." },
    { src: "assets/sfx/barks/aoc-beat-them.mp3", line: "We are going to beat them." },
  ],
  "sanders": [
    { src: "assets/sfx/barks/bernie-youre-wrong.mp3", line: "You're wrong." },
  ],
  "buttigieg": [
    { src: "assets/sfx/barks/pete-data.mp3", line: "Do yourself a favor and look up the data." },
  ],
  "mamdani": [
    { src: "assets/sfx/barks/mamdani-his-name.mp3", line: "Let tonight be the final time I utter his name." },
  ],
  "trump": [
    { src: "assets/sfx/barks/trump-alone-fix.mp3", line: "I alone can fix it." },
  ],
  "vance": [
    { src: "assets/sfx/barks/vance-trash.mp3", line: "We're going to take out the trash\u2026 and the trash is named Kamala Harris." },
  ],
  "desantis": [
    { src: "assets/sfx/barks/desantis-never-surrender.mp3", line: "We will never, ever surrender to the woke mob." },
  ],
};

let lastSrc = "";

export function pickBark(list, previousSrc) {
  if (!list || !list.length) return { bark: null, lastSrc: previousSrc || "" };
  let i = Math.floor(Math.random() * list.length);
  if (list.length > 1 && list[i].src === previousSrc) i = (i + 1) % list.length;
  return { bark: list[i], lastSrc: list[i].src };
}

export function barkFor(pieceId) {
  const { bark, lastSrc: next } = pickBark(BARKS[pieceId], lastSrc);
  lastSrc = next;
  return bark;
}
