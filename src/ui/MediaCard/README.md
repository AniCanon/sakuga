# MediaCard

MediaCard shows one episode, short or manga issue: its artwork at its real shape, then a title and a metadata line.

## When to use

Use it for one episode, short or manga issue: its art at its real shape (16:9, 9:16 or a manga page), its title and a metadata line.

- Not for a picture in a frame, such as a take or a library item: use `Thumb`.
- Not for an episode or an issue announced but not out yet: use `PremiereSlot`.
- Not for a page of an issue in the editor: use `MangaPage`.
- Not for a cast member on the cast page: use `CastCard`.

## How it works

- `kind` sets the frame: **episode** 16:9, **short** 9:16, **manga** 1:1.414 with a paper corner and a spine shadow. Never put one kind's art in another's frame.
- Continue watching passes `logo` (the series logo laid over the art) and `progress` (0–1).
- Shorts pass `duration` and `count`; episodes pass `duration`; manga pass `badge` for New.
- `meta` joins facts with a middle dot: "EBA · Season 1 · Episode 1". In a creator's list it says where the production is ("Cut · 3 takes", "14 Oct · 3.4K views"); `attention` marks the ones waiting for the creator with the accent dot, below the art, never over it.
- A linked card's frame sinks on press; the art leans in on hover and focus, and watched `progress` draws in when the card appears.
- `lightMap` is the art's baked light map: its own highlights glow where the pointer is, and at the centre under keyboard focus (light on art). It is on wherever there is a map; `light={false}` turns it off on a surface that must stay still.
- Give the card a width from the layout (a grid column or a fixed shelf width); the frame keeps its ratio.
- The corner follows the size: thumbnails 160px wide or less use `radius-sm`, 64px or less `radius-xs`, so a small frame never turns into a pill.
- With no `image` (a production with no cover yet), the card shows the AniCanon mark, quiet, in the middle of its surface: never words, never a broken picture.
- `menu` (`{ items }`, as a `Menu` takes them) gives the card its own ⋯ in a creator's list: Rename, and Delete in the danger tone set apart. It sits on the art's top corner on a media disc, beside the card's link and never inside it, and opens the menu under it; a short's `duration` moves to the art's foot so the ⋯ has the corner. Delete opens a `Dialog` that names what goes and what stays before anything is deleted.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `kind` | `'episode' \| 'short' \| 'manga'` | required | Sets the frame ratio: episode 16:9, short 9:16, manga 1:1.414. |
| `image` | `string` |  | The artwork. Leave it out while there is no picture: the frame draws the AniCanon mark. |
| `alt` | `string` |  | Names the artwork; decorative without it. |
| `imagePosition` | `string` |  | Where the art's subject sits, as CSS object-position, so the crop keeps it. |
| `lightMap` | `string` |  | The art's baked light map: it glows with its own highlights under the pointer, at its centre under keyboard focus (light on art). |
| `light` | `boolean` |  | On wherever there is a lightMap; false turns it off on a surface that must stay still. |
| `title` | `ReactNode` |  | The card's title, under the art. |
| `meta` | `ReactNode` |  | A quiet line under the title. |
| `duration` | `string` |  | m:ss, shown as a Badge. |
| `count` | `string` |  | A short's view count ("1.2M views"), as a Badge. |
| `badge` | `ReactNode` |  | A Badge over the art (manga pass New). |
| `logo` | `string` |  | The series logo laid over the artwork (Continue watching). |
| `logoAlt` | `string` |  | Names the series logo. |
| `progress` | `number` |  | 0–1 watched. |
| `attention` | `boolean` |  | The meta line says this one waits for you (takes to review, a plan to approve, ready to publish): it reads in the text colour with the accent dot. |
| `href` | `string` |  | Where it opens; without it the card reads as text. |
| `label` | `string` |  | The link's name, when its content in order does not say it. |
| `width` | `number \| string` |  | The card's width, in px or CSS; a small number px gives a smaller frame. |
| `menu` | `CardMenu` |  | Its ⋯ (Rename, Delete): on the picture's top corner, beside the card's link and never inside it, opening a Menu; a short's time moves to the picture's foot. |
| `menu.label` | `string` |  |  |
| `menu.items` | `MenuProps['items']` | required |  |
| `menu.items[].label` | `string` | required |  |
| `menu.items[].icon` | `IconName` |  |  |
| `menu.items[].href` | `string` |  |  |
| `menu.items[].onClick` | `MouseEventHandler` |  |  |
| `menu.items[].tone` | `'danger'` |  | Can't be taken back (Delete): the danger tone. |
| `menu.items[].separated` | `boolean` |  | A rule before it, to set it apart. |
| `menu.items[].disabled` | `boolean` |  |  |
| `menu.open` | `boolean` |  |  |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { MediaCard } from '@anicanon/sakuga/ui';

export function EpisodeCard({ still }: { still: string }) {
  return <MediaCard kind="episode" width={280} image={still} title="The Burning" meta="EBA · Season 1 · Episode 3" href="/series/eba/episodes/3" />;
}
```

## Accessibility

With `href` it is a link that Tab reaches and Enter follows, named by `label` if given, else by its content in order (any artwork and logo alt text, badge, duration, count, title, meta) ending with "waiting for you" when `attention` is set and "watched 40%" from `progress`; without `href` the same reads as text. The artwork's alt is `alt` and the logo's `logoAlt` (both empty by default), and the spine, scrim, light and progress bar are hidden. With `menu`, its ⋯ is a button after the link, named "More for" and the title, with a menu popup: Tab reaches it after the card.

Used on: Web, iOS, Android
Version: 1.2
