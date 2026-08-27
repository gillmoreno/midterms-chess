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
