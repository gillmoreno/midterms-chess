/**
 * Click barks. A bark is a short line a piece says when you click it.
 * Distinct from taunts, which fire on check / capture / mate.
 *
 * Generated from studio/soundbites/assignments.json — edit there, or
 * hit "Save as click bark" in the studio player.
 */

export const BARKS = {
/*BARKS*/
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
