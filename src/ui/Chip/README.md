# Chip

Chip filters a feed by kind: All, Episodes, Shorts, Manga, Following.

## When to use

Use it for narrowing what a feed or a list shows, one kind at a time; with `variant="soft"`, picking several words from a set, such as traits.

- Not for running an action: use `Button`.
- Not for two to four views of the same thing: use `SegmentedControl`.
- Not for words the person keeps and removes: use `TagList`.
- Not for a label on artwork or a state on a surface: use `Badge`.

## How it works

- Use a row of chips inside `Chip.Group` (named by `label`); exactly one is selected.
- Chips filter what is shown. They never navigate and never run an action; that is Button.
- 44px tall on every platform so they are easy to hit. A `soft` chip (multi-select) draws at 32px and is still a 44px target: its hit area reaches above and below it.
- A chip sinks on press and its fill changes on `motion-fast`.
- With sound on, a press plays the press sound (README · Sound).
- On phones pass `scroll` to `Chip.Group`: one row that scrolls sideways instead of wrapping.

### Icon and soft

- `icon` adds a leading glyph in the accent. `removable` is a choice already made that a press takes away (a filter): it draws chosen, `onClick` removes it, and it is named "Remove" and its words (`removeLabel` changes the verb). A soft chip with no icon is padded alike on both sides. In a `Chip.Group`, chips given keys arrive and leave by their motion: one added after the group first draws rises in, and one removed (a `removable` chip pressed) keeps its place while it fades out. `variant="soft"` is for multi-select sets such as traits: selected chips take `chip-soft-selected-bg` with an accent edge instead of the solid fill.

## Props

It takes no props.

## Example

```tsx
import { Chip } from '@anicanon/sakuga/ui';

export function ChipExample() {
  return (
    <Chip icon="trait-fierce" selected>Fierce</Chip>
  );
}
```

## Accessibility

Tab focuses each chip; Enter or Space runs `onClick`. A screen reader hears the group named by Chip.Group's `label`, then each chip as a button, "pressed" when `selected` (a `removable` one is a plain button, "Remove Smith"); the icon is hidden. When a keyed chip leaves the group with focus on it, focus goes to the chip now in its place, else the last one. In forced colours each chip keeps an edge, and a selected one takes Highlight. A soft chip is a 44px target, though it draws at 32px.

Used on: Web, iOS, Android
Version: 1.0
