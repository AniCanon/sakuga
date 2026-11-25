# ScreenplayLine

ScreenplayLine is one block of a screenplay inside a `ManuscriptSection`: `slug`, `action`, `cue` (with `extension` such as O.S.), `paren`, `dialogue`, `transition`.

## When to use

Use it for one block of a screenplay inside a section of the script: a slugline, action, a cue with its extension (O.S.), a parenthetical, dialogue or a transition.

- Not for a planned line with its delivery and translation: use `DialogueLine`.
- Not for a subtitle over video: use `Caption`.
- Not for a scene being written: use `ScreenplayEditor`, which types its blocks as these lines.

## How it works

- A speech (a `cue`, its `paren` and its `dialogue`) is one block on one left edge, set in from the action by `screenplay-speech-indent`: the name as a small caps label, the direction under it in the quiet ink, then the line at reading size. This is how the cut sheet shows dialogue; the print layout's three indents are not used on screen.
- `flagged` underlines a line Maki found a story conflict in.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `type` | `'slug' \| 'action' \| 'cue' \| 'paren' \| 'dialogue' \| 'transition'` |  | The block: a slugline, action, a character cue, a parenthetical, dialogue or a transition. |
| `extension` | `string` |  | A cue's extension (V.O., O.S.). |
| `flagged` | `boolean` |  | Underlines a line Maki found a story conflict in. |
| `children` | `ReactNode` |  | The block's words. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { ScreenplayLine } from '@anicanon/sakuga/anicanonkit';

export function ScreenplayLineExample() {
  return (
    <ScreenplayLine type="slug">INT. WHITE ROOM - NIGHT</ScreenplayLine>
  );
}
```

## Accessibility

Not focusable; the block reads as plain text, a cue followed by its extension in brackets ("(O.S.)"), and a `flagged` block ends with "story conflict".

Used on: Web
Version: 1.1
