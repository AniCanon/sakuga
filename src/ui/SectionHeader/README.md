# SectionHeader

SectionHeader opens a shelf: a heading, the line that explains what is on it, and an optional See all link.

## When to use

Use it for the heading that opens a shelf, with the line that says what is on it ("Shorts · videos under a minute") and an optional See all link.

- Not for a labelled group of rows in a Story panel, with its count: use `PanelSection`.
- Not for the top of a side panel in Story: use `PanelHeader`.
- Not for the top of an app page, with its title-1 and view switch: use `PageHeader`.
- Not for the top of a production view: use `ViewHeader`.
- Not for the label over a single control in a form: use `Field`.

## How it works

- Always write the subtitle. It tells a new viewer what the shelf holds: "Shorts · videos under a minute", "Places in the story".
- `size="lg"` (title-2) on desktop, `md` (title-3) on phone.
- Give the See all link an `ariaLabel` with its object ("See all EBA shorts").
- `size="xs"` is a label over a strip or a group inside a panel ("The issue, spread by spread"): 12px, no link. `count` follows the label and `subtitle` is a caption under it, for a group that needs a line of explanation ("Lineages · 2", "Where characters come from."). Children sit at the row's end, such as a key.
- `icon` and `count` head a group in a list (a faction and how many are in it). With no `action` link, children sit at the row's end (a button).
- `size="sm"` (17 px) heads a section inside a page.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `title` | `ReactNode` | required | The shelf's or group's name, as a heading. |
| `subtitle` | `ReactNode` |  | The line that explains the shelf: "Shorts · videos under a minute". |
| `action` | `object` |  | The See all link at the end, with its name for screen readers. |
| `action.label` | `string` | required |  |
| `action.href` | `string` |  |  |
| `action.ariaLabel` | `string` |  |  |
| `action.onClick` | `MouseEventHandler` |  |  |
| `size` | `'lg' \| 'md' \| 'sm' \| 'xs'` |  | lg = desktop (title-2), md = phone (title-3), sm = a section inside a page (17 px), xs = a label over a strip or a group inside a panel (12px; a count after it and a subtitle under it, no action or icon). |
| `as` | `'h2' \| 'h3'` |  | The heading's level: h2 (default) or h3. |
| `id` | `string` |  | The title's id, for what it labels (aria-labelledby). |
| `icon` | `IconName` |  | Heads a group in a list (a faction), with count: how many are in it. |
| `count` | `ReactNode` |  | How many it holds, read inside the heading. |
| `children` | `ReactNode` |  | What sits at the end of the row when there is no action, e.g. a key or a button. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { SectionHeader } from '@anicanon/sakuga/ui';

export function SectionHeaderExample() {
  return (
    <SectionHeader title="Shorts" subtitle="Vertical videos under a minute from EBA · moments, trailers, behind the scenes" action={{ label: 'See all', ariaLabel: 'See all EBA shorts', href: '#shorts' }} />
  );
}
```

## Accessibility

The title is a heading (`as`, default h2) with its count read inside it, then the subtitle as text, and Tab reaches the See all link, named by `action.ariaLabel` or `action.label` (an action with only `onClick` is a button, never a link to #); the icon is hidden. At size xs the title is plain text, not a heading, with its count and subtitle read after it.

Used on: Web, iOS, Android
Version: 1.2
