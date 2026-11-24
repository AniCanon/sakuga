import type { SakugaMessages } from '../../internal/words';

/** Pagination's own words, in English. The app's `messages` and `t` still say them first. */
export const words = Object.freeze({
  "pageNumber": "Page {n}",
  "pageOf": "Page {n} of {total}",
  "previousPage": "Previous page",
  "nextPage": "Next page",
  "pages": "Pages",
  "rangeOf": "{from}–{to} of {total}",
  "rangeOfNoun": "{from}–{to} of {total} {noun}"
} satisfies SakugaMessages);
