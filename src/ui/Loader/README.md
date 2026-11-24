# Loader

Sakuga's loader is a ball bouncing on twos, the first exercise every animator draws.

## When to use

Use it for something being made or loading whose length is unknown, in an app that sets no loader of its own.

- Not for work whose share done is known: use `Progress`.
- Not on AniCanon's surfaces: AniCanon sets `AniCanonKit.Loader` as its loader, and a board that draws a loader itself draws that one.

## How it works

- Nine drawings, each held for two frames at 24 fps, with the top held twice. The spacing is tight at the top and wide near the ground, the ball stretches as it falls and squashes on contact, and the drawing before shows through as an onion skin. It is what Sakuga's own parts draw while they wait (Button busy, DropZone busy, VideoPlayer loading, Thumb drawing) unless the app sets its own loader: `Sakuga.setLoader(component)` on a canvas, `<Sakuga loader>` in the web package. AniCanon sets its mark, `AniCanonKit.Loader`, so on AniCanon's surfaces those parts draw the mark, never the ball.
- One bounce takes 0.75 s (18 frames), held on twos, with a hard cut between drawings and no easing. The ball and its onion skin take the accent (`load-accent`). The ground follows the text colour, so over dark art it stays light.
- With reduced motion, the ball rests at the top of its arc.
- AniCanon's own loader, its mark with the ring tracing round it, is `AniCanonKit.Loader`.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `size` | `number \| string` | `24` | Pixels, or a size token such as 'var(--button-icon-size)'. It reads down to 16; a frame that waits for a picture takes 48 or more. |
| `label` | `string` |  | Announced to screen readers. |
| `className` | `string` |  | Extra class on the root element. |
| `style` | `CSSProperties` |  | Inline style on the root element. |

## Example

```tsx
import { Loader } from '@anicanon/sakuga/ui';

export function LoadingPages() {
  return <Loader size={48} label="Loading the pages" />;
}
```

## Accessibility

Not focusable. When it appears it says its `label` (default "Loading") once through the page's live region, unless it sits in a button, a link or a card, and in place it reads as a status of that name; the drawing is hidden.

Used on: Web, iOS, Android
Version: 1.1
