# Select

A labelled single-choice control that opens a list.

## When to use

Use it for one choice from a short list of plain values, in a labelled field that opens the list: a faction, with its icon.

- Not for one thing among many, with search and groups: use `Picker`.
- Not for two to four named values seen at once: use `SegmentedControl`.
- Not for a choice that is clearer seen than read: use `OptionTiles`.
- Not for a colour chosen by eye: use `SwatchPicker`.

## How it works

- Shows the chosen value with an optional leading icon.
- States - **Closed:** the field shows the chosen value and a chevron. - **Open:** the field edge turns `select-open-border`, the chevron flips, and a menu drops in under it on `select-menu-bg`. The menu is drawn above the page (the browser's top layer), so a `Dialog`, `Sheet` or panel around the field never cuts it off. It takes the field's width and opens under the field, or over it when the window has more room above (it then rises in from its foot); it keeps `select-menu-edge` from the window's edge, scrolls inside when it can't fit, and follows the field as the page scrolls. The chosen option sits on `select-option-selected-bg` with a check; hover is `select-option-hover-bg`. The menu is a `listbox` and each row an `option`, so arrow keys and screen readers work as a native select. - **Empty:** the placeholder in `field-placeholder`. A `value` that isn't among the options (Kind still Suit after For changes to a thing, a draft saved before an option was taken away) is empty too: the field shows the placeholder, not the stored key. - **Disabled option:** an option that exists but can't be picked now (Storyboard frame on a plan with no room for another) stays in the list, in `select-option-disabled-fg`, with its `reason` on a line under the label (`select-option-reason-font`), never trailing it like a `hint`, so a long reason never squeezes the label. It takes no hover and no press; Enter or a press on it does nothing and the list stays open. Leave an option out instead when it never applies to this page.
- On phones, prefer the platform picker (an iOS menu or an Android dropdown menu) and keep this field as its trigger.
- Motion: the menu drops from the field on `motion-fast` with `ease-enter` and leaves on `motion-instant` with `ease-exit`. Escape or a press outside closes it. Sound: with sound on, the menu plays the open sound as it drops and the close sound as it leaves; picking an option plays the choose sound instead of the close (README · Sound).

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `value` | `string` |  | The option's `value` (or `label`) to show. The page's value always wins: when it changes, the field shows the new one. Empty, or not among `options`, shows the placeholder, never the key. |
| `placeholder` | `string` |  | Shown while nothing is chosen. |
| `icon` | `IconName` |  | Leading glyph for the value. |
| `options` | `SelectOption[]` |  | The list it opens. Without options it is display-only. |
| `options[].label` | `string` | required | The option's words. |
| `options[].value` | `string` |  | Empty shows the placeholder. |
| `options[].icon` | `IconName` |  | Leading glyph for the value. |
| `options[].hint` | `string` |  | A quiet word at the row's end in the open list. |
| `options[].disabled` | `boolean` |  | Shown, but can't be picked now. |
| `options[].reason` | `string` |  | Why, on a line under the label. |
| `highlight` | `boolean` |  | Rings the field while a picker beside it is choosing for it. |
| `open` | `boolean` |  | Start open. Clicking the field toggles it; picking an option closes it. |
| `onChange` | `(value: string) => void` |  | Called with the picked option's `value` (or `label`). With it the field shows only what `value` says, so the page decides; without it a pick shows until the page gives a new `value`. |
| `id` | `string` |  | The field's id; one is made without it. |
| `label` | `string` |  | The field's name, above it. Without one the placeholder names the field (search fields). |
| `hint` | `string` |  | One line under the control. |
| `optional` | `boolean` |  | Adds " · optional" after the label. |
| `help` | `object` |  | A FieldHelp tooltip beside the label. |
| `help.title` | `string` |  |  |
| `help.text` | `ReactNode` | required |  |
| `maxWidth` | `number` |  | The widest it grows, in pixels. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { Select } from '@anicanon/sakuga/ui';

export function SelectExample() {
  return (
    <Select label="Shot" value="Medium close-up" icon="shot-medium-closeup" />
  );
}
```

## Accessibility

A select-only combobox named by the words of `label` together with its value ("Faction Heros"), else by `placeholder`, and described by `hint`; Tab reaches it, and focus stays on it while its list is open. Down, Up, Enter or Space open the list, the arrows, Home, End and a first letter move the active option (read as the active descendant, "selected" on the chosen one), Enter or Space picks it, and Escape or Tab closes the list. The arrows still reach a `disabled` option, read as unavailable with its reason after its label, and it can't be picked. The active option is kept in view, and with no `options` the field is unavailable. When the page changes `value` the name follows it, and a `value` not among the options is named by the placeholder, never by its key, with no option read as selected.

Used on: Web, iOS, Android
Version: 1.3
