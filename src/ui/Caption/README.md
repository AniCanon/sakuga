# Caption

Caption is one subtitle line drawn over video.

## When to use

Use it for one subtitle line over an episode or a short, at most two lines, centred above the player controls.

- Not for the quiet line that explains a heading or a field: use `Text`.
- Not for the caption tracks of a cut in the editor: use `Timeline`.
- Not for a planned line with its speaker and translation: use `DialogueLine`.

## How it works

- On by default for every episode and short; the viewer turns it off with the captions toggle.
- `size="lg"` (24px) in the desktop player, `md` (16px) on phone and in shorts.
- At most two lines, centred, above the player controls. The lines balance, so a two-line subtitle splits evenly instead of leaving one word on the second line.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `size` | `'lg' \| 'md'` |  | `lg` (24 px) in the desktop player, `md` (16 px) on a phone and in shorts. |
| `children` | `ReactNode` | required | The subtitle's words, at most two lines. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { Caption } from '@anicanon/sakuga/ui';

export function CaptionExample() {
  return (
    <Caption>To the people who did what I couldn’t do alone.</Caption>
  );
}
```

## Accessibility

Not focusable; read as a paragraph of text where it sits. It isn't a live region, so a new line is not announced as it changes.

Used on: Web, iOS, Android
Version: 1.0
