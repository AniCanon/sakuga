# DateField

DateField picks a date, or a range of dates read by period: this month, the quarter, the dates on an invoice.

## When to use

Use it for a date or a span of dates someone picks or reads by period.

- Not for a choice from a few named periods only: use `Select`.
- Not for a time of day or a duration: use `NumberField`.

## How it works

- A record people read by period, a campaign's start and end.
- `range` makes it a range: the calendar shows two months beside the `presets` (`{label, start, end}`, a list a screen reader hears named by `presetsLabel`, default "Presets"). Without it, one month and one date.
- `value` is `{start, end}` for a range and a string for a date, both `'YYYY-MM-DD'`. `onChange` gets the same.
- The field writes the dates the locale's way (Intl, `locale`, default the Sakuga locale; README · Words): "Oct 1 – 23, 2026". When the value is a preset, the preset's name comes first, muted.
- A preset applies in one press and closes. A range of your own takes two presses, the start and then the end, and the band follows the pointer between them. A press before the start begins again from there. A date takes one press. Escape closes without a change.
- `min` and `max` keep days out of reach; they show muted and can't be picked.
- `align: 'end'` lines the open calendar up with the field's end edge, for a field at the end of a toolbar.
- The range is one pale band; its start and end are solid ink, as Button's primary is, and invert with it in dark. The accent is only today's dot. In a range, each month's grid leaves the other month's days blank; a single date shows them muted.
- Where two months don't fit beside the presets (a phone), the range shows one month with the presets above it.
- Opened by `open` or a pointer, the focused day draws no ring until a key is pressed; opened from the keyboard, it does.
- For a board: `open`, `month` (the first month shown, `'YYYY-MM'` or a day in it), `today` and `weekStartsOn` (default from the locale) fix what it shows.
- A range can also be set in one gesture: press on the start, slide to the end and let go; sliding backwards sets the range the other way round. Let go where no day in reach was crossed, and only the start is set, as after a first press.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `label` | `string` |  | The field's label, over it; it also names the calendar. |
| `hint` | `string` |  | A quiet line under the field. |
| `disabled` | `boolean` |  | The field can't be opened. |
| `placeholder` | `string` |  | Shown while no date is picked. |
| `range` | `boolean` |  | Picks a range: two months beside the `presets`. Without it, one month and one date. |
| `value` | `string \| DateRange` |  | The date ('YYYY-MM-DD'), or `{ start, end }` for a range. |
| `onChange` | `(value: string \| DateRange) => void` |  | Called with the new date, or the range once both ends are set. |
| `presets` | `object[]` |  | A range's named periods ("This month"), each applied in one press. |
| `presets[].label` | `string` | required |  |
| `presets[].start` | `string` | required |  |
| `presets[].end` | `string` | required |  |
| `presetsLabel` | `string` |  | Default "Presets". |
| `min` | `string` |  | The first day that can be picked, 'YYYY-MM-DD'. |
| `max` | `string` |  | The last day that can be picked, 'YYYY-MM-DD'. |
| `open` | `boolean` |  | Shows the calendar open (a board). |
| `month` | `string` |  | The first month shown, 'YYYY-MM' or any day in it ('YYYY-MM-DD'); anything else falls back to the default. |
| `today` | `string` |  | 'YYYY-MM-DD'. Default the real today. |
| `locale` | `string` |  | Default the viewer's. |
| `weekStartsOn` | `number` |  | 0 is Sunday. Default from the locale. |
| `align` | `'start' \| 'end'` |  | The open calendar lines up with the field's start or end edge. Default 'start'. |
| `previousLabel` | `string` |  | Default "Previous month" and "Next month". |
| `nextLabel` | `string` |  | Names the next-month button (default "Next month"). |
| `optional` | `boolean` |  | As on TextField. |
| `help` | `object` |  | An ⓘ beside the label that explains the field (a FieldHelp). |
| `help.title` | `string` |  |  |
| `help.text` | `ReactNode` | required |  |
| `maxWidth` | `number` |  | The field's widest, in px. |
| `id` | `string` |  | The field's id; one is made without it. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { useState } from 'react';
import { DateField } from '@anicanon/sakuga/ui';

export function AirDate() {
  const [date, setDate] = useState('2026-10-05');
  return <DateField label="Airs" value={date} onChange={(v) => typeof v === 'string' && setDate(v)} hint="The episode goes out at 18:00." />;
}
```

## Accessibility

The field is a button named by `label` and the dates, that opens a dialog named by `label`. Each month is a grid named by its month and year, with one Tab stop: arrows move a day or a week, Page Up and Page Down a month (with Shift a year), Home and End to the start and end of the week, and Enter or Space picks. Days in the range are selected, days out of reach disabled, and today is the current date; the new month is announced when it changes. The presets are a listbox with one Tab stop. Escape, a press outside or Tab out of it closes, and after Escape focus goes back to the field. Sliding across days is for the pointer; two presses, or the keys, do the same.

Used on: Web
Version: 1.1
