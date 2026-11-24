import type { SakugaMessages } from '../../internal/words';

/** Stepper's own words, in English. The app's `messages` and `t` still say them first. */
export const words = Object.freeze({
  "stepOf": "Step {n} of {total}: {name}",
  "stepShown": "Step {n} of {total} · {name}",
  "stepDone": "Done:"
} satisfies SakugaMessages);
