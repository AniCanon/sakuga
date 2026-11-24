import type { SakugaMessages } from '../../internal/words';

/** CanvasStage's own words, in English. The app's `messages` and `t` still say them first. */
export const words = Object.freeze({
  "boxAt": "left {x}%, top {y}%, {w}% wide, {h}% tall",
  "boxKeys": "Arrow keys move it; Shift and an arrow key resize it.",
  "movableItem": "movable item",
  "selectedItem": "Selected item"
} satisfies SakugaMessages);
