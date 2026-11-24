# MonitorBar

MonitorBar is the bar under the editor's picture: the transport, the timecode, the edit buttons and what sits at the end.

## When to use

Use it under `Monitor` or `CanvasStage` in `EditorShell`.

- Not for a bar of tools that floats over the canvas: use `FloatingToolbar`.
- Not for the status line at the bottom of a view: use `StatusBar`.

## How it works

- `slot="transport"` holds play and the frame steps; `timecode` follows it; the edit buttons go in as children; `slot="end"` holds what sits at the right (zoom, fit).

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `timecode` | `string` |  | Where the playhead is, after the transport. |
| `children` | `ReactNode` |  | Slots: transport, end. Children are the edit buttons. |

## Example

```tsx
import { MonitorBar } from '@anicanon/sakuga/anicanonkit';
import { Button, IconButton } from '@anicanon/sakuga/ui';

export function MonitorBarExample() {
  return (
    <MonitorBar timecode="2:41 + 04f">
      <span slot="transport"><IconButton variant="plain" icon="skip-back" label="A frame earlier" /><IconButton variant="plain" icon="play" label="Play" /><IconButton variant="plain" icon="skip-forward" label="A frame later" /></span>
      <Button variant="ghost" size="sm">Split</Button>
      <Button variant="ghost" size="sm">Trim</Button>
      <span slot="end"><Button variant="ghost" size="sm">Fit</Button></span>
    </MonitorBar>
  );
}
```

## Accessibility

A row with no role of its own: its buttons are in order (transport, edit buttons, end), the timecode is read as text and the separator is hidden.

Used on: Web
Version: 1.0
