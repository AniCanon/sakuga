import type { SakugaMessages } from '../../internal/words';

/** Cropper's own words, in English. The app's `messages` and `t` still say them first. */
export const words = Object.freeze({
  "crop": "Crop",
  "cropRole": "crop",
  "zoom": "Zoom",
  "cropHint": "Drag to move · scroll or pinch to zoom",
  "cropHintFixed": "Drag to move",
  "cropZoom": "zoom {times} times",
  "cropRegionZoom": "{region}, zoom {times} times"
} satisfies SakugaMessages);
