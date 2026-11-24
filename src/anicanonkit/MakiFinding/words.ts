import type { SakugaMessages } from '../../internal/words';

/** MakiFinding's own words, in English. The app's `messages` and `t` still say them first. */
export const words = Object.freeze({
  "reopen": "Reopen",
  "keepOnPurposeAction": "Keep on purpose",
  "findingConflict": "Conflict",
  "findingWarning": "Warning",
  "findingEvents": {
    "one": "In {count} event",
    "other": "In {count} events"
  },
  "showFinding": "Show {title} on the map",
  "keptOnPurpose": "Kept on purpose",
  "keptBy": "Kept on purpose by {name} · {date}"
} satisfies SakugaMessages);
