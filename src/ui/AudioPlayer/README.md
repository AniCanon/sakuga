# AudioPlayer

A voice line or sound clip: a round play button, a `Waveform` you can click, drag or arrow through to seek, and the time.

## When to use

Use it for hearing a voice line or an audio take: a round play button, a waveform to seek through, and the time.

- Not for a sound drawn as bars alone, such as a track in the cut: use `Waveform`.
- Not for choosing a voice to cast: use `VoiceTiles`.
- Not for a sound's level and mute: use `VolumeControl`.
- Not for the playhead of an episode or a short: use `Scrubber`.

## How it works

- Use it wherever a character's voice or an audio take is heard. Listening only: voice settings live in casting, never next to the player.
- The waveform is the core `Waveform`: bars 2px wide with 2px gaps, never thicker, as many as fit. The played colour sweeps through them linearly as `value` advances; dragging seeks with no easing. The play button sinks on press and its icon swaps in. Tokens: `--audio-play-bg`, `--audio-play-fg`, `--audio-wave`, `--audio-wave-played`, `--audio-time`.
- `label` names the sound for screen readers when no `title` shows: the play button says "Play" and the waveform "Position in" with it.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `title` | `string` |  | The sound's name; with a title the play button grows to 48 and the waveform sits under the titles. |
| `subtitle` | `string` |  | A line under the title ("Cast as Shounen Hero"). |
| `label` | `string` |  | Names the sound for screen readers when no title shows: "Play" and "Position in" are said with it. |
| `duration` | `number` | required | Its length in seconds. |
| `value` | `number` |  | Where it is, in seconds: the played part of the waveform is the accent. |
| `playing` | `boolean` |  | Whether it is playing; the play button reads Pause while it is. |
| `onToggle` | `(playing: boolean) => void` |  | Called with the new state when play or pause is pressed. |
| `onSeek` | `(seconds: number) => void` |  | Makes the waveform a slider: called with the new time in seconds. |
| `peaks` | `number[]` |  | Real loudness, resampled to the bars that fit; without it a calm, even shape is drawn from `seed`. |
| `bars` | `number` |  | How many bars the waveform draws; as many as fit without it. |
| `seed` | `number` |  | Shapes the calm, even waveform drawn when there are no `peaks`. |
| `size` | `'sm' \| 'md'` |  | `sm` for cards and rows. |
| `variant` | `'default' \| 'media'` |  | `media` on dark art: the play button is white with a dark glyph, as Button media is, so the one action reads over the picture. |
| `className` | `string` |  | Extra class on the root element. |
| `style` | `CSSProperties` |  | Inline style on the root element. |
| `children` | `ReactNode` |  | Trailing actions beside the title (Recast, a menu). |

## Example

```tsx
import { AudioPlayer } from '@anicanon/sakuga/ui';

export function AudioPlayerExample() {
  return (
    <AudioPlayer title="Rain on glass" duration={40} value={12} playing />
  );
}
```

## Accessibility

Tab reaches the play button, announced "Play" or "Pause" (from `playing` once it is given) followed by `label`, else `title` (or "audio"), then the title's actions (`children`), then, with `onSeek`, the waveform: a slider named "Position in" plus that name, where arrows move a second, Home and End jump to either end, and the value is spoken as "12 seconds of 40 seconds". The time ("0:12 / 0:40") reads as text; without `onSeek` the waveform is hidden and can't be moved.

Used on: Web, iOS, Android
Version: 1.0
