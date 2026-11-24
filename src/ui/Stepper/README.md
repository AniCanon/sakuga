# Stepper

Where a person is in a short multi-step flow: done steps get a check, the current one fills.

## When to use

Use it for where a person is in a short flow of three to five steps, in the top bar of a full-screen flow; `variant="bar"` on a phone.

- Not for moving between the pages of a list: use `Pagination`.
- Not for a job's stages while it runs, with the time each took: use `Stages`.
- Not for how far something being made has come: use `Progress`.
- Not for what a character is ready with: use `Readiness`.

## How it works

- Use it in the top bar of a full-screen flow, three to five steps. Never for navigation between pages.
- Motion: moving on fills the line toward the next step on `motion-base`; the new current step settles in and a done step's check appears with `ease-enter`. `variant="bar"` is the phone's form: a segment per step under the title, then "Step 2 of 3 · Photos". `tone="media"` draws it over a camera.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `steps` | `string[]` | required | Step names, short nouns. |
| `current` | `number` | required | Index of the current step. |
| `label` | `string` |  | Accessible name, default "Steps". |
| `variant` | `'steps' \| 'bar'` |  | bar: the phone's form, a segment per step under the title. |
| `tone` | `'media'` |  | media: the bar drawn over a camera. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { Stepper } from '@anicanon/sakuga/ui';

export function StepperExample() {
  return (
    <Stepper steps={['Basics', 'Look', 'Voice', 'Approve']} current={3} />
  );
}
```

## Accessibility

Not focusable; an ordered list named by `label` (default "Steps"), each step read as its number and name, a done one as "Done:" and its name, and the current one marked "current step". With `variant` "bar" it is a progress bar named like "Step 2 of 4: Cast".

Used on: Web, iOS, Android
Version: 1.0
