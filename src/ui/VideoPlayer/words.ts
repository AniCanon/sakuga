import type { SakugaMessages } from '../../internal/words';

/** VideoPlayer's own words, in English. The app's `messages` and `t` still say them first. */
export const words = Object.freeze({
  "playAgain": "Play {name} again",
  "videoNamed": "{name}, video",
  "seekIn": "Seek in {name}",
  "fullScreen": "Full screen",
  "loadingItem": "Loading {name}"
} satisfies SakugaMessages);
