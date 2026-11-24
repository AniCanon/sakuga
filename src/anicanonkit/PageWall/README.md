# PageWall

PageWall is Proof: every page of the issue at once, in spreads, each with its caption and how far it has come.

## When to use

Use it for the Proof view: every page of the issue at once in spreads, each with its caption and how far it has come (Laid out, Drawn, Lettered, Proofed).

- Not for placing a page in its issue while editing: use `IssueStrip`.
- Not for editing a page: use `EditorShell`.
- Not for one page on its own: use `MangaPage`.

## How it works

- `spreads` as for `IssueStrip`; each page adds `title`, `meta` (its stage in words) and `stage`, the number of `steps` it has passed (Laid out, Drawn, Lettered, Proofed).
- `columns` spreads to a row (3 on desktop); a page-turn rule sits between spreads in a row.
- Choosing a page opens it beside the wall; the wall itself never edits.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `spreads` | `(MangaPageProps & { stage?: number; })[][]` | required | The issue's spreads, each one or two pages, as for IssueStrip; each page adds `title`, `meta` and `stage`. |
| `size` | `number` |  | Each page's width in px. |
| `columns` | `number` |  | Spreads to a row (3 on desktop). |
| `steps` | `string[]` |  | Default: Laid out, Drawn, Lettered, Proofed. |
| `label` | `string` |  | Names the wall for screen readers. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { PageWall } from '@anicanon/sakuga/anicanonkit';

export function Proof({ cover, page3, page4 }: { cover: string; page3: string; page4: string }) {
  return (
    <PageWall
      columns={3}
      spreads={[
        [{ image: cover, label: 'Front cover', title: 'Cover', meta: 'Drawn', stage: 2 }],
        [{ image: page3, label: 'Page 3', title: '3 · Bruce', meta: 'Lettered', stage: 3 }, { image: page4, label: 'Page 4', title: '4 · First snow', meta: 'Proofed', stage: 4 }],
      ]}
    />
  );
}
```

## Accessibility

Not focusable; a list named by `label` (default "The whole issue") with a spread per item: each page is an image named by its `label`, `alt` or `title`, then its title, meta and stage (an image named by its step) read as text, with a "Page turn" separator between spreads.

Used on: Web
Version: 1.0
