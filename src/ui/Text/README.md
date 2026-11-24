# Text

Text sets words in Sakuga's type scale: a `variant` names the style, `tone` changes only its colour.

## When to use

Use it for words on a board or in a component, set in Sakuga's type scale: titles, body, the caption line that explains, a field's name, an eyebrow.

- Not for a subtitle line over video: use `Caption`.
- Not for an action inside a line of text: use `TextLink`.
- Not for a character or a place named inside prose: use `Mention`.
- Not for a proposed change in the words, the old struck and the new underlined: use `Revision`.
- Not for the heading that opens a shelf: use `SectionHeader`.

## How it works

- `title-1` to `title-4` (Funnel Display, 30 to 17 px), `body` (14/20), `label` (14/20 semibold), `caption` (13/18, the quiet line that explains), `small` (12/16), `micro` (12/16 bold, a field's name) and `eyebrow` (10.5/14 capitals, what kind of thing it is).
- `tone`: `primary`, `secondary`, `muted`, `accent`, and `on-media` or `on-media-muted` over a picture. Bold words inside body, caption and small read in the strong colour.
- With no variant it only sets a tone, inside other text. `numeric` lines figures up (timecodes, seconds).
- `mark` highlights the words a check flagged inside a sentence (the part of a prompt the story contradicts), or the words a person selected. Writing read by Maki takes a kind: `mark="stated"` (said in the text: a quiet fill), `mark="inferred"` (read between the lines: a dotted underline); a conflict keeps the plain `mark`.
- `as` picks the element; titles default to headings, body and caption to paragraphs, the rest to spans.
- Never set type by hand on a board or in a component: if a size is missing from the scale, it is missing from Sakuga.
- `display` (64 px) is a name that is the whole page, as a character's; `lead` (18/28) is the paragraph that introduces it. One of each per page at most.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `variant` | `TextVariant` |  | display: a name that is the page (64 px); lead: the paragraph that introduces it (18/28). |
| `tone` | `'primary' \| 'secondary' \| 'muted' \| 'accent' \| 'on-media' \| 'on-media-muted'` |  | Its colour: primary, secondary, muted, accent, or on-media and on-media-muted over art. |
| `numeric` | `boolean` |  | Tabular figures. |
| `mark` | `boolean \| 'stated' \| 'inferred'` |  | Highlights the words: what a check flagged or a selection (true); what writing states or implies ('stated', 'inferred'). |
| `as` | `ElementType` |  | The element it renders as (default by variant: p, span, a heading). |
| `id` | `string` |  | The root element's id. |
| `children` | `ReactNode` |  | The words. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { Text } from '@anicanon/sakuga/ui';

export function TextExample() {
  return (
    <Text variant="eyebrow">Script</Text>
  );
}
```

## Accessibility

Not focusable; read as text, with display and title variants rendered as headings (h1 to h3), lead, body and caption as paragraphs, and `mark` as highlighted text, unless `as` sets the element. `tone` changes only the colour.

Used on: Web, iOS, Android
Version: 1.0
