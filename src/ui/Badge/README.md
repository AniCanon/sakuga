# Badge

Badge is a small label laid over artwork: a duration, a view count, or New.

## When to use

Use it for a small label over artwork (a duration, a view count, New) and, on a surface, a state such as rendering or one that waits for you.

- Not for narrowing a feed by kind: use `Chip`.
- Not for words the person keeps and removes: use `TagList`.
- Not for a state that changed, before and after: use `StateChange`.
- Not for the unread mark on the bell: use `IconButton`.

## How it works

- Only on artwork. It always sits on `badge-bg`, so it reads on any picture in either theme.
- Durations in m:ss, counts short ("1.2M views").
- `variant="new"` for a just-released issue or episode. One New badge per card at most.
- `variant="alert"` for a state that changed for the worse: a place burning or destroyed, a character dead. It fills with `badge-alert-bg`; use it for that one state, never for decoration.
- `icon` puts a 14 px glyph before the label. Use it when the state has a glyph of its own (a trait; Held a lock, Ransacked the chaos mark); a state the story set never takes the warning triangle, which is kept for the work, and a state with no glyph of its own goes without one; leave it off for durations and counts.
- On a surface, not over a picture: `variant="neutral"` for a state (rendering, setup not finished), `attention` for one that waits for you, `outline` for where something comes from (Ep 1, Short), `warning` for something worth a second look ("“Cell four” happens after it"): the outline badge in amber (`badge-warning`, the `warning` role), with the warning icon, in the colour the story map draws the same link. A warning is about the work, never a state in the story: Held, Ransacked and Dead stay `neutral` or `alert`. `dot` puts a dot before a state that is live.
- Over a picture (in a Thumb, a MediaCard or a LookPlate) those four draw as the default, on `badge-bg`, so a badge reads on any picture whatever its variant.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `variant` | `'default' \| 'new' \| 'alert' \| 'neutral' \| 'attention' \| 'outline' \| 'warning'` |  | Over art: the default, `new` (one per card at most) or `alert` (a state changed for the worse). On a surface: `neutral`, `attention` (waits for you), `outline` (where something comes from) or `warning`: amber ring and words, for something worth a second look, with words that say why. A warning is about the work, never a state in the story. |
| `dot` | `boolean` |  | A dot before a state that is live. |
| `icon` | `IconName` |  | A 14 px glyph before the label, for a state with a glyph of its own; never the warning triangle on a state. |
| `children` | `ReactNode` | required | The label: a duration in m:ss, a short count, a state. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { Badge } from '@anicanon/sakuga/ui';

export function BadgeExample() {
  return (
    <Badge>11:36</Badge>
  );
}
```

## Accessibility

Not focusable; its text is read in place. The dot and the icon are hidden, and `variant` changes only its colour. In forced colours every badge keeps an edge, and its dot stays visible.

Used on: Web, iOS, Android
Version: 1.2
