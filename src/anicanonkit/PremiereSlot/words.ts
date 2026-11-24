import type { SakugaMessages } from '../../internal/words';

/** PremiereSlot's own words, in English. The app's `messages` and `t` still say them first. */
export const words = Object.freeze({
  "remindMe": "Remind me",
  "remindMeWhen": "Remind me when {title} premieres"
} satisfies SakugaMessages);
