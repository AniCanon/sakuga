# Waveform

Waveform draws a sound as bars: a voice line, a take, a track in the cut, a generated sound option.

## When to use

Use it for a sound drawn as bars: a voice line, a take, a track in the cut, a generated sound option (`selected` on the one in use).

- Not for a sound with its play button and time: use `AudioPlayer`.
- Not for the cut's tracks laid out in time: use `Timeline`.
- Not for the playhead of an episode or a short: use `Scrubber`.

## How it works

- It is the one drawing every sound in Sakuga uses: `AudioPlayer` is a play button, a Waveform and the time, and `Timeline` draws its audio, dialogue and music tracks with it.
- Bars are 2px wide with 2px gaps and never thicker; as many as fit the width. `peaks` (0–1) is the real loudness, resampled to those bars; without it a calm, even shape is drawn from `seed`. `bars` fixes the count.
- `value` of `duration` (seconds) puts the played part in the accent. It is one clipped layer, so playback sweeps through the bars linearly.
- `onSeek` makes it the slider, named by `label`: click or drag to seek (the position stays under the pointer, never eased), arrow keys move a second, Home and End jump to the ends, and the value is spoken ("1 second of 4 seconds"). Without `onSeek` it is a picture, and screen readers skip it.
- `selected` marks the sound option in use: its bars take the accent on `motion-fast`.
- `size` `md` (28px) or `sm` (20px); `variant="media"` on dark art.
- Tokens: `--waveform-bar`, `--waveform-played`, `--waveform-selected`. AudioPlayer feeds its `--audio-wave` tokens in; Timeline its per-track wave tokens.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `peaks` | `number[]` |  | Real loudness, 0–1, resampled to the bars that fit. |
| `bars` | `number` |  | A fixed bar count instead of fitting the width. |
| `seed` | `number` |  | Shapes the calm placeholder drawn without peaks. |
| `value` | `number` |  | Seconds; the played part takes the accent. |
| `duration` | `number` |  | The sound's length in seconds; with `value` the played part is the accent. |
| `size` | `'sm' \| 'md'` |  | `md` (28 px) or `sm` (20 px). |
| `variant` | `'default' \| 'media'` |  | `media` on dark art. |
| `selected` | `boolean` |  | The sound option in use. |
| `active` | `boolean` |  | The sound option chosen. |
| `onSeek` | `(seconds: number) => void` |  | Makes it the slider; called with seconds. |
| `label` | `string` |  | The slider's name, e.g. "Position in His voice". |
| `className` | `string` |  | Extra class on the root element. |
| `style` | `CSSProperties` |  | Inline style on the root element. |

## Example

```tsx
import { Waveform } from '@anicanon/sakuga/ui';

export function WaveformExample() {
  return (
    <Waveform seed={8} />
  );
}
```

## Accessibility

Without `onSeek` it is decorative and hidden from screen readers. With `onSeek` it is a slider named by `label` (default "Position") that Tab reaches: arrows move it by a second, Home and End to either end, and its value is spoken as "12 seconds of 40 seconds".

Used on: Web, iOS, Android
Version: 1.0
