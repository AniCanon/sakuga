import type { SakugaMessages } from '../../internal/words';

/** ScreenplayEditor's own words, in English. The app's `messages` and `t` still say them first. */
export const words = Object.freeze({
  "blockSlug": "Scene heading",
  "blockAction": "Action",
  "blockCue": "Character",
  "blockParen": "Parenthetical",
  "blockDialogue": "Dialogue",
  "blockTransition": "Transition",
  "screenplayHelp": "Enter starts the next block, Shift and Enter a new line in it, Tab changes its kind, @ and # name the cast and places. Escape, then Tab, leaves the script.",
  "blockNow": "{kind}",
  "screenplayScript": "Script"
} satisfies SakugaMessages);
