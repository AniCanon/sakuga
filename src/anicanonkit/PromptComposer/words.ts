import type { SakugaMessages } from '../../internal/words';

/** PromptComposer's own words, in English. The app's `messages` and `t` still say them first. */
export const words = Object.freeze({
  "prompt": "Prompt",
  "mentionCast": "Cast",
  "mentionPlaces": "Places",
  "mentionReferences": "References",
  "mentionObjects": "Objects",
  "mentionMatching": "{group} · matching “{query}”",
  "outfitCount": {
    "one": "{count} outfit",
    "other": "{count} outfits"
  },
  "noOutfitYet": "no outfit yet",
  "outfitFor": "Outfit for {name}",
  "outfitDefault": "default",
  "placeViews": {
    "one": "{count} view",
    "other": "{count} views"
  },
  "placeOneView": "1 view · {name}",
  "outfitNote": "{name} can wear a different outfit each time you tag them in the same prompt."
} satisfies SakugaMessages);
