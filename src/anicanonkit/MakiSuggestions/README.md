# MakiSuggestions

MakiSuggestions is what to ask Maki first, as rows that send on a press, phrased as the person would type them.

## When to use

Use it for the first things to ask, when nothing has been said yet in `MakiPanel`.

- Not for an answer Maki asks for: use `MakiCard` `choices`.
- Not for a filter or a toggle: use `Chip`.

## How it works

- Rows in the reply's size, parted by hairlines, each with the comment glyph and a chevron. Three or four, never a wall.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `items` | `string[]` | required | What to ask, phrased as the person would type it. Three or four. |
| `onPick` | `(suggestion: string) => void` |  | A row pressed, with its words. |
| `label` | `string` |  | The list's name for screen readers ("What to ask"). |

## Example

```tsx
import { MakiSuggestions } from '@anicanon/sakuga/anicanonkit';

export function MakiSuggestionsExample() {
  return (
    <MakiSuggestions label="What to ask" items={['Which issue matters most?', 'Why doesn’t the story hold up?', 'What happens to Mio next?']} />
  );
}
```

## Accessibility

A list named "What to ask"; each row is a button that sends its words.

Used on: Web, iOS, Android
Version: 1.0
