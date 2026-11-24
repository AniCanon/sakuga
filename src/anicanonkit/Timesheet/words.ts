import type { SakugaMessages } from '../../internal/words';

/** Timesheet's own words, in English. The app's `messages` and `t` still say them first. */
export const words = Object.freeze({
  "videosToMake": "Videos to make",
  "atFrame": "at frame {n}",
  "framesFromTo": "frames {start} to {end}"
} satisfies SakugaMessages);
