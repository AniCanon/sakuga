# CastAvatar

CastAvatar shows a person: a character (a round portrait from their identity sheet), or a creator (an initial until they add a picture), with their name and a one-line role.

## When to use

Use it for a person with their name and a one-line role: a character's round portrait from their identity sheet, or a creator's initial until they add a picture.

- Not for a cast member on the cast page, with what they have and what is happening to them: use `CastCard`.
- Not for who or what a panel holds, with its @ or # mark and a note: use `MentionChip`.
- Not for a character as one card with stats and traits: use `CharacterCard`.
- Not for a character named inside prose: use `Mention`.
- Not for several people at a glance, overlapping: use `CastStack`.

## How it works

- `size="lg"` (104px) on the desktop series page, `md` (72px) on phone and in the player.
- The role is a few words a viewer understands ("Leads the E.R.A.", "Power of wind"), never internal production data.
- The portrait is decorative; the name is the label.
- Without an `image` it shows the `initial` in the same circle, until a portrait is approved.
- `selected` (true or false) makes it a choice: a ring and a check say it is chosen (who wears a look).
- `muted` dims the face: the character is no longer in the story at that moment (dead, gone).
- Under a small face (`sm`, `xs`) in a column, the name reads at 12 px and the name and role are cut to the cell, so a panel grid of four stays tidy; larger faces wrap their names.
- `layout="row"` puts a small portrait beside the name and role (the people in a character's life). `size` is `lg`, `md`, `sm` (44), `xs` (36) or a number of pixels.
- `imageStyle` (from `Sakuga.cropStyle`) shows a face not cut yet through the square it will be cut to: the avatar previews beside a `Cropper`.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `imageStyle` | `string` |  | From Sakuga.cropStyle: a face not cut yet, shown through the square it will be cut to, beside a Cropper. |
| `image` | `string` |  | The round portrait from their identity sheet; without it, `initial`. |
| `initial` | `string` |  | Shown in the circle until a portrait is approved. |
| `name` | `string` |  | Their name, the label; the portrait is decorative. |
| `role` | `string` |  | A one-line role a viewer understands ("Leads the E.R.A."). |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| number` |  | `lg` (104), `md` (72), `sm` (44), `xs` (36) or a number of px. |
| `layout` | `'row'` |  | `row` puts a small portrait beside the name and role. |
| `selected` | `boolean` |  | Makes it a choice: a ring and a check say it is chosen; it reads as pressed. |
| `muted` | `boolean` |  | No longer in the story at this moment: the face dims. |
| `onClick` | `MouseEventHandler` |  | Makes it a button. |
| `label` | `string` |  | The name when none is shown. |
| `href` | `string` |  | Makes it a link to their page. |
| `width` | `number \| string` |  | The column's width, in px or CSS, so names wrap or cut inside it. |
| `className` | `string` |  | Extra class on the root element. |
| `figure` | `ReactNode` |  |  |

## Example

```tsx
import { CastAvatar } from '@anicanon/sakuga/ui';

export function CastAvatarExample() {
  return (
    <CastAvatar name="Ken" role="Kiko's brother" width={120} />
  );
}
```

## Accessibility

With `selected` set it is a toggle button, "pressed" when selected; with `href` a link; with only `onClick` a button; otherwise plain text, and Tab reaches each of the three controls, Enter or Space pressing the buttons. Its name and role are read, `muted` adds "not in the story at this point", and the portrait, initial and check are hidden; without `name` it is named by `label`.

Used on: Web, iOS, Android
Version: 1.1
