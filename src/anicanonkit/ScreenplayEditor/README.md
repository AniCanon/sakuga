# ScreenplayEditor

ScreenplayEditor is a scene written on the page: each block is a `ScreenplayLine` of its kind, typed in place, with no box around the words.

## When to use

Use it to write a scene of a script on the page, inside a `ManuscriptSection`, the blocks typed as screenplay lines.

- Not for a scene that only reads: use `ScreenplayLine`s.
- Not for the prompt that makes a take: use `PromptComposer`.
- Not for a plain multi-line field: use `TextArea`.

## How it works

- It reads and writes the scene's Markdown, so a script's storage is the same whether it was written here or anywhere else.
- `value` is the scene's Markdown: `## SLUG`, then blocks parted by a blank line: action; a cue (in capitals, or `@Name:`), its `(parenthetical)` and its dialogue; a transition (`CUT TO:`). Cast mentions are `@[Name:id]`. `onChange` gets the Markdown at every change.
- **Enter** starts the next block of its natural kind: a heading's next is action, a cue's or a parenthetical's is dialogue, dialogue's is action. An action that begins `INT.` or `EXT.` becomes a heading on Enter. **Shift and Enter** start a new line inside the block.
- **Tab** and **Shift and Tab** change the block's kind (action, character, parenthetical, dialogue, transition, scene heading). The new kind is said aloud.
- **Backspace** at the start of a block joins it to the one before; **Up** at a block's start and **Down** at its end move to the next block.
- **@** and **#** at the start of a word open the cast or the places from `mentions`, under the line: the arrows move, Enter or Tab chooses, Escape closes. Mentions are drawn in `Mention`'s colours over the live words, and a typed @Name of the cast is saved as its token.
- **Escape**, then **Tab**, leaves the script: inside it Tab changes a block's kind, so it never traps a keyboard.
- `placeholders` are the words an empty line shows, by kind ("INT. or EXT. · the place · the time").
- `onKind` tells a toolbar the kind of the line being written; `kind` asked from the toolbar turns the line last written in into that kind, the caret where it was.
- The focused line shows a stroke at its left in the focus ring's colour, set off from the page so the screenplay's own indents stay true.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `value` | `string` | required | The scene's Markdown: `## SLUG`, then blocks parted by a blank line; cast mentions as |
| `onChange` | `(value: string) => void` |  | Called with the scene's Markdown at every change. |
| `mentions` | `object` |  | Who @ and # can name; a typed |
| `mentions.cast` | `ScreenplayMention[]` |  |  |
| `mentions.cast[].id` | `string` | required | What its token carries (@[Name:id]). |
| `mentions.cast[].name` | `string` | required | Its name, as typed after @ or #. |
| `mentions.cast[].image` | `string` |  | Its picture in the list. |
| `mentions.places` | `ScreenplayMention[]` |  |  |
| `mentions.places[].id` | `string` | required | What its token carries (@[Name:id]). |
| `mentions.places[].name` | `string` | required | Its name, as typed after @ or #. |
| `mentions.places[].image` | `string` |  | Its picture in the list. |
| `placeholders` | `Partial<Record<BlockKind, string>>` |  | Words shown in an empty line, by kind ("INT. or EXT. · the place · the time"). |
| `onKind` | `(kind: BlockKind) => void` |  | Called with the kind of the line being written as it changes (focus, Enter, Tab): a toolbar can show it. |
| `kind` | `BlockKind` |  | A kind asked for from outside (a toolbar): the line last written in takes it, the caret where it was. |
| `label` | `string` |  | Names the group (default "Script"). |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { useState } from 'react';
import { ScreenplayEditor } from '@anicanon/sakuga/anicanonkit';

const scene = '## INT. TODDY’S BEDROOM — NIGHT\n\nHis phone lights up. @[Kiko:c1]’s name.\n\n@[Kiko:c1]:\n(quietly)\nPick up. I’m at #Sé station.\n\nCUT TO:';

export function SceneEditor() {
  const [value, setValue] = useState(scene);
  return (
    <ScreenplayEditor
      value={value}
      onChange={setValue}
      mentions={{ cast: [{ id: 'c1', name: 'Kiko' }, { id: 'c2', name: 'Toddy' }], places: [{ id: 'p1', name: 'Sé station' }] }}
    />
  );
}
```

## Accessibility

A group named by `label` (default "Script") and described by its keys ("Enter starts the next block, … Escape, then Tab, leaves the script"). Each block is a textbox named by its kind ("Scene heading", "Action", "Character", "Parenthetical", "Dialogue", "Transition"), multi-line for action and dialogue, one Tab stop for the whole script (the block last written in). A change of kind is said in a polite live region. The mention list is a listbox the line controls, its active option the line's active descendant.

Used on: Web
Version: 1.0
