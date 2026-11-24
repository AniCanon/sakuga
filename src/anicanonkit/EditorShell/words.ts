import type { SakugaMessages } from '../../internal/words';

/** EditorShell's own words, in English. The app's `messages` and `t` still say them first. */
export const words = Object.freeze({
  "resizeTool": "Resize the tool panel",
  "resizeInspector": "Resize the inspector",
  "inspector": "Inspector"
} satisfies SakugaMessages);
