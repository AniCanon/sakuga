import type { SakugaMessages } from '../../internal/words';

/** CoverageTable's own words, in English. The app's `messages` and `t` still say them first. */
export const words = Object.freeze({
  "coverHas": "has one",
  "coverGap": "a scene needs one and nothing fits",
  "coverIdle": "not needed yet"
} satisfies SakugaMessages);
