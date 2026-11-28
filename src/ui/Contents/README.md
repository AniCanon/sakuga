# Contents

Contents lists a document's sections in order, one press each: the sections of an open canon document under its row.

## When to use

Use it for the sections of one document, in order, where one is open beside them: a canon document's sections under its row.

- Not for a page's main sections: use `SideNav` or `TopNav`.
- Not for rows with a picture, a second line or an action: use `ListRow`.
- Not for a link inside a sentence: use `TextLink`.
- Not for the views inside a production: use `ProductionNav`.

## How it works

- `items` are the sections (`{ label, href }`), `current` the index of the open one, and `onSelect` is called with a section's index. A section with `href` is a link; without it, a button.
- The open section reads in label weight and ink. Weight and colour are the whole state: no fill, no marker, no underline.
- A long title wraps onto further lines, left-aligned.
- `limit` shows the first sections and then "6 more"; pressing it opens the rest and puts focus on the first section it opened. The open section is never hidden behind it.
- `inset` lines the sections up with the title of the `ListRow` above them, for a document's sections under the document's row.
- A section answers the pointer by taking ink, never a fill.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `label` | `string` | required | Names the list for a screen reader ("Sections of World rules"). |
| `items` | `object[]` | required | A section each, in order: a link with `href`, else a button that calls `onSelect`. |
| `items[].label` | `string` | required |  |
| `items[].href` | `string` |  |  |
| `current` | `number` |  | The open section's index. |
| `onSelect` | `(index: number) => void` |  | Called with the section's index. |
| `limit` | `number` |  | Shows this many, then "{count} more" opens the rest; the open section is never hidden. |
| `inset` | `boolean` |  | Lines the sections up with the title of the ListRow above them. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { useState } from 'react';
import { Contents } from '@anicanon/sakuga/ui';

export function WorldRulesSections() {
  const [open, setOpen] = useState(0);
  return (
    <Contents
      label="Sections of World rules"
      items={[{ label: 'Setting' }, { label: 'The premise: Ancestral Fragments' }, { label: 'The awakening mechanic' }]}
      current={open}
      onSelect={setOpen}
    />
  );
}
```

## Accessibility

A navigation named by `label` ("Sections of World rules") holding an ordered list, so a screen reader says how many sections there are. Each section is a link or a button Tab reaches, and the open one is marked current. "6 more" is a button; pressing it puts focus on the first section it opened. In forced colours the open section is drawn in Highlight and focus keeps its ring.

Used on: Web
Version: 1.0
