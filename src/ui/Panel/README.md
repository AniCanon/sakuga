# Panel

Panel is a Studio card: an AniCanon icon, a title, one line that explains it, an optional action, then its controls.

## When to use

Use it for a Studio card that explains itself: an AniCanon icon, a title, a one-line subtitle, an optional action, then its controls.

- Not for a folded section showing its current value: use `PanelRow`.
- Not for the top of a side panel in Story: use `PanelHeader`.
- Not for a heading over a shelf: use `SectionHeader`.
- Not for a task that needs the page's whole attention: use `Dialog`.

## How it works

- Every Panel explains itself in its subtitle ("Core shot decisions, with a technique library behind them").
- The header icon comes from the AniCanon set and takes `panel-icon`.
- Put collapsed settings in rows below Panels rather than opening every Panel at once.
- The action may be a component: pass it in `slot="action"` (a close button, Remove).
- In a column too narrow for its words (the 320 px Direction rail), a wide action (a text button) moves under the words rather than squeezing the subtitle; an icon action stays on their line.
- An accordion: a fold is a `PanelRow` when closed and a Panel with `onToggle` when open. Its whole head is the button that closes it, with PanelRow's chevron turned up at its end, so the fold opens and closes on one line. Never an IconButton chevron in `action`.
- `selected` marks the one picked among several panels (a take chosen to cast), or the open one in a form (the blank being set up): an accent hairline in place of the panel's own edge, with no tinted fill, so a form stays calm.
- `pane`: the panel is part of a side pane (a cut's camera and notes in Plan): no box, a hairline from the pane above. In the editor's tool and inspector panes a Panel is a pane on its own.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `icon` | `IconName` |  | The AniCanon icon at the head, drawn at `panel-icon` size. Hidden from screen readers. |
| `title` | `string` |  | Names the panel and its region; a level-3 heading. |
| `subtitle` | `string` |  | One line that explains the panel: "Core shot decisions, with a technique library behind them". |
| `action` | `ReactNode` |  | An action at the head's end (Techniques, a close button). In a narrow column a wide one moves under the words; an icon one stays on their line. Or pass it as `slot="action"`. |
| `onToggle` | `() => void` |  | The open fold of an accordion (PanelRow is the closed one): the head is its button, with the chevron turned up, and it takes the place of `action`. |
| `controls` | `string` |  | With onToggle: the id of what it folds. |
| `selected` | `boolean` |  | One choice among several (a take picked). |
| `pane` | `boolean` |  | Part of a side pane: no box, a hairline from the pane above. Never a card in a pane. |
| `children` | `ReactNode` |  | Or slot="action". |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { Button, Panel, SliderRow } from '@anicanon/sakuga/ui';

export function CameraPanel() {
  return (
    <Panel
      icon="camera"
      title="Camera and framing"
      subtitle="Core shot decisions, with a technique library behind them"
      action={<Button variant="ghost" size="sm" icon="film">Techniques</Button>}
    >
      <SliderRow label="Depth of field" value={40} readout="40%" />
    </Panel>
  );
}
```

## Accessibility

A region named by `title`, with the title as a level-3 heading that ends in "selected" when `selected`, and the subtitle as text; the icon is hidden, and the action and controls take focus in order. With `onToggle` the heading holds a button named by the title, expanded, controlling `controls`, whose hit area and focus ring cover the head; Enter or Space closes the fold, and the chevron is hidden.

Used on: Web
Version: 1.5
