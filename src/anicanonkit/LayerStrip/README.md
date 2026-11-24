# LayerStrip

LayerStrip lists a page's layers by kind, in reading order, under the editor's canvas: panels, lettering, sound effects.

## When to use

Use it for a page's layers under the editor's canvas: panels, lettering and sound effects, a track per kind in reading order, with the issue strip on top.

- Not for a cut's tracks in time: use `Timeline`.
- Not for the issue's spreads on their own: use `IssueStrip`.
- Not for who or what a panel holds: use `MentionChip`.

## How it works

- One track per kind; each item is its number (3.2) and, for words, how it is set and its first words. Panels show their picture once drawn.
- Choosing an item selects it on the page and the inspector edits that kind: a panel's direction and frame, a balloon's type and shape, a sound effect's style.
- Children sit on top: the issue's `IssueStrip` at `size` 18, so the page is always placed in its issue.
- An empty kind says `emptyLabel` ("None yet"), never hides.
- `onSelect(track, item)` makes choosing work: each kind is a listbox, one Tab stop that Left and Right move through, and Enter, Space or a click choose. `muted` marks words drawn into the art rather than set as text: the picture dims, the words stay readable.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `tracks` | `LayerStripTrack[]` | required | One track per kind of layer. |
| `tracks[].kind` | `'panels' \| 'lettering' \| 'sfx'` | required | The layer: panels, lettering or sound effects. |
| `tracks[].label` | `string` | required | The track's name. |
| `tracks[].icon` | `IconName` |  | Its icon. |
| `tracks[].items` | `object[]` | required | Its items in reading order: each a number (3.2) and, for words, its first words; a panel's picture once drawn. |
| `tracks[].items[].number` | `string` | required |  |
| `tracks[].items[].label` | `string` |  |  |
| `tracks[].items[].image` | `string` |  |  |
| `tracks[].items[].selected` | `boolean` |  |  |
| `tracks[].items[].muted` | `boolean` |  | Drawn into the art rather than set as text. |
| `emptyLabel` | `string` |  | Shown on a track with nothing on it (default "None yet"). |
| `children` | `ReactNode` |  | Drawn under the tracks: the issue's IssueStrip at size 18. |
| `className` | `string` |  | Extra class on the root element. |
| `onSelect` | `(track: number, item: number) => void` |  | Makes each track a listbox, one Tab stop that Left and Right move through; Enter, Space or a click choose a layer. |

## Example

```tsx
import { LayerStrip } from '@anicanon/sakuga/anicanonkit';

export function PageLayers({ panel, onSelect }: { panel: string; onSelect: (track: number, item: number) => void }) {
  return (
    <LayerStrip
      onSelect={onSelect}
      tracks={[
        { kind: 'panels', label: 'Panels', items: [{ number: '3.1', image: panel, selected: true }, { number: '3.2' }, { number: '3.3' }] },
        { kind: 'lettering', label: 'Lettering', items: [{ number: '3.1', label: 'Caption · I’m Bruce' }, { number: '3.2', label: 'Caption · Every snowfall…' }] },
        { kind: 'sfx', label: 'Sound effects', items: [] },
      ]}
    />
  );
}
```

## Accessibility

Each track reads its name and count, then its layers: with `onSelect`, a listbox named by the track and one Tab stop, where Left and Right move between layers, Enter, Space or a click choose one, and the chosen one reads "selected"; without it, a list whose selected item reads "current". Each layer reads its number and label, with "drawn into the art" when `muted`, pictures are hidden, and an empty track reads "None yet".

Used on: Web
Version: 1.0
