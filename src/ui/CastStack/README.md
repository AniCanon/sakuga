# CastStack

Who is in a take, at a glance: their faces overlapping, up to four, then +N for the rest.

## When to use

Use it for the people in a take, a clip or a scene at a glance, beside its name: up to four faces, then +N.

- Not for one person with their name and role: use `CastAvatar`.
- Not for choosing who is in something: use `CastAvatar` with `selected`.
- Not for who or what a prompt binds, with its note: use `MentionChip`.

## How it works

- Each face is ringed in the ground it sits on, so the overlap reads; screen readers hear the names.
- It sits beside a take's name in a library, a list or a picker, never on the picture.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `people` | `object[]` | required | Everyone in it, in order: a picture, or an initial until there is one. |
| `people[].name` | `string` | required |  |
| `people[].image` | `string` |  |  |
| `people[].initial` | `string` |  |  |
| `max` | `number` |  | Faces shown before +N. Default 4. |
| `size` | `number` |  | Each face, in px. Default 24. |
| `label` | `string` |  | Read by screen readers; the names by default. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { CastStack } from '@anicanon/sakuga/ui';

export function TakeCast({ kikoFace }: { kikoFace: string }) {
  return <CastStack people={[{ name: 'Kiko', image: kikoFace }, { name: 'Ken' }, { name: 'Lisa' }, { name: 'Smith' }, { name: 'Toddy' }]} />;
}
```

## Accessibility

Not focusable; read as one image named by `label`, or by every person's name joined ("Aiko, Ren and Mio"), including those past `max`. The faces and the "+N" are hidden behind that name.

Used on: Web, iOS, Android
Version: 1.0
