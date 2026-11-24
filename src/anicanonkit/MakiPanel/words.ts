import type { SakugaMessages } from '../../internal/words';

/** MakiPanel's own words, in English. The app's `messages` and `t` still say them first. */
export const words = Object.freeze({
  "makiWaiting": "{count} to look at",
  "suggestions": "What to ask",
  "makiViews": "Maki views",
  "chat": "Chat",
  "reviewCount": "Review · {count}",
  "closeMaki": "Close Maki",
  "conversationWithMaki": "Conversation with Maki",
  "askMakiAboutStory": "Ask Maki about the story…",
  "makiHint": "@ to mention · explaining an issue is free",
  "whatMakiFound": "What Maki found"
} satisfies SakugaMessages);
