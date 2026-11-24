import type { SakugaMessages } from '../../internal/words';

/** QuestionRow's own words, in English. The app's `messages` and `t` still say them first. */
export const words = Object.freeze({
  "toldInTitle": "Told in {list}",
  "questionWaiting": "Waiting",
  "questionQuiet": "Quiet",
  "answered": "Answered",
  "notRaisedYet": "Not raised yet",
  "answerIt": "Answer it",
  "planted": "Planted",
  "raised": "Raised"
} satisfies SakugaMessages);
