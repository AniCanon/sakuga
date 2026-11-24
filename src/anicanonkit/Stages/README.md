# Stages

A job's stages in order, while it runs and after: done ones ticked with the time they took, the running one with AniCanon's loader, the rest numbered.

## When to use

Use it for a job's stages in order, while it runs and after: done ones with the time they took, the running one with AniCanon's loader, a failed one with why ("Designing the first look").

- Not for where a person is in a flow they step through: use `Stepper`.
- Not for what a character is ready with: use `Readiness`.
- Not for how far one job has come as a share: use `Progress`.
- Not for every running and finished job: use `ActivityPanel`.

## How it works

- A `failed` stage is ringed and says why in its text, in the creator's words; the stages after it wait.
- `size="sm"` on a phone.
- Say what each stage makes ("Designing the first look"), never the model or the provider.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `items` | `object[]` | required | The stages in order: what each makes (never the model), its state and its time; a `failed` one says why in its text. |
| `items[].title` | `string` | required |  |
| `items[].text` | `string` |  |  |
| `items[].state` | `'done' \| 'running' \| 'todo' \| 'failed'` |  |  |
| `items[].time` | `string` |  |  |
| `size` | `'md' \| 'sm'` |  | `sm` on a phone. |
| `label` | `string` |  | Names the list for screen readers. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { Stages } from '@anicanon/sakuga/anicanonkit';

export function MakingKiko() {
  return (
    <Stages
      label="Making Kiko"
      items={[
        { title: 'Face locked in', text: 'Studied the reference and drew the face sheet', state: 'done', time: '0:52' },
        { title: 'Designing the first look', text: 'Putting together the gray pinstripe dress', state: 'running', time: '0:31' },
        { title: 'Composing the identity sheet', text: 'The card every scene draws Kiko from', state: 'todo' },
      ]}
    />
  );
}
```

## Accessibility

Not focusable; an ordered list named by `label` (default "Stages"), each stage read as its title, with "done" or "failed" where it applies, then its text and time. The running one is marked "current step", and its loader says the title once when it appears.

Used on: Web, iOS, Android
Version: 1.0
