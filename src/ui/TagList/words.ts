import type { SakugaMessages } from '../../internal/words';

/** TagList's own words, in English. The app's `messages` and `t` still say them first. */
export const words = Object.freeze({
  "restoreItem": "Add back {name}",
  "itemRemoved": "{name} removed",
  "itemRestored": "{name} added back"
} satisfies SakugaMessages);
