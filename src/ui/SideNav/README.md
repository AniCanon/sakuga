# SideNav

The creator sidebar: product, a switcher for the current workspace, grouped sections, a footer slot and the signed-in account at the bottom.

## When to use

Use it for the creator sidebar: the switcher for the current workspace, grouped sections and the signed-in account at the bottom.

- Not for the main sections a viewer moves between on desktop: use `TopNav`.
- Not for the views and scenes inside a production: use `ProductionNav`.
- Not for navigation on a phone: use `TabBar`.
- Not for the rail inside a production: use `ProductionNav` `collapsed`.

## How it works

- The account is always shown. The current item reads in ink weight with the small state dot beside its name: no fill, no edge.
- Motion: state changes fade with `motion-fast`; entrances use `motion-base` and `ease-enter`. Under the pointer an item's icon tilts by `motion-tilt` and grows to `scale-lift` over `motion-base` with `ease-enter`, and settles back as the pointer leaves; only the icon moves, and under reduced motion it stays still.
- The brand and switcher stay at the top and the footer slot and account at the bottom. Every item shows down to a 700 px tall window: below 820 px the gaps between the sidebar's parts and between groups close and the Fragments block reads on one row; below 740 px the sidebar's own padding, each group title's margin, the space between a group's rows and the switcher's and account's padding close too. Nothing folds away and no group hides. Shorter than that, the groups scroll on their own, with no line at the edges; the scroller leaves room for the focus ring, so a focused item scrolls into view with its ring whole.
- `compact` draws each item as its icon over its name in small type, as `ProductionNav`'s rail draws a view, and the current one keeps its dot at the sidebar's edge. The brand is its logo, the switcher the series' picture and the account its face; their names and the group titles stay for a screen reader. Pass the footer a small form (`FragmentBalance variant="pill"`).
- `collapsed` folds the sidebar to a 64 px column of icons, when the person wants the room: the brand is its logo, the switcher the series' picture, the groups part with a hairline instead of their titles, and each item is its icon alone. A tip names an item under the pointer or keyboard focus. The footer keeps its parts in small: the Fragments balance as its mark over the amount, Activity as its count. The fold button is a quiet icon button at the end of the brand row, never a row of the list, so it costs the groups no height: the `sidebar` icon with the tip "Show icons only", folded "Show the full menu", where it sits under the logo. The page keeps the choice, so the menu stays as the person left it.
- `switcher.onClick` and `switcher.open` (whether its list is open) make the switcher work; `account.onClick` makes the account button work.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `brand` | `object` |  | The product at the top: its logo, name, product line and where it leads. |
| `brand.logo` | `string` |  |  |
| `brand.name` | `string` |  |  |
| `brand.product` | `string` |  |  |
| `brand.href` | `string` |  |  |
| `switcher` | `object` |  | The current series or workspace. Without `image` the picture's place is kept with Thumb's placeholder and the label's initial. |
| `switcher.label` | `string` | required |  |
| `switcher.image` | `string` |  | Without it the switcher keeps the picture's place with Thumb's placeholder and the label's initial. |
| `switcher.prefix` | `string` |  | Default "Series". |
| `switcher.open` | `boolean` |  | Whether its list is open. |
| `switcher.controls` | `string` |  | The id of what it opens. |
| `switcher.onClick` | `MouseEventHandler` |  |  |
| `groups` | `object[]` | required | An item with href is a link; without, a button that runs its onClick. |
| `groups[].title` | `string` |  |  |
| `groups[].items` | `object[]` | required |  |
| `groups[].items[].label` | `string` | required |  |
| `groups[].items[].icon` | `IconName` |  |  |
| `groups[].items[].current` | `boolean` |  |  |
| `groups[].items[].href` | `string` |  |  |
| `groups[].items[].onClick` | `MouseEventHandler` |  |  |
| `account` | `object` | required | Always pass it. |
| `account.name` | `string` | required |  |
| `account.handle` | `string` |  |  |
| `account.image` | `string` |  |  |
| `account.onClick` | `MouseEventHandler` |  |  |
| `label` | `string` |  | Default "Sections". |
| `children` | `ReactNode` |  | The footer slot, above the account. |
| `compact` | `boolean` |  | The narrow window's sidebar (the page sets it below 1200 px): each item its icon over its name, the brand its logo, the switcher its picture, the account its face. |
| `collapsed` | `boolean` |  | Folded to its icons, a tip naming each; the page keeps the choice. |
| `onToggle` | `MouseEventHandler` |  | Shows the fold button, a row at the foot above the footer slot. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { SideNav } from '@anicanon/sakuga/ui';

export function StudioNav() {
  return (
    <SideNav
      brand={{ name: 'AniCanon', product: 'Studio' }}
      switcher={{ label: 'EBA' }}
      groups={[
        { items: [{ label: 'Home', icon: 'home', href: '/' }] },
        { title: 'Make', items: [{ label: 'Studio', icon: 'image', href: '/studio', current: true }, { label: 'Cut', icon: 'film', href: '/cut' }] },
        { title: 'World', items: [{ label: 'Characters', icon: 'characters', href: '/characters' }, { label: 'Places', icon: 'place', href: '/places' }] },
      ]}
      account={{ name: 'Aiko Mori', handle: '@aiko' }}
    />
  );
}
```

## Accessibility

A complementary region named by `label` (default "Sections"); Tab moves through the brand link (without `brand.href`, the name alone), the fold button, the series switcher ("Series: Ember Bay. Switch", expanded or collapsed from `switcher.open`, running `switcher.onClick`, controlling `switcher.controls`), the links of a navigation named "Sections navigation" (each group named by its title, the current link "current page"; an item without `href` is a button running its `onClick`), the footer slot (`children`) and the account button ("Your account, Aiko Mori", running `account.onClick`). Icons and pictures are hidden. The fold button is named for what it does next ("Show icons only", "Show the full menu"). Folded, every name stays for a screen reader and the tip shows it on focus. Compact keeps every name: the switcher and the account are named as above, each item by its name under its icon, and the group titles stay as the groups' names.

Used on: Web
Version: 1.7
