import type { SakugaMessages } from '../../internal/words';

/** Revision's own words, in English. The app's `messages` and `t` still say them first. */
export const words = Object.freeze({
  "removedPrefix": "Removed:",
  "addedPrefix": "Added:"
} satisfies SakugaMessages);
