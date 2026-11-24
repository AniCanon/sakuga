# EventGlyph

EventGlyph is the mark of an event type, the same everywhere a story event appears: map, scrubber, rows, mentions, pickers.

## When to use

Use it for the mark of a story event's type wherever one appears (map, scrubber, rows, mentions, pickers): event, twist, revelation, clue or goal.

- Not for a glyph from the outline set: use `Icon`.
- Not for an event as a row with its state: use `EntityRow`.

## How it works

- event: a node on the story line, the plain beat. twist: the path swerves off, leaving a stub of the way it was going. revelation: a stage with its curtains tied back. clue: a puzzle piece. goal: a flag.
- They are drawn as the `Icon` set is, on the 24 grid with a 2 stroke and round caps and joins, so they sit beside it at one weight. Each reads by its outline alone, so the five stay apart at 10 px in a scrubber node.
- At 12 px and under, event draws its small cut, with the node filled, so the node doesn't close up.
- `tone="auto"` paints a plain event in the text colour and the other four in the accent. `muted` is for events outside the moment.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `type` | `EventType` | required | Which mark: event (a node on the story line), twist (the path swerves off), revelation (curtains tied back), clue (a puzzle piece), goal (a flag). |
| `size` | `number` |  | Its size in px; at 12 and under, event draws its small cut. |
| `tone` | `'auto' \| 'primary' \| 'accent' \| 'muted'` | `'auto'` | `auto` paints a plain event in the text colour and the other four in the accent; `muted` for events outside the moment. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { EventGlyph } from '@anicanon/sakuga/anicanonkit';

export function ClueMark() {
  return <EventGlyph type="clue" size={16} />;
}
```

## Accessibility

Decorative: hidden from screen readers, so the event type it draws is not announced.

Used on: Web
Version: 2.0
