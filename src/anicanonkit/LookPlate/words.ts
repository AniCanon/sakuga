import type { SakugaMessages } from '../../internal/words';

/** LookPlate's own words, in English. The app's `messages` and `t` still say them first. */
export const words = Object.freeze({
  "lookWearing": "Wearing",
  "lookShowing": "Showing",
  "lookReview": "Review",
  "lookNew": "New",
  "drawingItem": "Drawing {name}",
  "review": "Review"
} satisfies SakugaMessages);
