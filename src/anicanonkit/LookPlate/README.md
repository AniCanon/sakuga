# LookPlate

One look as a 9:16 plate on white, standing head to toe as the portrait is drawn, with its occasion (`creature`: 16:9, as a creature is drawn).

## When to use

Use it for one look as a 9:16 plate on white with its occasion, in each of its states: ready, wearing, drawing, waiting for review, or the plate that adds one.

- Not for which occasions each character has a look for: use `CoverageTable`.
- Not for a plain picture in a frame: use `Thumb`.
- Not for the character as a whole: use `CharacterCard`.
- Not for choosing who wears a look: use `CastAvatar`.

## How it works

- States: ready, wearing, showing, review, new, drawing, add. Built only from core components and tokens; it lives in AniCanonKit, not the core.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `label` | `string` | required | The look's name. |
| `occasion` | `string` |  | What it is for ("Everyday", "Formal"). |
| `image` | `string` |  | The look's picture, once drawn. |
| `menu` | `CardMenu` |  | The look's own ⋯ in its corner, shown under the pointer or focus, opening a Menu: Wear (when it isn't worn), Open the sheets, Rename, Change occasion, Retake the portrait, and last, after a rule, Delete. Deleting the worn look asks what is worn instead. |
| `menu.label` | `string` |  |  |
| `menu.items` | `MenuProps['items']` | required |  |
| `menu.items[].label` | `string` | required |  |
| `menu.items[].icon` | `IconName` |  |  |
| `menu.items[].href` | `string` |  |  |
| `menu.items[].onClick` | `MouseEventHandler` |  |  |
| `menu.items[].tone` | `'danger'` |  | Can't be taken back (Delete): the danger tone. |
| `menu.items[].checked` | `boolean` |  | One choice among several: true draws a check at its end and it reads as checked; false reads as not checked. Left out, the item is an action. |
| `menu.items[].separated` | `boolean` |  | A rule before it, to set it apart. |
| `menu.items[].disabled` | `boolean` |  |  |
| `menu.open` | `boolean` |  |  |
| `creature` | `boolean` |  | A creature's look: a 16:9 frame (a character's is 9:16). |
| `placeholder` | `string` |  | No picture yet: what will fill it, under the silhouette. |
| `placeholderIcon` | `IconName` |  | The silhouette on an empty plate, on the canvas colour: the character's own age figure, age-adult by default; never a body-* build. |
| `state` | `'ready' \| 'wearing' \| 'showing' \| 'review' \| 'new' \| 'drawing' \| 'add'` |  | Where it stands: `ready`, `wearing` (the active look), `showing`, `review`, `new`, `drawing`, or `add` for the plate that adds one. |
| `href` | `string` |  | Where it leads; without it, a button that runs onClick. |
| `onClick` | `MouseEventHandler` |  | Runs when pressed and it has no `href`. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { LookPlate } from '@anicanon/sakuga/anicanonkit';

export function LookPlateExample() {
  return (
    <LookPlate label="Plaid" occasion="Everyday" state="drawing" />
  );
}
```

## Accessibility

A link with `href`, else a button that runs `onClick` (never a link to #), that Tab reaches and Enter follows, named by `label` and described by its tag (Review, New), its `occasion` and "Drawing" while it draws; Wearing and Showing plates are also announced as "current". With `menu`, its ⋯ is its own Tab stop after the plate, a button named "More for {label}" that says it opens a menu; it shows while the plate is under the pointer or holds focus, and always on a phone.

Used on: Web, iOS, Android
Version: 1.2
