import type { SakugaMessages } from '../../internal/words';

/** StoryMap's own words, in English. The app's `messages` and `t` still say them first. */
export const words = Object.freeze({
  "notPlaced": "not placed",
  "mapProposed": "proposed",
  "mapWarning": "a link with a warning",
  "mapNew": "new",
  "mapHubs": "Hubs: cast and places",
  "storyMap": "Story map: characters and places as hubs, events between them",
  "fitMap": "Fit the map",
  "mapZoom": "Zoom",
  "mapKey": "Key",
  "mapOverview": "The whole map, with the part in view framed",
  "mapMovable": "movable",
  "mapPlace": "Place",
  "heldMore": "{count} more",
  "showHeldMore": "Show {count} more: {names}"
} satisfies SakugaMessages);
