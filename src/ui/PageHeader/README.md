# PageHeader

PageHeader opens an app page: its `title`, the `lead` under it that says what the page holds, and at the end the page's view switch (`slot="views"`) and its one primary action (`slot="action"`).

## When to use

Use it for the top of an app page beside the SideNav (Characters, Places, Library, Series settings, You, Create): its title, its lead, and its view switch and main action.

- Not for opening a shelf or a section inside a page: use `SectionHeader`.
- Not for the top of a production view, with its eyebrow and Maki: use `ViewHeader`.
- Not for the top bar of a full-screen flow: use `FlowHeader`.
- Not for the head of a side panel or an inspector: use `PanelHeader`.

## How it works

- The title is the page's name, as the SideNav says it: "Characters", "Places", "Library".
- Always write the lead. It says what is on the page and how it is arranged ("23 characters in EBA, grouped by faction."). It may run to two lines; it never pushes the controls down.
- The view switch is a `SegmentedControl` between two to four views of the page (Cast and Coverage, Grid and List). The action is the page's one white `Button`. Both are optional.
- The switch and the action sit at the end, centred on the title's line, however many lines the lead runs to. The words take the width they leave.
- Filters, search and chips are the page's next row, never the header's.
- Below 768 px the words stack and the switch takes the full width under the lead, its segments sharing it. A phone page's main action is the pinned pill at its foot (Platforms), so leave `action` out there; given one, it stays on the title's line.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `title` | `string` | required | The page's name, its heading. |
| `lead` | `string` |  | What the page holds; it may run to two lines. |
| `as` | `'h1' \| 'h2'` |  | The title's heading level; h1 by default. |
| `id` | `string` |  | The title's id, for what it labels (aria-labelledby). |
| `children` | `ReactNode` |  | slot="views" (a SegmentedControl) and slot="action" (its one primary Button) sit on the title's line. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { Button, PageHeader, SegmentedControl } from '@anicanon/sakuga/ui';

export function PageHeaderExample() {
  return (
    <PageHeader title="Characters" lead="23 characters in EBA, grouped by faction.">
      <span slot="views"><SegmentedControl label="View" value="cast" options={[{ label: 'Cast', value: 'cast' }, { label: 'Coverage', value: 'coverage' }]} /></span>
      <span slot="action"><Button variant="primary" icon="plus">New character</Button></span>
    </PageHeader>
  );
}
```

## Accessibility

A header landmark whose title is a level-1 heading (`as` changes the level), read before the lead as text; Tab reaches the view switch, then the action. Below 768 px the action sits on the title's line while the switch follows the lead, so the order read and tabbed is title, lead, switch, action.

Used on: Web, iOS, Android
Version: 1.0
