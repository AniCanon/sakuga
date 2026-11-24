# TabBar

TabBar is the phone's main navigation: a floating glass capsule with four destinations and a separate round Create button.

## When to use

Use it for the phone's main navigation: four destinations (Home, Shorts, Manga, You) and the separate Create button.

- Not for navigation on desktop: use `TopNav`.
- Not for switching between views of the same thing: use `SegmentedControl`.
- Not for choices that belong to the current screen: use `Sheet`.

## How it works

- Exactly four items: Home, Shorts, Manga, You. The current item fills with `tabbar-item-active-bg`; the fill slides to a new item on `motion-base`.
- Create is separate from the destinations because it starts a task rather than going somewhere. Pass `onCreate={null}` to hide it.
- Float it 12px from the sides and above the home indicator; content scrolls under it.
- On iOS use the system tab bar with Liquid Glass and these four items, not a re-drawn copy.
- It stays silent, on the web and in the apps (README · Sound).

### The web form

- `variant="web"` is the phone browser's bar, below 768 px wide. The web has no glass and no system tab bar, so it's a solid bar at the page's foot.
- Five labelled items share the width: Home, Shorts, Manga, You, then Create. On the web, Create is a page (`createHref`); `createCurrent` marks it in the Studio shell.
- It's one solid colour (`bg-surface`) with a hairline above, and runs to the screen's foot. The home indicator's inset sits inside it. Safari 26 tints its own floating bar from the page near the edge, so the bar has no glass, no transparency and no transform.
- Put it as the last child of the page; it sticks to the foot. The page's viewport meta needs `viewport-fit=cover`.
- `hidden` takes it out of the box tree. Use it in the player, the reader and a short playing. It also hides itself while a phone's keyboard is up, because a fixed bar can stay offset after the keyboard closes.
- Search and the account sit in the phone header above, never in the bar.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `items` | `TabItem[]` | required | The app's main destinations, in order. |
| `items[].label` | `string` | required | The destination's name, under its icon. |
| `items[].icon` | `IconName` | required | Its icon. |
| `items[].href` | `string` |  | Where it goes. |
| `items[].current` | `boolean` |  | The destination open now. |
| `items[].onClick` | `MouseEventHandler<HTMLElement>` |  | Its press, when it has no `href`. |
| `variant` | `'web'` | required | The phone browser's solid bar at the page's foot, with Create as a fifth labelled item. The apps' glass capsule stays native and is not part of the web package (docs/PORTING.md · Not ported), so the port draws only this form. |
| `onCreate` | `MouseEventHandler<HTMLElement> \| null` |  | Create as an action; `null` hides it. |
| `createLabel` | `string` |  | Names the Create button (default "Create"). |
| `createHref` | `string` |  | Create's address: on the web, Create is a page. |
| `createCurrent` | `boolean` |  | Create is the current item (the Studio shell). |
| `hidden` | `boolean` |  | Leaves the box tree: the player, the reader, a short playing. It also hides itself while a phone's keyboard is up. |
| `label` | `string` |  | Names the bar for screen readers. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { TabBar } from '@anicanon/sakuga/ui';

export function PhoneWebTabs({ onCreate }: { onCreate: () => void }) {
  return (
    <TabBar
      variant="web"
      label="Main"
      onCreate={onCreate}
      items={[
        { label: 'Home', icon: 'home', href: '/', current: true },
        { label: 'Shorts', icon: 'shorts', href: '/shorts' },
        { label: 'Manga', icon: 'manga', href: '/manga' },
        { label: 'You', icon: 'you', href: '/you' },
      ]}
    />
  );
}
```

## Accessibility

A navigation named by `label` (default "Tabs"): Tab moves through each destination, a link read by its text with the current one marked "current page", then the round Create button, named by `createLabel` (default "Create"). In the web form Create is the fifth link, marked "current page" when `createCurrent`. An item with no address is a button. Icons are hidden.

Used on: iOS, Android, web (phone)
Version: 1.1
