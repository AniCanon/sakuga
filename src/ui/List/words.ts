import type { SakugaMessages } from '../../internal/words';

/** List's own words, in English. The app's `messages` and `t` still say them first. */
export const words = Object.freeze({
  "rowMoved": "{name} moved to {n} of {total}",
  "rowMoveHelp": "Up and Down, or Alt with Up and Down, move it a place; drag the handle to move it further"
} satisfies SakugaMessages);
