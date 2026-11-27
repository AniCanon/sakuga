import type { SakugaMessages } from '../../internal/words';

/** MediaCard's own words, in English. The app's `messages` and `t` still say them first. */
export const words = Object.freeze({
  "watched": "Watched",
  "watchedPercent": "watched {percent}%",
  "noCoverYet": "No cover yet"
} satisfies SakugaMessages);
