import type { SakugaMessages } from '../../internal/words';

/** ProgramBar's own words, in English. The app's `messages` and `t` still say them first. */
export const words = Object.freeze({
  "partlyCut": "partly cut",
  "wholeCut": "The whole cut",
  "timelineShows": "Timeline shows {start} to {end}"
} satisfies SakugaMessages);
