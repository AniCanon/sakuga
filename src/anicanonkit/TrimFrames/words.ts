import type { SakugaMessages } from '../../internal/words';

/** TrimFrames's own words, in English. The app's `messages` and `t` still say them first. */
export const words = Object.freeze({
  "trimIn": "In",
  "trimOut": "Out",
  "inFrame": "In frame",
  "outFrame": "Out frame",
  "inEarlier": "In a frame earlier",
  "inLater": "In a frame later",
  "outEarlier": "Out a frame earlier",
  "outLater": "Out a frame later",
  "trim": "Trim"
} satisfies SakugaMessages);
