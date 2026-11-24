import type { SakugaMessages } from '../../internal/words';

/** ListRow's own words, in English. The app's `messages` and `t` still say them first. */
export const words = Object.freeze({
  "selectItem": "Select {name}",
  "moveRow": "Move {name}, {n} of {total}"
} satisfies SakugaMessages);
