# ManuscriptSection

ManuscriptSection is one numbered section of a scene note or an imported script: #number, title (or a slugline with `slug`), the prose, the word count.

## When to use

Use it for one numbered section of a scene note or an imported script: its number, title or slugline, the prose and the word count, with what was found in it in the margin.

- Not for one block of a screenplay inside it: use `ScreenplayLine`.
- Not for the whole page with its tools and status: use `Manuscript`.
- Not for something found in the words: use `ProposalCard`.
- Not for a shelf's heading: use `SectionHeader`.

## How it works

- What was found in it sits beside it in `slot="margin"` as `ProposalCard`s, so every proposal stays next to the words it came from.
- A hover card or selection toolbar goes in `slot="overlay"`.
- `with` (`{ number, title, told }`) says the scene happens at the same time as another: "At the same time as #4 · Toddy's bedroom · Cut between them" under its heading, and the rule beside the numbers runs on, unbroken, from that scene into this one (no hairline between them). How the two are told (`told`: "Cut between them" or "One after the other") is the app's words.
- `current` marks the section being written: its number takes the accent. No fill and no inset: on a `Manuscript` page the sections stay flush, ruled apart by hairlines.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `number` | `number` | required | The section's number in the script. |
| `title` | `string` |  | Its heading. |
| `slug` | `boolean` |  | Sets the title as a screenplay slugline (INT. SÉ STATION · NIGHT). |
| `words` | `number` |  | How many words it holds, shown beside the heading. |
| `current` | `boolean` |  | The section being written. |
| `with` | `object` |  | The scene this one happens at the same time as ("At the same time as #4 · Toddy's bedroom"), with how the two are told ("Cut between them"); the number rule runs on from that scene into this one. |
| `with.number` | `number` | required |  |
| `with.title` | `string` | required |  |
| `with.told` | `string` |  |  |
| `margin` | `ReactNode` |  | What sits beside the section (as slot="margin"). |
| `overlay` | `ReactNode` |  | A hover card or toolbar (as slot="overlay"). |
| `children` | `ReactNode` | required | The section's words: ScreenplayLines or paragraphs. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { ManuscriptSection } from '@anicanon/sakuga/anicanonkit';

export function ManuscriptSectionExample() {
  return (
    <ManuscriptSection number={1} title="The roof" words={34}>After the fire, Toddy wires a second watch for Lisa.</ManuscriptSection>
  );
}
```

## Accessibility

Not focusable; read as "#" and its number, the title as a level-3 heading, the prose and its word count ("240 words"), the section being written (`current`) is marked "current", and `with` reads as its line ("At the same time as #4 · Toddy's bedroom"). The margin's proposals follow in reading order.

Used on: Web
Version: 1.2
