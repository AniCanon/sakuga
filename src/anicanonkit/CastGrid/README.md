# CastGrid

A faction's cast as `CastCard`s, six across on desktop.

## When to use

Use it for a faction's cast on the cast page: its `CastCard`s six across on desktop, each linking to the character's page.

- Not for one cast member on their own: use `CastCard`.
- Not for the faction's heading with its icon and count: use `SectionHeader`.
- Not for the characters on a series page: use `CastAvatar`.
- Not for episodes, shorts or issues in a grid: use `MediaCard`.

## How it works

- Pass `items`; each card links to the character's page. Head each grid with a `SectionHeader` carrying the faction's `icon` and `count`.
- A card is a link only when it has an `href`.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `items` | `CastCardProps[]` | required | The cast, one CastCard each, in order. |
| `items[].name` | `string` | required | The character's name; names the card's link. |
| `items[].image` | `string` |  | The approved portrait. Without one the card shows `placeholderIcon`, else `initial`. |
| `items[].initial` | `string` |  | Shown in the portrait's place until there is a picture or a figure. |
| `items[].menu` | `CardMenu` |  | Its own ⋯ in its corner, beside the card's link, opening a Menu (Delete for an unfinished character). |
| `items[].menu.label` | `string` |  |  |
| `items[].menu.items` | `MenuProps['items']` | required |  |
| `items[].menu.open` | `boolean` |  |  |
| `items[].placeholderIcon` | `IconName` |  | No portrait yet: the character's age figure (age-adult, anthro-age-*, creature-age-*) on the canvas colour, in place of the initial. |
| `items[].role` | `string` |  | A few words a viewer understands ("Leads the E.R.A."), under the name. |
| `items[].meta` | `string` |  | What they have ("2 looks"), at the foot when no action waits. |
| `items[].href` | `string` |  | Where the card leads: the character, or their creation while unfinished. |
| `items[].state` | `object` |  | A live fact about them: `attention` when it waits on the creator, `busy` while something is drawn. One at most. |
| `items[].state.label` | `string` | required |  |
| `items[].state.tone` | `'attention' \| 'busy'` |  |  |
| `items[].action` | `object` |  | The next step, across the card's foot: `attention` (review), `draft` (continue setup), `busy` with the loader and its `time`. One at most. |
| `items[].action.label` | `string` | required |  |
| `items[].action.tone` | `'attention' \| 'draft' \| 'busy'` |  |  |
| `items[].action.time` | `string` |  |  |
| `columns` | `number` |  | Cards to a row (default 6). |
| `label` | `string` |  | Names the grid for screen readers, e.g. the faction. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { CastGrid } from '@anicanon/sakuga/anicanonkit';

export function FactionCast({ kikoFace }: { kikoFace: string }) {
  return (
    <CastGrid
      label="E.R.A."
      items={[
        { name: 'Kiko', image: kikoFace, role: 'Leads the E.R.A.', meta: '2 looks', href: '/characters/kiko' },
        { name: 'Rick', initial: 'R', action: { label: 'Face sheet ready, review', tone: 'attention' }, href: '/characters/rick' },
        { name: 'Tattoo', initial: 'T', action: { label: 'Designing the look', tone: 'busy', time: '0:31' }, href: '/characters/tattoo' },
      ]}
    />
  );
}
```

## Accessibility

A list named by `label` with a card per item: a card with `href` is a link that Tab moves to and Enter follows, named by the character's name, and a card without one is not a link.

Used on: Web, iOS, Android
Version: 1.0
