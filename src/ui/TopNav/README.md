# TopNav

TopNav is the desktop header: the AniCanon mark and wordmark, the main sections as text links, and search and account on the right.

## When to use

Use it for the desktop header: the AniCanon mark, up to five main sections (Home, Series, Shorts, Manga, Creators), search and the account.

- Not for navigation on a phone: use `TabBar`.
- Not for the creator's workspace sections: use `SideNav`.
- Not for the views inside a production: use `ProductionNav`.
- Not for the top bar of a full-screen flow: use `FlowHeader`.

## How it works

- Five links at most: Home, Series, Shorts, Manga, Creators. Mark the current one with `current`; it gets `aria-current="page"` and the `topnav-indicator` underline, which slides to a newly current link on `motion-base`.
- It sits on the page or over the hero's top scrim, never in a filled bar.
- Phones never show TopNav; they use TabBar.
- `actions` (a prop, or children with `slot="actions"`) sit before search and the account: the notifications bell, an `IconButton` with `attention` while something is unread.
- `onSearch` runs when Search is pressed and `account.onClick` when the account is; `search={false}` drops Search.
- A section link sets its own line height (`topnav-links-a-line-height`), so a real link draws the same inside a page with its own line height.
- `search` as an object searches in the bar: SearchField's props plus `open`, `onOpen` and `onClose`. Search calls `onOpen`; while `open`, the field takes the links' place, with Close search after it. Escape on an empty field calls `onClose`, and focus goes back to Search.
- The current link reads in ink weight with the state dot after it; nothing marks it with a line under it.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `brand` | `object` |  | The product at the start: its logo, name and where it leads. |
| `brand.logo` | `string` |  |  |
| `brand.name` | `string` |  |  |
| `brand.href` | `string` |  |  |
| `links` | `NavLink[]` | required | The main sections, in order. |
| `links[].label` | `string` | required | The section's name. |
| `links[].href` | `string` |  | Where it goes. |
| `links[].current` | `boolean` |  | The section open now. |
| `links[].onClick` | `MouseEventHandler` |  | Its press, when it has no `href`. |
| `actions` | `ReactNode` |  | Or children with slot="actions": they sit before search and the account. |
| `label` | `string` |  | Default "Main". |
| `className` | `string` |  | Extra class on the root element. |
| `account` | `object` |  | The account button; onClick runs when it is pressed. |
| `account.name` | `string` | required |  |
| `account.image` | `string` |  |  |
| `account.onClick` | `MouseEventHandler` |  |  |
| `create` | `object` |  | With href the Create button is a link; without, a button that runs onClick. |
| `create.label` | `string` |  |  |
| `create.href` | `string` |  |  |
| `create.onClick` | `MouseEventHandler` |  |  |
| `search` | `boolean \| (SearchFieldProps & { open?: boolean; onOpen?: () => void })` |  | false drops the Search button, which shows with an account or create. An object holds the bar's SearchField: Search calls onOpen, and while open the field takes the links' place with Close search (onClose) after it. |
| `onSearch` | `MouseEventHandler` |  | Runs when Search is pressed. |
| `children` | `ReactNode` |  | Only slot="actions" is read. |

## Example

```tsx
import { TopNav } from '@anicanon/sakuga/ui';

export function SiteHeader({ mark, face }: { mark: string; face: string }) {
  return (
    <TopNav
      brand={{ logo: mark, name: 'AniCanon', href: '/' }}
      links={[
        { label: 'Home', href: '/' },
        { label: 'Series', href: '/series', current: true },
        { label: 'Shorts', href: '/shorts' },
        { label: 'Manga', href: '/manga' },
      ]}
      account={{ name: 'Aiko Mori', image: face }}
    />
  );
}
```

## Accessibility

A header whose brand link reads the name (the logo is hidden; without `brand.href` the brand is the name alone, not a link), then a navigation named by `label` (default "Main") whose links mark the current page (a link without `href` is a button running its `onClick`, never a link to #); Tab moves through them, then the `actions`, then, when there is an account or Create, "Search" (running `onSearch`, or `search.onOpen`; while searching, the search landmark and "Close search" take the links' place and Search is gone), then Create and the account button ("Your account, Aiko Mori", running `account.onClick`).

Used on: Web
Version: 1.1
