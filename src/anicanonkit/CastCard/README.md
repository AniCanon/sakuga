# CastCard

A cast member on the cast page: the portrait (an initial until one is approved), the role, the name, what they have, and what is happening to them now.

## When to use

Use it for one cast member on the cast page: the portrait, role and name, what they have, what is happening to them now, and the next step at its foot.

- Not for laying out a faction's cast: use `CastGrid`.
- Not for a character in a creation or editing flow: use `CharacterCard`.
- Not for a character's face and name in a row or on a series page: use `CastAvatar`.
- Not for a cast member a panel or a prompt holds: use `MentionChip`.

## How it works

- `state` is a live fact about them (`attention` when it waits on the creator, `busy` while something is drawn).
- `action` is the next step, across the card's foot: `attention` (review), `draft` (continue setup, centred like the quiet meta, as it has no mark), `busy` with the loader and the time it has run. Attention and busy keep their mark at the start.
- One state and one action at most. `CastGrid` lays a faction's cast six across.
- A card reads finished with only a face and a name: what it carries sits centred in the height its row gives it, and an action is pinned at its foot, so nothing floats over an empty band beside a card that carries more.
- Group by faction only when the series has factions: then cast without one comes last, under "No faction". A series with no factions shows one `CastGrid` with no headings.
- `placeholderIcon` draws the character's age figure on the canvas colour until there is a face; once a face is approved its avatar shows, look or no look.
- `menu` (`{ label, items }`) gives the card its own ⋯ in its corner, beside the card's link, never inside it, opening a `Menu`. An unfinished character carries one with its next step and, last after a rule, `Delete {name}` in the danger tone, which opens the delete `Dialog`.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `name` | `string` | required | The character's name; names the card's link. |
| `image` | `string` |  | The approved portrait. Without one the card shows `placeholderIcon`, else `initial`. |
| `initial` | `string` |  | Shown in the portrait's place until there is a picture or a figure. |
| `menu` | `CardMenu` |  | Its own ⋯ in its corner, beside the card's link, opening a Menu (Delete for an unfinished character). |
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
| `placeholderIcon` | `IconName` |  | No portrait yet: the character's age figure (age-adult, anthro-age-*, creature-age-*) on the canvas colour, in place of the initial. |
| `role` | `string` |  | A few words a viewer understands ("Leads the E.R.A."), under the name. |
| `meta` | `string` |  | What they have ("2 looks"), at the foot when no action waits. |
| `href` | `string` |  | Where the card leads: the character, or their creation while unfinished. |
| `state` | `object` |  | A live fact about them: `attention` when it waits on the creator, `busy` while something is drawn. One at most. |
| `state.label` | `string` | required |  |
| `state.tone` | `'attention' \| 'busy'` |  |  |
| `action` | `object` |  | The next step, across the card's foot: `attention` (review), `draft` (continue setup), `busy` with the loader and its `time`. One at most. |
| `action.label` | `string` | required |  |
| `action.tone` | `'attention' \| 'draft' \| 'busy'` |  |  |
| `action.time` | `string` |  |  |

## Example

```tsx
import { CastCard } from '@anicanon/sakuga/anicanonkit';

export function KikoCard({ kikoFace }: { kikoFace: string }) {
  return <CastCard href="/characters/kiko" name="Kiko" image={kikoFace} role="Leads the E.R.A." meta="2 looks" />;
}
```

## Accessibility

With `href` it is a link that Tab reaches and Enter follows, named by `name` and described by its role, meta, state and action; without `href` all of these read as text. With `menu`, its ⋯ is its own Tab stop after the card, a button named "More for {name}" that says it opens a menu and whether it is open. The portrait and the state dot are hidden, and a busy action's loader stays quiet inside the card.

Used on: Web, iOS, Android
Version: 1.2
