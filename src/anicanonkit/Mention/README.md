# Mention

Mention is a reference inside prose: `@` a character (filled), `#` a place (underlined), `&` an object (`kind="object"`, a hairline box, never broken across lines).

## When to use

Use it for a reference inside prose or a prompt: @ a character, # a place, $ a reference the creator added, ringed while its card is open.

- Not for who or what a panel or a prompt binds, with its picture and note: use `MentionChip`.
- Not for a quiet action inside a line of text: use `TextLink`.
- Not for words a check flagged inside a sentence: use `Text`.

## How it works

- `active` rings the one whose card is open.
- `image` puts its picture before the name, at the size of the words, so the line keeps its height; a character with no portrait passes `figure` (its age figure, `age-adult`) and stands as that, never a bare name: a character's face round, a place's art and an object's picture square-cornered, the object's on the canvas colour so a cut-out reads. Maki's words use it, so every name Maki says shows who or what it is.
- `kind="event"` is an event in the words: its type's glyph (`type`, as `EventGlyph` draws it), the title in quotes, and where it was told after it, quiet (`told`: "Ep 3", "Manga").
- `$` a reference the creator added (`kind="reference"`); its name is one word to the prompt, so it never breaks at a hyphen.
- `missing` marks a mention whose reference left the take (a clip's frame removed, a reference taken off): it stays in the words, in the danger text with a wavy rule on every kind, so nothing is sent pointing at nothing and the creator sees what to fix. Adding the same picture back clears it.
- A place's and a reference's underline is a flat rule across the whole name; only the character's fill has rounded corners. The active ring keeps them on every kind.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `kind` | `'character' \| 'place' \| 'reference' \| 'object' \| 'event'` | `'character'` | The mark: `character` writes |
| `active` | `boolean` |  | Rings the mention: the one whose chip or card is open. |
| `image` | `string` |  | Its picture before the name, at the size of the words, so the line keeps its height. |
| `figure` | `IconName` |  | A character with no portrait: its age figure (`age-adult`), never a bare name. |
| `type` | `EventType` |  | kind `event`: its type's glyph, as EventGlyph draws it. |
| `told` | `string` |  | kind `event`: where it was told, quiet after the title ("Ep 3", "Manga"). |
| `missing` | `boolean` |  | Its reference left the take: drawn and read as missing. |
| `children` | `string` | required | The name as written, without its mark. |

## Example

```tsx
import { Mention } from '@anicanon/sakuga/anicanonkit';

export function MentionExample() {
  return (
    <Mention>Toddy</Mention>
  );
}
```

## Accessibility

Not focusable; read as text, its mark first ("@Aiko", "#Harbour", "&The red watch"), an event as its quoted title and where it was told, the picture and glyph hidden, with "missing" after a `missing` one and "card open" after the `active` one.

Used on: Web, iOS, Android
Version: 1.3
