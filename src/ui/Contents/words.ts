import type { SakugaMessages } from '../../internal/words';

/** Contents' own words, in English. The app's `messages` and `t` still say them first. */
export const words = Object.freeze({
  "moreCount": {
    "one": "{count} more",
    "other": "{count} more"
  }
} satisfies SakugaMessages);
