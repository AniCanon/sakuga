# IconButton

IconButton is a circular control holding one icon, with a required accessible `label`.

## When to use

Use it for an action that one glyph says better than a word: back, share, like, captions, the bell.

- Not for an action whose meaning needs a word: use `Button`.
- Not for a glyph that only decorates: use `Icon`.
- Not for asking Maki: use `AskMaki`.

## How it works

- **solid** on desktop surfaces; **plain** inside a bar that already has a fill (player controls).
- **glass** only on iOS boards, for chrome floating over the page (back, share): it stands for the system glass the iOS app draws natively. Never on the web, phone web or Android, where floating chrome is `solid`, `plain` in a bar, or `media` over art. **media** over video or manga pages, which stays dark in both themes. Its hover darkens the glass to the strong scrim, still dark in both themes.
- `pressed` turns it into a toggle (`aria-pressed`); the pressed glyph takes `icon-button-pressed-fg` and settles in once when turned on. Use it for Like and Captions.
- Pressing sinks it to 90% on `motion-instant`; it settles back on `motion-fast`.
- With sound on, a press plays the press sound (README · Sound).
- 44px by default, `size="lg"` 52px for the desktop action rail.
- The label names the object: "Share EBA", "Next page", "Remind me about episode 2".
- With `href` it renders a link, for an icon that goes somewhere (Back, Open in Cut); without it, a button.
- **primary**: the one action as an icon alone, filled (a phone's floating New). One per screen.
- `attention`: something waits behind it, such as unread notifications on the bell. The state dot, the same one a current row and a waiting line use, sits on the glyph's upper corner. The label says how many: "Notifications, 3 new".

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `icon` | `IconName` |  | Leave out when passing custom children (the CC box). |
| `label` | `string` | required | Required accessible name, e.g. "Share EBA". |
| `variant` | `'solid' \| 'media' \| 'plain' \| 'primary'` |  | solid on desktop, media over video or pages, plain inside a bar, primary for the one action as an icon alone. |
| `size` | `'md' \| 'lg'` |  | `md` (44 px, default) or `lg` (52 px) for the desktop action rail. |
| `iconSize` | `number \| string` |  | Pixels, or a size token: SearchField's clear passes var(--search-clear-icon-size), where index.d.ts still says number. |
| `pressed` | `boolean` |  | Makes it a toggle (aria-pressed). A link is never a toggle: a pressed link is the current one (aria-current). |
| `attention` | `boolean` |  | Something waits behind it, e.g. unread notifications on the bell: the state dot on the glyph's corner. Say how many in the label. |
| `href` | `string` |  | Renders a link instead of a button, for an icon that goes somewhere (Back, Open in Cut). With disabled it stays a button. |
| `children` | `ReactNode` |  | Drawn in place of the icon (the CC box). |
| `className` | `string` |  | Extra class on the root element. |

Any other attribute of its root element (`aria-*`, `data-*`, `id`, event handlers) is passed on to it.

## Example

```tsx
import { IconButton } from '@anicanon/sakuga/ui';

export function IconButtonExample() {
  return (
    <IconButton icon="search" label="Search" />
  );
}
```

## Accessibility

A button (a link with `href`): Tab reaches it, Enter activates it, and Space does too on a button; the icon is hidden. Name it with `label`; without one it has no name, and with `pressed` set it is a toggle announced "pressed" or "not pressed". A link is never a toggle: a pressed link is said to be the current one (`aria-current`) and keeps the pressed look. With `href` and `disabled` it is a disabled button. In forced colours it keeps an edge, and pressed takes Highlight.

Used on: Web, iOS, Android
Version: 1.2
