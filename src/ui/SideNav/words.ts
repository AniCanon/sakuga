import type { SakugaMessages } from '../../internal/words';

/** SideNav's own words, in English. The app's `messages` and `t` still say them first. */
export const words = Object.freeze({
  "sections": "Sections",
  "sectionsNav": "{label} navigation",
  "collapseMenu": "Show icons only",
  "expandMenu": "Show the full menu",
  "series": "Series",
  "switchSeries": "{prefix}: {name}. Switch"
} satisfies SakugaMessages);
