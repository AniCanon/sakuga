# CutSheet

CutSheet is a scene read the way anime reads it: an ekonte sheet.

## When to use

Use it for a scene read as an ekonte sheet: numbered cuts as rows, columns set per view (Plan, Make, lists), rules between rows and no boxes.

- Not for the cut's tracks in time: use `Timeline`.
- Not for what gets generated for one cut, on a frame grid: use `Timesheet`.
- Not for one row of the sheet: use `CutRow`.
- Not for a plain list of things with a title and a quiet line: use `List`.
- Not for the script as it is written: use `Manuscript`.

## How it works

- Rows are numbered cuts; columns are set per view (Plan: C · Picture · Action · Dialogue · Sec · Notes; Make: C · Board · Latest take · Video · Sec; lists: art · title · where it is · story). Rules between rows and none after the last, no boxes. Rows are `CutRow`s. `surface` sets the sheet on its page, the paper it is printed on; what follows the sheet (the next scene, a quote) goes in `slot="footer"` under it.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `columns` | `object[]` | required | The sheet's columns, in order: their heading, width and alignment. |
| `columns[].label` | `string` | required |  |
| `columns[].width` | `string` |  |  |
| `columns[].align` | `'end'` |  |  |
| `label` | `string` |  | Names the sheet's table for screen readers. |
| `surface` | `boolean` |  | On its page; slot="footer" sits under the sheet. |
| `children` | `ReactNode` |  | The rows, CutRows. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { CutCell, CutRow, CutSheet } from '@anicanon/sakuga/anicanonkit';

export function SceneTwo() {
  return (
    <CutSheet label="Scene 2" columns={[{ label: 'C', width: '62px' }, { label: 'Action' }, { label: 'Sec', width: '70px', align: 'end' }]}>
      <CutRow><div><CutCell number="2A" state="approved" /></div><div>The platform before the last train.</div><div>8+00</div></CutRow>
      <CutRow selected><div><CutCell number="2B" state="waiting" /></div><div>Kiko steps out of the smoke.</div><div>10+00</div></CutRow>
    </CutSheet>
  );
}
```

## Accessibility

Not focusable; a table named by `label`, its first row the column headers, then a row per CutRow, and with `surface` the footer slot follows the table.

Used on: Web
Version: 1.1
