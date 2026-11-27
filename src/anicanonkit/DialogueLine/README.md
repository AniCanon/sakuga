# DialogueLine

DialogueLine is a planned line: speaker, delivery, where it falls in the beat, the line in the spoken language and its translation.

## When to use

Use it for a planned line: the speaker, the delivery, where it falls in the beat, the line in its spoken language and its translation.

- Not for dialogue as written in the screenplay: use `ScreenplayLine`.
- Not for a subtitle over video: use `Caption`.
- Not for hearing the line: use `AudioPlayer`.

## How it works

- The quotes follow the line's language: a Japanese line is set in 「」, any other in “”. `lang` names it ("ja", "en"); left out, kana or kanji in `line` make it Japanese. The translation under it is never quoted.
- The line may carry markup as children instead of `line`: a `Revision` inside the words.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `lang` | `string` |  | The line's language ("ja", "en"); read from the line when left out: kana or kanji make it Japanese, set in 「」. |
| `speaker` | `string` | required | Who says it. |
| `line` | `string` |  | Or the line as children, when it carries markup. |
| `image` | `string` |  | The speaker's face. |
| `delivery` | `string` |  | How it's said ("whispered"), after the speaker. |
| `at` | `string` |  | Where in the cut it lands ("0:42"). |
| `translation` | `string` |  | The line in the viewer's language, under it. |
| `children` | `ReactNode` |  | The line with markup (a Revision inside the words). |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { DialogueLine } from '@anicanon/sakuga/anicanonkit';

export function DialogueLineExample() {
  return (
    <DialogueLine speaker="Kiko" delivery="quiet, certain" at="at 1.2 s" line="来なさい、ケン。" translation="Come here, Ken." />
  );
}
```

## Accessibility

Not focusable; read as text in order: the speaker, the delivery and where it falls, the line as a quotation, then the translation. The speaker's picture is hidden.

Used on: Web
Version: 1.1
