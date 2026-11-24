# VoiceTiles

Voices to cast from, each a tile with its name and a few words on how it sounds ("Bright, determined").

## When to use

Use it for casting a voice: a tile per voice with its name and a few words on how it sounds ("Bright, determined"), where choosing one plays it and selects it.

- Not for hearing the voice already cast: use `AudioPlayer`.
- Not for choosing among sound options in the cut: use `Waveform`.
- Not for a direction choice drawn as icons: use `OptionTiles`.

## How it works

- Choosing a tile plays the voice and selects it; five across.
- With sound on, a new voice plays the choose sound (README · Sound).
- `silent` draws the tiles with no play mark, for a choice that has nothing to hear yet, such as an archetype before its voice is cast.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `options` | `object[]` | required | The voices: a name, a value and a line on how it sounds. |
| `options[].label` | `string` | required |  |
| `options[].value` | `string` |  |  |
| `options[].description` | `string` |  |  |
| `value` | `string` |  | The voice chosen. |
| `columns` | `number` |  | Tiles to a row. |
| `label` | `string` |  | Names the choice for screen readers. |
| `silent` | `boolean` |  | No play mark: the choice has nothing to hear yet. |
| `onChange` | `(value: string) => void` |  | Called with the value chosen. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { useState } from 'react';
import { VoiceTiles } from '@anicanon/sakuga/anicanonkit';

export function Archetype() {
  const [voice, setVoice] = useState('Shounen Hero');
  return (
    <VoiceTiles
      label="Archetype"
      value={voice}
      onChange={setVoice}
      options={[
        { label: 'Shounen Hero', description: 'Bright, determined' },
        { label: 'Cool', description: 'Low, unhurried' },
        { label: 'Gruff Mentor', description: 'Weathered, warm' },
      ]}
    />
  );
}
```

## Accessibility

A radio group named by `label` and one Tab stop: arrows move to a voice and choose it through `onChange`, each a radio read by its name and description and "checked" when chosen; the play mark is hidden.

Used on: Web, iOS, Android
Version: 1.1
