# CharacterStats

Who a character is at a glance: each fact as its picker's icon, the value and what it is.

## When to use

Use it for who a character is at a glance: each fact as its picker's icon, the value and what it is, as tiles in a card or on a phone, or as pills across the character's page.

- Not for who a character is at a point in the story, with since when: use `FactList`.
- Not for the whole character as one card: use `CharacterCard`.
- Not for what a character is ready with: use `Readiness`.
- Not for words kept as tags, such as a visual vibe: use `TagList`.

## How it works

- Tiles (the default) in a `CharacterCard` and on a phone, three across. `changed` rings a fact edited in this session.
- `layout="pills"` lays them across a character's page, beside the portrait.
- The icon is the same one the picker shows, from the world's morphology (human, anthro, creature).

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `stats` | `CharacterStat[]` | required | The facts, in order. |
| `stats[].icon` | `IconName` |  | The icon the picker shows for this fact, from the world's morphology. |
| `stats[].value` | `string` | required | The fact ("Tall", "Curvy"). |
| `stats[].label` | `string` | required | What the fact is ("Height", "Build"). |
| `stats[].changed` | `boolean` |  | Rings a fact edited in this session. |
| `layout` | `'tiles' \| 'pills'` |  | `tiles` (default) in a CharacterCard and on a phone; `pills` across a character's page. |
| `columns` | `number` |  | Tiles to a row (default 3). |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { CharacterStats } from '@anicanon/sakuga/anicanonkit';

export function KenAtAGlance() {
  return (
    <CharacterStats
      stats={[
        { icon: 'gender-male', value: 'Male', label: 'Gender' },
        { icon: 'age-adult', value: 'Adult', label: 'Age' },
        { icon: 'height-tall', value: 'Tall', label: 'Height' },
        { icon: 'body-fit', value: 'Fit', label: 'Build', changed: true },
      ]}
    />
  );
}
```

## Accessibility

Not focusable; each stat reads as text, its value then its name (its name then its value as pills), with "changed" after a changed one, and the icons are hidden.

Used on: Web, iOS, Android
Version: 1.0
