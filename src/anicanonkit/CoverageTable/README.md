# CoverageTable

Wardrobe coverage: a row per character and a column per occasion the scripts ask for.

## When to use

Use it for wardrobe coverage across the cast: a row per character, a column per occasion the scripts ask for, and the gaps where a scene needs a look and nothing fits.

- Not for one look and its occasion: use `LookPlate`.
- Not for what one character is ready with: use `Readiness`.
- Not for each cast member's state and next step: use `CastGrid`.

## How it works

- A cell says what they have (`own`, "2 looks"), that a scene needs a look and nothing fits (`gap`, "3 scenes · nothing"), or that nothing is needed yet (`idle`).
- `legend` names the three states over the table; `summary` counts the gaps and says which script they come from.
- A gap is the only accent; nothing else is coloured.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `occasions` | `string[]` | required | The column headings: the occasions a look can be for. |
| `rows` | `object[]` | required | One row per character, with a cell per occasion: `own`, `gap` or `idle`, and its words ("2 looks"). |
| `rows[].name` | `string` | required |  |
| `rows[].image` | `string` |  |  |
| `rows[].cells` | `object[]` | required |  |
| `rows[].cells[].state` | `CoverState` | required |  |
| `rows[].cells[].label` | `string` |  |  |
| `legend` | `object[]` |  | Names the cell states, over the table. |
| `legend[].state` | `CoverState` | required |  |
| `legend[].label` | `string` | required |  |
| `summary` | `string` |  | Counts the gaps and says which script they come from. |
| `rowLabel` | `string` |  | The rows' column heading ("Character"). |
| `label` | `string` |  | Names the table for screen readers. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { CoverageTable } from '@anicanon/sakuga/anicanonkit';

export function WardrobeCoverage() {
  return (
    <CoverageTable
      label="Wardrobe coverage"
      summary="1 gap · from Episode 2"
      legend={[{ state: 'own', label: 'Has a look' }, { state: 'gap', label: 'A scene needs it' }, { state: 'idle', label: 'Not needed yet' }]}
      occasions={['Everyday', 'Uniform', 'Combat']}
      rows={[
        { name: 'Kiko', cells: [{ state: 'own', label: '1 look' }, { state: 'idle' }, { state: 'gap', label: '3 scenes' }] },
        { name: 'Ken', cells: [{ state: 'own', label: '2 looks' }, { state: 'own', label: '1 look' }, { state: 'idle' }] },
      ]}
    />
  );
}
```

## Accessibility

Not focusable; a table named by `label` with a column header per occasion and a row header per character, each cell read as its label and its state in the legend's words ("2 looks, Has a look"; a cell without a label reads the state alone), and the legend reads as text with its swatches hidden.

Used on: Web, iOS, Android
Version: 1.0
