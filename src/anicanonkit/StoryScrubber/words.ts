import type { SakugaMessages } from '../../internal/words';

/** StoryScrubber's own words, in English. The app's `messages` and `t` still say them first. */
export const words = Object.freeze({
  "inTheMomentShown": "in the moment shown",
  "toldEpisode": "Episode",
  "toldManga": "Manga",
  "toldShort": "Short",
  "toldStudio": "Studio",
  "eventsInOrder": "Events in story order",
  "marked": "marked",
  "arcs": "Arcs",
  "arcEvents": {
    "one": "{name}, {count} event",
    "other": "{name}, {count} events"
  },
  "notPlacedTitle": "Not placed",
  "notPlacedCount": "Not placed · {count}",
  "storyMoment": "Show the world at a moment in the story",
  "afterEvent": "After event {n} of {total}",
  "comparedWith": "compared with {name}",
  "earlierEvents": "Earlier events",
  "laterEvents": "Later events",
  "showEventsBy": "Show events told by",
  "filterAll": "All",
  "filterEpisodes": "Episodes",
  "filterManga": "Manga",
  "filterShorts": "Shorts",
  "atSameTimeAs": "at the same time as {list}",
  "sameTimeTitle": "{title}, at the same time as {list}",
  "andMore": "+{count}"
} satisfies SakugaMessages);
