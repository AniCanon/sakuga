import type { SakugaMessages } from '../../internal/words';

/** MangaPage's own words, in English. The app's `messages` and `t` still say them first. */
export const words = Object.freeze({
  "pageTitle": "Page",
  "framesDrawing": {
    "one": "{count} frame drawing",
    "other": "{count} frames drawing"
  },
  "framesWaiting": {
    "one": "{count} frame waiting",
    "other": "{count} frames waiting"
  },
  "redrawMarked": "the area to redraw marked",
  "itemSelected": "an item selected",
  "drawingNow": "Drawing…"
} satisfies SakugaMessages);
