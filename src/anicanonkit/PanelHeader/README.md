# PanelHeader

PanelHeader opens every side panel in Story with the same grammar: a small eyebrow naming what the panel shows, the title, an optional subtitle; icon actions (most common first, the rest in ⋯), then close.

## When to use

Use it for the head of every side panel in Story and of an inspector: an eyebrow, the title, an optional subtitle, icon actions, then close (none on the world panel or an inspector).

- Not for the top of a production view: use `ViewHeader`.
- Not for opening a shelf or labelling a strip: use `SectionHeader`.
- Not for a labelled group of rows with its count: use `PanelSection`.
- Not for a Studio card with its controls: use `Panel`.
- Not for the editor's top bar with its timecode: use `EditorHeader`.

## How it works

- Actions go in `slot="actions"`. A picture (a place's art, a portrait) goes in `slot="media"`.
- The world panel is the default and has no close (`close={false}`).
- An inspector opens with it too: what is selected as the `title`, where it stands as the `subtitle`, its delete as the one action, and no close (`close={false}`).
- `onClose` runs on close. `level` sets the title's heading level (2 by default).

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `eyebrow` | `string` |  | A small line naming what the panel shows ("Event · Arc 2"). |
| `title` | `string` | required | What the panel is about, as a heading. |
| `subtitle` | `string` |  | Where it stands ("Ep 3 · p.14"). |
| `close` | `boolean` |  | Draws Close; `false` on the world panel and an inspector. |
| `closeLabel` | `string` |  | Names Close (default "Close"). |
| `onClose` | `MouseEventHandler` |  | Runs on Close. |
| `level` | `number` |  | The title's heading level. Default 2. |
| `media` | `ReactNode` |  | The picture (as slot="media"). |
| `actions` | `ReactNode` |  | The actions (as slot="actions"). |
| `children` | `ReactNode` |  | The actions as slot="actions" and a picture as slot="media". |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { PanelHeader } from '@anicanon/sakuga/anicanonkit';
import { IconButton } from '@anicanon/sakuga/ui';

export function PanelHeaderExample() {
  return (
    <PanelHeader eyebrow="Event · Arc 2" title="Fire at Sé" subtitle="Ep 3 · p.14">
      <span slot="actions"><IconButton variant="plain" icon="edit" label="Edit" /></span>
    </PanelHeader>
  );
}
```

## Accessibility

Read in order: the eyebrow, the title as a heading (level `level`, default 2) and the subtitle. Tab then reaches the actions and a close button named by `closeLabel` (default "Close") that runs `onClose`.

Used on: Web
Version: 1.0
