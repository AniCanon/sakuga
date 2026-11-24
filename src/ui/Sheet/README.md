# Sheet

Sheet is the bottom panel on phones for choices that belong to the current screen: audio and subtitles, reading direction.

## When to use

Use it for choices that belong to the current phone screen: audio and subtitles, reading direction, a row's menu.

- Not for the same choices on desktop: use `Popover`.
- Not for a task on desktop: use `Dialog`.
- Not for the app's main destinations: use `TabBar`.

## How it works

- It slides up from the bottom edge on `motion-slow` with `ease-enter`, over a dim `sheet-scrim`, with a grab handle and a Done button. On the web it sits on the screen, not on the page, so it rises from the screen's foot however far the page is scrolled. Tapping the scrim closes it; it slides back down on `motion-base` with `ease-exit`.
- The selected option's fill slides within its group, and its check settles in.
- Group options with `Sheet.Group` (a short heading) and `Sheet.Option` (one choice, check on the selected one).
- It is never taller than the screen less a band of scrim to tap away; its groups scroll between the handle and Done, which stay put.
- `media` over video or manga pages, so it stays dark in either theme.
- Desktop uses a popover menu for the same choices, not a sheet.
- It stays silent, on the web and in the apps (README · Sound).
- An option can hold a lead (a `CastAvatar`, a `Thumb`) and two lines of `Text`; the row grows past its 48 px when it needs to. `doneLabel={null}` drops Done when an option or a button below is the action.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `open` | `boolean` | required | Whether it shows; it slides up on open and back down on close. |
| `title` | `string` | required | What the choices are ("Audio and subtitles"); names the sheet. |
| `onClose` | `() => void` |  | Runs on Done, a tap on the scrim and Escape. |
| `media` | `boolean` |  | Over video or manga pages: stays dark in either theme. |
| `doneLabel` | `string \| null` |  | null drops Done, when an option or a button below is the action. |
| `children` | `ReactNode` | required | Its Sheet.Groups, which scroll between the handle and Done. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { useState } from 'react';
import { Sheet } from '@anicanon/sakuga/ui';

export function AudioAndSubtitles({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [audio, setAudio] = useState('Japanese');
  const [subtitles, setSubtitles] = useState('English');
  return (
    <Sheet open={open} media title="Audio and subtitles" onClose={onClose}>
      <Sheet.Group title="Audio">
        {['Japanese', 'English'].map((x) => <Sheet.Option key={x} selected={audio === x} onSelect={() => setAudio(x)}>{x}</Sheet.Option>)}
      </Sheet.Group>
      <Sheet.Group title="Subtitles">
        {['English', 'Português', 'Off'].map((x) => <Sheet.Option key={x} selected={subtitles === x} onSelect={() => setSubtitles(x)}>{x}</Sheet.Option>)}
      </Sheet.Group>
    </Sheet>
  );
}
```

## Accessibility

A modal dialog named by `title`: focus moves to the chosen option, a selected Sheet.Option or else a selected Chip (else the first control), Tab and Shift+Tab stay inside it, Escape, Done or a tap on the scrim run `onClose`, and focus goes back to what opened it. Sheet.Group is a group named by its `title`, and each Sheet.Option is a toggle button, "pressed" when selected, with its check hidden.

Used on: iOS, Android
Version: 1.4
