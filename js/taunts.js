/** House taunts. MAGA lines are short cuts from Trump 2015-rally audio. */

function djt(file, line) {
  return { src: "assets/sfx/" + file, line, who: "Trump" };
}

export const TAUNTS = {
  check: {
    w: [
      djt("djt-nice.mp3", "They said I won the debate. Is that nice? Is that nice?"),
      djt("djt-terrible.mp3", "How can I be tied with this guy? He's terrible. He's terrible."),
      djt("djt-losers.mp3", "I don't like losers."),
      djt("djt-weakness.mp3", "I thought that was disgusting. That showed such weakness."),
      djt("djt-poker.mp3", "This is not exactly a poker player, folks."),
      djt("djt-one-percent.mp3", "You do have your 1%."),
    ],
    b: [],
  },
  mate: {
    w: [
      djt(
        "djt-grandmaster.mp3",
        "It's like a chess player grandmaster playing against a checkers child. No, that's what it is."
      ),
      djt("djt-polls.mp3", "The polls came out and said I won."),
      djt(
        "djt-crawl.mp3",
        "I would crawl quietly out. I'd probably tweet. I've decided to get out of the race."
      ),
    ],
    b: [],
  },
  capture: {
    w: [
      djt("djt-sit-down.mp3", "Sit down. Enough."),
      djt("djt-who-cares.mp3", "Who cares?"),
      djt("djt-never.mp3", "That will never happen with me."),
      djt(
        "djt-pictures.mp3",
        "Now here's the good news. They used the best pictures. I look so good in those pictures."
      ),
      djt("djt-ratings.mp3", "They call me the ratings machine."),
      djt("djt-energy.mp3", "More energy tonight. I like that."),
      djt("djt-handsome.mp3", "I look so handsome."),
      djt("djt-stupid.mp3", "Because they're stupid."),
    ],
  },
};

const HOLD_MS = { mate: 7800, check: 4500, capture: 3200 };

let lastSrc = "";

export function tauntFor(kind, color) {
  const pack = TAUNTS[kind];
  if (!pack) return null;
  const entry = pack[color];
  if (!entry) return null;
  const list = Array.isArray(entry) ? entry : [entry];
  if (!list.length) return null;
  let i = Math.floor(Math.random() * list.length);
  if (list.length > 1 && list[i].src === lastSrc) i = (i + 1) % list.length;
  lastSrc = list[i].src;
  return list[i];
}

export function tauntHoldMs(kind) {
  return HOLD_MS[kind] || 2800;
}
