import type { SakugaMessages } from '../../internal/words';

/** MakiComposer's own words, in English. The app's `messages` and `t` still say them first. */
export const words = Object.freeze({
  "stop": "Stop",
  "mentionSomeone": "Mention someone or something",
  "replyCost": "{amount} a reply",
  "askMakiPlaceholder": "Ask Maki…",
  "messageToMaki": "Message to Maki",
  "attach": "Attach",
  "send": "Send",
  "makiContext": "Asking about",
  "makiAttached": "Attached",
  "fileAdding": "Adding…",
  "filePicture": "Picture",
  "fileVideo": "Video"
} satisfies SakugaMessages);
