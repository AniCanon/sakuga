# PremiereSlot

PremiereSlot holds the place of something that is announced but not out yet: the next episode, the next manga issue.

## When to use

Use it for something announced but not out yet: the next episode or the next manga issue, with its premiere time ("Premieres Friday · 21:00") and Remind me.

- Not for an episode, short or issue that is out: use `MediaCard`.
- Not for a frame of a production that is not made yet: use `Thumb`.
- Not for a place where there is nothing to show yet: use `EmptyState`.

## How it works

- The dashed `premiere-slot-border` says "not here yet"; the premiere time is the one `premiere-slot-when` accent.
- Times as day and 24-hour time: "Premieres Friday · 21:00".
- `compact` in sidebars and on phone. Remind me is an outline Button; pass `onRemind={null}` to hide it.
- Pass `image` when the release already has artwork (a series still or cover): it fills the frame, and the time moves above the title.
- Where the words would get less than `premiere-slot-body-basis` (120 px) beside the button, as on a phone or in a side column, Remind me moves to its own row at the end, so the title keeps its room. A title holds to two lines anywhere. Sized by its content, the slot stays on one row.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `when` | `string` | required | When it premieres, as day and 24-hour time ("Premieres Friday · 21:00"). |
| `title` | `string` | required | What is coming ("Episode 4"). |
| `image` | `string` |  | Artwork for the frame; without it the frame shows the time. |
| `subtitle` | `string` |  | A line under the title. |
| `compact` | `boolean` |  | The smaller slot, in sidebars and on a phone. |
| `onRemind` | `MouseEventHandler \| null` |  | null hides Remind me. |
| `remindLabel` | `string` |  | Names Remind me for screen readers; by default built from `title` ("Remind me when Episode 4 premieres"). |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { PremiereSlot } from '@anicanon/sakuga/anicanonkit';

export function PremiereSlotExample() {
  return (
    <PremiereSlot when="Premieres Friday · 21:00" title="Episode 2" subtitle="Title revealed at premiere" />
  );
}
```

## Accessibility

When, title and subtitle read as text and the picture is hidden. Tab reaches the Remind me button, announced by `remindLabel` or one built from `title` ("Remind me when Episode 4 premieres"), and Enter or Space runs `onRemind`.

Used on: Web, iOS, Android
Version: 1.0
