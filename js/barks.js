/**
 * Click barks. A bark is a short line a piece says when you click it.
 * Distinct from taunts, which fire on check / capture / mate.
 *
 * Generated from studio/soundbites/assignments.json — edit there, or
 * hit Click on a card in the studio player.
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
  "warren": [
    { src: "assets/sfx/barks/warren-wine-caves.mp3", line: "Billionaires in wine caves should not pick the next president." },
  ],
  "mamdani": [
    { src: "assets/sfx/barks/mamdani-his-name.mp3", line: "Let tonight be the final time I utter his name." },
  ],
  "trump": [
    { src: "assets/sfx/barks/trump-alone-fix.mp3", line: "I alone can fix it." },
    { src: "assets/sfx/barks/trump-obliterated.mp3", line: "Obliterated. The air force is gone. The navy is gone." },
  ],
  "vance": [
    { src: "assets/sfx/barks/vance-trash.mp3", line: "We're going to take out the trash\u2026 and the trash is named Kamala Harris." },
  ],
  "desantis": [
    { src: "assets/sfx/barks/desantis-never-surrender.mp3", line: "We will never, ever surrender to the woke mob." },
  ],
  "cruz": [
    { src: "assets/sfx/barks/cruz-cancun.mp3", line: "It was obviously a mistake." },
  ],
  "rubio": [
    { src: "assets/sfx/barks/rubio-yoga.mp3", line: "When they're done with the yoga, can I answer a question?" },
    { src: "assets/sfx/barks/rubio-diplomacy.mp3", line: "We're carrying out diplomacy all over the world constantly and very successfully." },
  ],
  "rfk": [
    { src: "assets/sfx/barks/rfk-adhd-focus.mp3", line: "I have ADHD. I had 11 siblings and I have seven kids. So I can work. I can focus." },
  ],
  "paul": [
    { src: "assets/sfx/barks/paul-deserve-apology.mp3", line: "Frankly, the American people deserve an apology." },
  ],
  "leavitt": [
    { src: "assets/sfx/barks/leavitt-stupid-question.mp3", line: "Of course the president supports peaceful protests. What a stupid question." },
  ],
  "newsom": [
    { src: "assets/sfx/barks/newsom-vs-maga-knee.mp3", line: "New knee pads that I'll be sending out for all these CEOs for bending their knee." },
    { src: "assets/sfx/barks/newsom-trex.mp3", line: "He's a T-Rex. You mate with him or he devours you." },
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

export function linesFor(pieceId) {
  return (BARKS[pieceId] || []).slice();
}
