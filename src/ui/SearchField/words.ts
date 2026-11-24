import type { SakugaMessages } from '../../internal/words';

/** SearchField's own words, in English. The app's `messages` and `t` still say them first. */
export const words = Object.freeze({
  "searching": "Searching",
  "nothingMatches": "Nothing matches",
  "results": {
    "one": "{count} result",
    "other": "{count} results"
  },
  "searchResults": "{label} results",
  "clearSearch": "Clear search"
} satisfies SakugaMessages);
