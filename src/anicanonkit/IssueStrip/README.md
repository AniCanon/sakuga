# IssueStrip

IssueStrip shows the issue as the reader turns it: the cover alone, then the content pages paired into spreads, with a rule at every page turn.

## When to use

Use it for the issue as the reader turns it, in Layout and under the editor's canvas: the cover alone, then the pages in spreads with a rule at every page turn.

- Not for Proof, every page with how far it has come: use `PageWall`.
- Not for one page on its own: use `MangaPage`.
- Not for a page's panels, lettering and sound effects: use `LayerStrip`.
- Not for an issue on a shelf: use `MediaCard`.

## How it works

- `spreads` is a list of spreads, each a list of `MangaPage` props. Mark the open page `selected`.
- `selectSpread` (Spread mode) rings the whole spread that holds the selected page instead of the page.
- `size` is the page width: 56 in Layout, 30 or 18 under the editor's canvas. `label` names the strip; `false` hides it.
- It is a map, not a reader: it shows where a page sits and where the turns fall. Page turns matter to the story, so never hide them.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `spreads` | `MangaPageProps[][]` | required | The issue's spreads, each a list of MangaPage props; mark the open page `selected`. |
| `size` | `number` |  | Page width; 30 in the editor, 56 in Layout. |
| `selectSpread` | `boolean` |  | A selected page selects its whole spread (Spread mode). |
| `label` | `string \| false` |  | The header; false hides it. |
| `turnLabel` | `string` |  | The key in the header for the page-turn rule between spreads (default "Page turn"). |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { IssueStrip } from '@anicanon/sakuga/anicanonkit';

export function TheWinter({ cover, page3, page4 }: { cover: string; page3: string; page4: string }) {
  return (
    <IssueStrip
      label="The Winter"
      spreads={[
        [{ image: cover, label: 'Front cover' }],
        [{ image: page3, label: 'Page 3' }, { image: page4, label: 'Page 4', selected: true }],
        [{ frames: [{ x: 4, y: 4, w: 92, h: 30 }, { x: 4, y: 36, w: 92, h: 60, state: 'drawing' }], label: 'Page 5, drawing' }],
      ]}
    />
  );
}
```

## Accessibility

Not focusable; its label (default "The issue, spread by spread") and key read as text, then a list named "Spreads", each spread a list item holding its pages as images (named by `label` or `alt`, else "Page", with "selected"), the one `selectSpread` rings starting with "Selected spread", and the page-turn rules hidden.

Used on: Web
Version: 1.0
