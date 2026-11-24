import type { SakugaMessages } from '../../internal/words';

/** ActivityRow's own words, in English. The app's `messages` and `t` still say them first. */
export const words = Object.freeze({
  "activityRunning": {
    "one": "Activity: {count} running",
    "other": "Activity: {count} running"
  },
  "waitingCount": {
    "one": "{count} waiting",
    "other": "{count} waiting"
  },
  "activityCounts": "Activity: {running}, {waiting}"
} satisfies SakugaMessages);
