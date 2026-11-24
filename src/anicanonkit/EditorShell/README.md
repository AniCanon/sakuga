# EditorShell

EditorShell is the full-screen editor (Cut).

## When to use

Use it for the full-screen editor (Cut, and Art and Lettering in manga): the rail, header, tool panel, inspector and the centre column with the monitor, program bar and timeline, with `focus` for the canvas alone.

- Not for a production view outside the editor: use `ViewHeader`.
- Not for a full-screen flow that makes one thing step by step: use `FlowHeader`.
- Not for a task over the page: use `Dialog`.

For wide screens only: at a phone's width it is not offered, and phones make through Studio's own flows.

## How it works

- Slots: `nav` (the `ProductionNav` rail), `header` (`EditorHeader`), `tool` (the open tool’s panel, 312 px), `inspector` (the selected item, 300 px), `timeline` (the `ProgramBar` and the `Timeline`), `overlay` (a dialog over the editor). Its main content is the centre column: `Monitor` and `MonitorBar`. - The timeline runs the editor's whole width, from the rail to the window's edge, under the tool panel, the monitor and the inspector. A cut needs its length more than its panels need their height, so the panels scroll above it, each on its own, and the timeline keeps its height up to half the editor's (`editor-timeline-max-height`), scrolling its tracks past that. As the tracks scroll, the Timeline's ruler, its times and marker flags, stays at the top of the slot (the lanes pass under it), and the track heads stay with their lanes.
- `EditorHeader`: `title`, `timecode`, an optional `status` (Rebuilds exactly) and the actions as children.
- `Monitor`: the picture (`image`, `imageStyle`) with `labels` in its corner (`labelsEnd` for the other corner) and overlays as children; `guides` draws title-safe or an effect's area (`accent` for the selected one) and `region` the area an edit works on, with its label; `centered` puts a frame in the middle; `fill` lets it take the column's height (the manga page canvas); `fit="contain"` shows the whole picture (a take in Studio) instead of filling the frame.
- `MonitorBar`: slots `transport` and `end`, the `timecode`, the edit buttons as children.
- The tool panel and the inspector are panes divided from the centre by hairlines, never cards: a `Panel` in either drops its box. A pane that scrolls marks each end with more past it with a hairline (under its top, over its foot), so a line cut at the edge never reads as the last. Each pane has a resize handle on its inner edge: drag it, or focus it and use Left and Right (Shift for larger steps, Home and End for its least and most), between a min and a max width (`editor-tool-min-width` 280 to `editor-tool-max-width` 520, the inspector 260 to 460). `toolWidth` and `inspectorWidth` start them, `onResize(pane, px)` keeps them; a drag never eases.
- **One place for a clip.** A planned cut is on the Picture track as its board from the moment it is approved, at its planned length; takes arrive on it, and selecting it opens its takes in the inspector (Use, Retake, Reject). There is no separate Make view.
- **Adding.** Every tool panel is a browser of things as they look (pictures, titles in their own type, effects that play on hover, sounds that play on hover). Double-click or Enter adds at the playhead, a drag places it where it is dropped (nothing snaps), the + on the item does the same; what was added is selected. No panel ends in an add button and no label carries a time.
- Nothing floats over the picture except the corner labels and what you are editing on it.
- **An empty cut** keeps the whole editor: the tools, the empty tracks and the planned scenes on the `ProgramBar`. The monitor holds an `EmptyState` (its words take the on-media inks) with the two ways in, Plan with the Director (`media`) and Choose from the library (`media-secondary`, it opens Media on Library); the header carries no Plan with the Director until the cut has something in it.
- `CanvasStage` replaces the `Monitor` while an item is selected on the canvas: the frame, the item at its `box` (percent of the frame; it may run past the edges, shown dimmed), and a box with eight handles to move and resize it.
- `focus` turns the shell into focus mode: the rail, header, tool panel and inspector fold away; the monitor grows and the transport and timeline stay, since editing needs them. The page sets it: F or Full screen enters focus, F or Esc leaves it.
- The `float` slot holds what comes back on demand. The shell covers itself with it and shows it as focus starts and whenever the pointer moves, then fades it out after 2 s still, never while the pointer rests on it or focus is in it. The page lays it out, as the Productions focus board does: one row across the top, 20 px from the top and 24 px (`inset-xl`) from the sides, 10 px apart. In it, a `FloatingToolbar` named "Production" with the production's name and the timecode; a `FloatingToolbar` named "Tools" with the tools as `media` IconButtons; and at the far end Leave focus, a `media-secondary` Button (`sm`, the `fullscreen` icon). While the bars show, the Monitor's corner labels step aside (the Production bar carries the timecode), and they come back when the bars fade.
- Motion follows the editor motion sheet: panels on `motion-base`, selection on `motion-instant` with `ease-enter`, focus on `motion-slow`; dragging never eases. Under reduced motion every move becomes a short fade or nothing.
- `CanvasStage` takes `onBox(box)`: the box becomes one Tab stop, arrows move it a percent and Shift with an arrow resizes it.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `toolWidth` | `number` |  | Starting width of the tool pane (px); its handle resizes it between its min and max. |
| `inspectorWidth` | `number` |  | Starting width of the inspector (px); its handle resizes it between its min and max. |
| `onResize` | `(pane: EditorPane, width: number) => void` |  | Called as a pane is resized, to keep its width. |
| `height` | `number` |  | Slots: nav, header, tool, inspector, timeline (the whole width under the panels), overlay, float (focus mode only). Children are the centre column. |
| `focus` | `boolean` |  | Focus mode: the panels fold away, the centre fills, `float` holds the bars that come back on demand. |
| `inspectorLabel` | `string` |  | Names the inspector column for screen readers. |
| `children` | `ReactNode` |  | The centre column (the Monitor and its bar); the other columns go in their slots. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { EditorShell, Monitor } from '@anicanon/sakuga/anicanonkit';
import { Text } from '@anicanon/sakuga/ui';

export function CutEditor({ still }: { still: string }) {
  return (
    <EditorShell inspectorLabel="Cut 2C">
      <span slot="tool"><Text variant="title-4">Media</Text></span>
      <Monitor image={still} labels={['2C · take 3', '2:41 + 04f']} />
      <span slot="inspector"><Text variant="title-4">Cut 2C</Text></span>
    </EditorShell>
  );
}
```

## Accessibility

A layout with no keyboard handling of its own: Tab moves through its slots in order (nav, header, tool, the tool's resize handle, centre, the inspector's resize handle, inspector); each handle is a vertical separator named "Resize the tool panel" or "Resize the inspector", its value always the pane's width as laid out, its least and most the pane's min and max, the inspector is a complementary region named by `inspectorLabel` (default "Inspector"), and EditorHeader's title is a level-1 heading. CanvasStage's selection is a group named by `label` and described by its position and size; with `onBox` it is an application (a "movable item") and one Tab stop where arrows move it and Shift with an arrow resizes it, each change said aloud, and its handles are hidden.

Used on: Web
Version: 1.6
