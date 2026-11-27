import type { SakugaMessages } from '../../internal/words';

/** ManuscriptSection's own words, in English. The app's `messages` and `t` still say them first. */
export const words = Object.freeze({
  "wordCount": {
    "one": "{count} word",
    "other": "{count} words"
  },
  "sameTimeAs": "At the same time as #{number} · {title}",
  "toldBetween": "Cut between them",
  "toldAfter": "One after the other",
  "notSameTime": "Not at the same time",
  "toldHow": "How the two are told: {told}"
} satisfies SakugaMessages);
