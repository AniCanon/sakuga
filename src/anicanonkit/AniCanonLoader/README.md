# AniCanonLoader

AniCanon's loader is its mark: the ring traces once around in the accent while the crescent and the moon dot stay exactly where the logo has them.

## When to use

Use it wherever AniCanon waits on something whose length is unknown, generating or loading.

- In a drop zone, a frame or a button, never drawn by hand: set it as the app's loader and the part draws it.
- Not for work whose share done is known: use `Progress`.
- Not for a job's stages in order: use `Stages`.

## How it works

- Never move the crescent or the moon dot. It is AniCanon's loader everywhere AniCanon waits: card status bars, Activity rows, look plates, stages, and, set as the app's loader (`Sakuga.setLoader(AniCanonKit.Loader)` on a canvas, `<Sakuga loader={AniCanonKit.Loader}>` in the portal), every core part that waits: a busy button, a drop zone reading a file, a video loading, a frame being drawn. Built only from core tokens; it lives in AniCanonKit, not the core, whose `Loader` is Sakuga's own.
- Tokens: `--loader-arc` (accent), `--loader-mark` (currentColor), `--loader-track-opacity` (.2). On media surfaces the mark follows the text colour, so it stays light on dark art.
- Reduced motion: the arc stops and the mark stays visible as a static logo.
- `Sakuga.Loader` used to draw this mark; it is now the core loader. Boards that should show AniCanon's mark use `AniCanonKit.Loader`.

### Differs from the design

- The port draws what the design means where the design has a defect, until a version carries the fix.
- Inside a light island the design draws the loader invisible: `[data-theme]` sets the theme's tokens but no `color`, so a `[data-theme=light]` area in a dark page keeps the dark page's text colour, and the track and moon (`currentColor`) draw light on white. The port gives every island its theme's text colour (`[data-theme]{color:var(--text-primary)}` in base.css); base comes first, so a component's own colour still wins.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `size` | `number \| string` | `24` | Pixels, or a size token such as 'var(--button-icon-size)'. It reads down to 14. |
| `label` | `string` |  | Announced to screen readers. |
| `className` | `string` |  | Extra class on the root element. |
| `style` | `CSSProperties` |  | Inline style on the root element. |

## Example

```tsx
import { Loader } from '@anicanon/sakuga/anicanonkit';

export function AniCanonLoaderExample() {
  return (
    <Loader size={14} />
  );
}
```

## Accessibility

Not focusable. When it appears it says its `label` (default "Loading") once through the page's live region, unless it sits in a button, a link or a card, and in place it reads as a status of that name; the mark is hidden.

Used on: Web, iOS, Android
Version: 1.1
