import type { SakugaMessages } from '../../internal/words';

/** ColorPicker's own words, in English. The app's `messages` and `t` still say them first. */
export const words = Object.freeze({
  "saturationBrightness": "Saturation and brightness",
  "saturationValue": "Saturation {s}%, brightness {v}%",
  "hue": "Hue",
  "hueValue": "Hue {h}°",
  "coloursInUse": "Colours in use",
  "fromThePicture": "From the picture"
} satisfies SakugaMessages);
