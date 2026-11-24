# Picker

Picker is the anchored chooser under a field: optional search, then options in groups.

## When to use

Use it for choosing one thing from many under a field, with search and groups: a cast member, a place, an event.

- Not for a short list of plain values: use `Select`.
- Not for options that each need an explanation or a price: use `OptionTiles`.
- Not for the same choice on a phone: use `Sheet`.

## How it works

- Each option has a `label`, an optional `hint`, and one picture: `image` (place art, or a portrait with `shape: 'round'`), `figure` (a person with no portrait: their age figure in the same round slot), `initial`, `placeholder` (the picture's place kept when there is none yet, as Thumb's placeholder, e.g. a series with no cover), `media` (a picture the product draws: AniCanon passes `AniCanonKit.EventGlyph` for an event type) or `icon`.
- `selected` sets the option's label in the strong weight with the check, and no fill; `dim` is for an option that exists but is out of reach: it can't be chosen.
- Group titles say why the options are together ("Already at Sé station"). Put suggestions from the story above plain search results.
- `open` works as on Popover: it drops in, and plays its exit before it goes.
- `align` works as on Popover and Menu: `start` or `end` lines it up with that edge of what opened it and makes it as wide as its options, up to a reading measure (`picker-aligned-max-width`, 440 px), so options with a `hint` read in a line, never wrapping every few words. Use it whenever an option carries a hint; without it the Picker is its field's width.
- With sound on, it opens and closes with the surface sounds, and choosing an option plays the choose sound (README · Sound).
- Levels: an option with `opens` holds more options, a place its views, and ends in a chevron. Choosing it (a click, Enter, or Right) hands it to `onSelect`, and the page shows that level's groups in the Picker's place, with `back` (`to`, the level it came from; `title`, the one shown; `onBack`). The head is Back and the title; Back, Left, or Backspace in an empty search, calls `onBack`. A level opens on its first option and, going back, on the option that opened it. An option with one thing inside it is that thing, not a level: a place with one view chooses the view (its `hint` names it). Search finds across every level, each option's `hint` naming where it lives.
- Extra controls that refine the choice (how two events connect) go as children, after the groups.
- The options are a listbox named by `label` ('Options' when left out); the search field and the children sit outside it. The search field shows no label, so `search.label` names it for a screen reader ('Search' when left out).
- `onClose`: as on `Popover`.
- `id` goes on the surface, so the control that opens it names it in `aria-controls` (SideNav's `switcher.controls`).
- `search.onChange(text)` gets the words as they are typed; the page filters `groups` with them.
- `onSelect(option)` gets the option chosen. With search, focus stays in the field and Up and Down move the active option (Enter chooses it); without search, the options are one Tab stop that Up and Down move through (Enter or Space chooses). Escape closes the whole Picker, at any level. A click chooses too.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `id` | `string` |  | The surface's id, for a control's aria-controls (SideNav's switcher). |
| `open` | `boolean` |  | As on Popover: whether it shows. |
| `onClose` | `() => void` |  | As on Popover: runs on Escape or a press outside. |
| `onSelect` | `(option: PickerOption) => void` |  | An option chosen: Enter on the active option (with search) or on the focused one (Space too without search), or a click. |
| `label` | `string` |  | Names the list of options for a screen reader; 'Options' when left out. |
| `search` | `object` |  | A search field over the groups; with `onChange` it filters the list as you type. |
| `search.placeholder` | `string` |  |  |
| `search.value` | `string` |  | Controlled search text. |
| `search.defaultValue` | `string` |  | Initial text for an uncontrolled search. |
| `search.label` | `string` |  | The search field's name for a screen reader; it shows no label. 'Search' when left out. |
| `search.onChange` | `(text: string) => void` |  | Called with the text as it is typed; with it the field says it filters the list (aria-autocomplete "list"). |
| `groups` | `object[]` | required | The options, in groups with an optional heading. |
| `groups[].title` | `string` |  |  |
| `groups[].options` | `PickerOption[]` | required |  |
| `groups[].options[].label` | `string` | required | The option's name. |
| `groups[].options[].hint` | `string` |  | A quiet line under the name. |
| `groups[].options[].image` | `string` |  | Its picture: a place's art, or a portrait with `shape: 'round'`. |
| `groups[].options[].shape` | `'round'` |  | `round` for a portrait. |
| `groups[].options[].initial` | `string` |  | Shown in the picture's place when there is none. |
| `groups[].options[].placeholder` | `string` |  | A picture's place kept when there is none yet (a series with no cover): Thumb's placeholder at the image's size, with these words, e.g. the initial. |
| `groups[].options[].media` | `ReactNode` |  | A picture the product draws in the option's slot (AniCanon passes an AniCanonKit EventGlyph). |
| `groups[].options[].figure` | `IconName` |  | A person with no portrait: their figure (age-adult, …) in the round slot a portrait takes. |
| `groups[].options[].icon` | `IconName` |  | An icon in the picture's place. |
| `groups[].options[].selected` | `boolean` |  | The current choice, checked. |
| `groups[].options[].dim` | `boolean` |  | Exists but is out of reach: dimmed, said so, and it can't be chosen. |
| `groups[].options[].opens` | `boolean` |  | Holds a level of its own (a place's views): a chevron, and Right opens it as Enter does. |
| `anchored` | `boolean` |  | As on Popover: pinned under what opened it (default). |
| `align` | `'start' \| 'end'` |  | As on Popover: lines it up with that edge of what opened it, as wide as its options up to a reading measure. Use it when options carry a hint. |
| `back` | `object` |  | The level shown, opened from an option with `opens`: Back to `to`, and its `title`. Left, and Backspace in an empty search, call `onBack`. |
| `back.to` | `string` | required |  |
| `back.title` | `string` |  |  |
| `back.onBack` | `() => void` | required |  |
| `style` | `CSSProperties` |  | Inline style on the root element. |
| `children` | `ReactNode` |  | Controls that refine the choice, after the groups. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { useState } from 'react';
import { Picker, Select } from '@anicanon/sakuga/ui';

export function WhoIsInIt() {
  const [open, setOpen] = useState(false);
  const [who, setWho] = useState('Smith');
  return (
    <div style={{ position: 'relative' }} onClick={() => setOpen(true)}>
      <Select label="Who" value={who} />
      <Picker
        label="Who"
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(option) => { setWho(option.label); setOpen(false); }}
        search={{ placeholder: 'Search the cast' }}
        groups={[
          { title: 'Matches', options: [{ label: 'Kiko', hint: 'E.R.A. · at Sé station', initial: 'K' }, { label: 'Ken', hint: 'Heros', initial: 'K' }] },
          { title: 'Already at Sé station', options: [{ label: 'Smith', hint: 'At Sé station', initial: 'S', selected: who === 'Smith' }] },
        ]}
      />
    </div>
  );
}
```

## Accessibility

A dialog named by `label` that, with `onClose`, takes focus, closes on Escape, a press outside or Tab out of it, and gives focus back (after a press or Tab elsewhere, focus stays there). With search, the field (named "Search", or `search.label`) is a combobox, promising a filtered list only with `search.onChange`, whose active descendant Up and Down move through the options and Enter chooses; without search, the options are one Tab stop that Up and Down move through, Enter or Space choosing; each option reads its label, hint, "out of reach" (unavailable) when `dim` and "selected", and `onSelect` gets the choice; an option with `opens` opens with Right too, and in a level Back is a button named "Back to" its `to`, which Left and Backspace in an empty search also press. Gap: an option with `opens` is read by its hint ("3 views"), with nothing saying it opens a level.

Used on: Web
Version: 1.4
