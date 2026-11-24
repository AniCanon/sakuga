# SearchField

A search: TextField's box with the search icon, a clear button once there are words, and, when the page passes `results`, Picker's options under it.

## When to use

Use it for finding something by its words: in a series, the library, all of AniCanon.

- Not for choosing one thing for a field (a cast member for a shot): use `Picker`, whose search is part of the chooser.
- Not for filtering a list already on screen by a few known values: use `SegmentedControl` or `Chip`s.
- Not for writing to Maki: use `MakiComposer`.

## How it works

- The results drop in and leave as Popover does. Group titles say why results are together; put the series' own things above plain matches.
- In `TopNav`, pass `search` as an object of these props plus `open`, `onOpen` and `onClose`: the Search button calls `onOpen`, and while `open` the field takes the links' place with Close search after it. Escape on an empty field calls `onClose`.
- Motion: the results use Popover's drop-in and drop-out; the clear button fades with `motion-fast`.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `label` | `string` |  | Names the search and its field; 'Search' when left out. Not drawn: the icon and placeholder say what the box is. |
| `value` | `string` |  | The starting words; the field follows when it changes. |
| `placeholder` | `string` |  | `value` starts the words; when the page changes it, the field follows. |
| `onChange` | `(text: string) => void` |  | The words as they are typed; the page filters `results` with them. |
| `onSubmit` | `(text: string) => void` |  | Enter with no result active: search for the words (a results page). |
| `results` | `object[]` |  | Picker's groups; leave out for a search that only submits. |
| `results[].title` | `string` |  |  |
| `results[].options` | `PickerOption[]` | required |  |
| `results[].options[].label` | `string` | required | The option's name. |
| `results[].options[].hint` | `string` |  | A quiet line under the name. |
| `results[].options[].image` | `string` |  | Its picture: a place's art, or a portrait with `shape: 'round'`. |
| `results[].options[].shape` | `'round'` |  | `round` for a portrait. |
| `results[].options[].initial` | `string` |  | Shown in the picture's place when there is none. |
| `results[].options[].placeholder` | `string` |  | A picture's place kept when there is none yet (a series with no cover): Thumb's placeholder at the image's size, with these words, e.g. the initial. |
| `results[].options[].media` | `ReactNode` |  | A picture the product draws in the option's slot (AniCanon passes an AniCanonKit EventGlyph). |
| `results[].options[].figure` | `IconName` |  | A person with no portrait: their figure (age-adult, …) in the round slot a portrait takes. |
| `results[].options[].icon` | `IconName` |  | An icon in the picture's place. |
| `results[].options[].selected` | `boolean` |  | The current choice, checked. |
| `results[].options[].dim` | `boolean` |  | Exists but is out of reach: dimmed, said so, and it can't be chosen. |
| `results[].options[].opens` | `boolean` |  | Holds a level of its own (a place's views): a chevron, and Right opens it as Enter does. |
| `onSelect` | `(option: PickerOption) => void` |  | A result chosen by Enter or a click; the results close. |
| `busy` | `boolean` |  | The results are being fetched: the panel says `busyText` ('Searching'). |
| `busyText` | `string` |  | Said while busy; 'Searching' when left out. |
| `emptyText` | `string` |  | Said when results has no options; 'Nothing matches' when left out. |
| `onClear` | `() => void` |  | The clear button was pressed; Escape was pressed with nothing left to close or clear. |
| `onClose` | `() => void` |  | Escape with nothing left to close or clear. |
| `open` | `boolean` |  | Starts the results open or closed (boards); otherwise typing opens them, and Escape, a choice or a press outside closes them. |
| `autoFocus` | `boolean` |  | Takes focus when it appears. |
| `maxWidth` | `number` |  | The field's widest, in px. |
| `id` | `string` |  | The input's id; one is made without it. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { SearchField } from '@anicanon/sakuga/ui';

export function SearchFieldExample() {
  return (
    <SearchField label="Search the series" placeholder="Characters, places, episodes" />
  );
}
```

## Accessibility

A search landmark named by `label`, holding a search field of the same name that Tab reaches. Enter submits the words, or chooses the active result; Escape closes the results, then clears the words, then calls `onClose`. With `results` the field is a combobox: Up and Down move its active descendant through the options (Up or Down opens closed results), each option reads as Picker's do, and one status line says how many results there are, that it is searching, or `emptyText`. The clear button is "Clear search" and gives focus back to the field. The icon is hidden.

Used on: Web, iOS, Android
Version: 1.0
