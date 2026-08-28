/**
 * Capture-order lines. The king says this when ordering a take of that victim.
 * Distinct from click barks and from the victim's last word.
 *
 * Generated from studio/soundbites/orders.json — edit there, or
 * hit Order on a card in the studio player.
 */

export const ORDERS = {
  "trump:harris": [
    { src: "assets/sfx/orders/trump-fired.mp3", line: "You are fired. Get out.", speaker: "trump", target: "harris" },
  ],
  "trump:aoc": [
    { src: "assets/sfx/orders/trump-vs-aoc-stupid.mp3", line: "She is stupid. On so many levels, stupid.", speaker: "trump", target: "aoc" },
  ],
  "trump:sanders": [
    { src: "assets/sfx/orders/trump-vs-sanders-crazy.mp3", line: "Crazy Bernie. He's crazy as a bedbug.", speaker: "trump", target: "sanders" },
  ],
  "trump:schumer": [
    { src: "assets/sfx/orders/trump-vs-schumer-cryin.mp3", line: "Cryin' Chuck Schumer. Fake tears Chuck Schumer.", speaker: "trump", target: "schumer" },
  ],
  "trump:warren": [
    { src: "assets/sfx/orders/trump-vs-warren-pocahontas.mp3", line: "Pocahontas. I call her Pocahontas.", speaker: "trump", target: "warren" },
  ],
  "trump:buttigieg": [
    { src: "assets/sfx/orders/trump-vs-pete-alfred.mp3", line: "Alfred E. Neuman cannot become president of the United States.", speaker: "trump", target: "buttigieg" },
  ],
  "trump:mamdani": [
    { src: "assets/sfx/orders/trump-vs-mamdani-communist.mp3", line: "This is a communist. Look at him.", speaker: "trump", target: "mamdani" },
  ],
};

let lastSrc = "";

export function pickOrder(list, previousSrc) {
  if (!list || !list.length) return { order: null, lastSrc: previousSrc || "" };
  let i = Math.floor(Math.random() * list.length);
  if (list.length > 1 && list[i].src === previousSrc) i = (i + 1) % list.length;
  return { order: list[i], lastSrc: list[i].src };
}

export function orderFor(attackerId, victimId) {
  if (!attackerId || !victimId) return null;
  const { order, lastSrc: next } = pickOrder(ORDERS[attackerId + ":" + victimId], lastSrc);
  lastSrc = next;
  return order;
}
