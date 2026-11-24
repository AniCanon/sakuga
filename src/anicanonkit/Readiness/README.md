# Readiness

What a character is ready with, at a glance on their page: looks, voice, face, props.

## When to use

Use it for what a character is ready with, at a glance on their page: looks, voice, face and props, each ticked or marked when it waits on the creator.

- Not for a job's stages in order, with their times: use `Stages`.
- Not for where a person is in a flow they step through: use `Stepper`.
- Not for who a character is: use `CharacterStats`.
- Not for wardrobe across the whole cast: use `CoverageTable`.

## How it works

- Each part is ticked, or marked when it waits on the creator, with a quiet line under it ("1 waiting on you", "Optional").

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `items` | `object[]` | required | What must be ready, each `done` or `attention`, with a short `detail`. |
| `items[].label` | `string` | required |  |
| `items[].detail` | `string` |  |  |
| `items[].state` | `'done' \| 'attention'` |  |  |
| `label` | `string` |  | Names the list for screen readers. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { Readiness } from '@anicanon/sakuga/anicanonkit';

export function KikoReadiness() {
  return (
    <Readiness
      items={[
        { label: '6 looks', detail: '1 waiting on you', state: 'attention' },
        { label: 'Voice cast', detail: 'Shounen Hero', state: 'done' },
        { label: 'Face sheet', detail: 'Plus 1 variant', state: 'done' },
        { label: 'No props', detail: 'Optional' },
      ]}
    />
  );
}
```

## Accessibility

Not focusable; a list named by `label` (default "Ready"), each item read as its label, then "ready" or "waiting for you", then its detail.

Used on: Web, iOS, Android
Version: 1.0
