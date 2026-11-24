# SegmentedControl

SegmentedControl switches between two to four views of the same thing: series sections, Following / For you, reading direction.

## When to use

Use it for switching between two to four views of the same thing (series sections, Following and For you), or a setting with two to four named values.

- Not for five options or more: use `Select`.
- Not for one setting that is on or off: use `Switch`.
- Not for narrowing a feed by kind: use `Chip`.
- Not for going to another part of the product: use `TabBar`.

## How it works

- 2–4 short options. More than four is a list, not a segment.
- **fill** on the page; **media** when it floats over artwork or video (the shorts feed), the same surface as IconButton `media`. `glass` is its old name and draws the same.
- With sound on, a new choice plays the choose sound, by press, key or slide; pressing the chosen segment is silent (README · Sound).
- The selected segment uses `segmented-item-active-bg`, drawn as one indicator that slides to the new segment on `motion-base`; each segment is a button with `aria-pressed`, inside a group named by `label`.
- With `onChange`, slide from the selected pill: it moves to the segment under the pointer, and letting go chooses that segment. It steps from segment to segment, rather than following the pointer exactly, so the label inside it always reads. A press still picks a segment.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `options` | `object[]` | required | The two to four views; each value is its label without one. |
| `options[].label` | `string` | required |  |
| `options[].value` | `string` |  |  |
| `value` | `string` | required | The one chosen. |
| `onChange` | `(value: string) => void` |  | Called with the value chosen. |
| `label` | `string` | required | Names the control. |
| `variant` | `'fill' \| 'media'` |  | media: over a picture or video, the same surface as IconButton media (the design's pages may still pass its old name, glass, which draws the same). |
| `fullWidth` | `boolean` |  | Takes its column's width. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { useState } from 'react';
import { SegmentedControl } from '@anicanon/sakuga/ui';

export function Feed() {
  const [feed, setFeed] = useState('For you');
  return <SegmentedControl label="Feed" value={feed} onChange={setFeed} options={[{ label: 'Following' }, { label: 'For you' }]} />;
}
```

## Accessibility

Tab focuses each option; Enter or Space picks it. A screen reader hears the group's `label`, then each option as a button, "pressed" when selected. Dragging the pill is for the pointer; Enter or Space on an option does the same.

Used on: Web, iOS, Android
Version: 1.1
