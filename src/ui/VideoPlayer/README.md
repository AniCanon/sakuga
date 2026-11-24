# VideoPlayer

VideoPlayer is a clip played where it is shown: its picture, with play, the track, sound and full screen over it.

## When to use

Use it for a clip that plays where it is shown: a Library item, a landed take on Studio's stage.

- Not for the frame being edited, with its guides: use `Monitor`.
- Not for a clip in a grid or a strip: use `MediaCard` or `Thumb`.
- Not for only the playhead under a picture: use `Scrubber`.
- Not for hearing a voice line or a take's sound: use `AudioPlayer`.

## How it works

- `src` is the video and `poster` the frame shown before it plays; `name` names it in every control ("Play Red Line fight") and `alt` describes the picture.
- The controls sit over the picture's foot on a legibility scrim: the `Scrubber` across with the time and length, then play or pause, and at the end mute and full screen. Media surfaces, so they stay dark in both themes.
- Paused, a large play sits in the middle, or, on a player too short for both, just above the track, so the two never meet; a press anywhere on the picture plays or pauses, the scrim between the controls included (only the controls themselves take a press, and none while they are hidden). Playing, the controls fade after the pointer rests and come back on a move, a press or focus. Waiting for frames, the picture dims under the app's loader (`Loader` unless the app sets one; AniCanon's mark in AniCanon). Ended, it rests on the last frame and play says "Play Red Line fight again", until it plays or is moved back along the track.
- `fill` takes its column's height and makes the player as large as its shape allows, centred (Studio's stage); `ratio` is that shape as a number, 16:9 by default.
- `loop` plays it again from the start. `muted` starts it silent.
- Without `src`, the poster shows and `playing`, `time`, `duration`, `loading` and `ended` say what state it is in (a board, or a page that drives its own video). With no poster either, the player is its dark frame, never a broken picture.
- `onToggle`, `onSeek` and `onMute` hear the controls; with `src` the player plays its own video.
- A clip's actions (Use in a production, Continue from the last frame) sit under the player, never over the picture.
- The Library grid shows a clip as a `MediaCard`, its poster and length, and a press opens its page, where the clip plays in this player.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `src` | `string` |  | The video; with it the player plays its own. |
| `poster` | `string` |  | The frame shown before it plays, and the picture without `src`. |
| `name` | `string` |  | Names it in every control: "Play {name}". |
| `alt` | `string` |  | Describes the picture. |
| `fill` | `boolean` |  | Takes its column's height, as large as its shape allows, centred. |
| `ratio` | `number` |  | Its shape as a number; 16:9 by default. |
| `loop` | `boolean` |  | Plays it again from the start. |
| `muted` | `boolean` |  | Starts it silent. |
| `playing` | `boolean` |  | Without `src`: whether it plays. |
| `time` | `number` |  | Without `src`: the playhead, in seconds. |
| `duration` | `number` |  | Without `src`: its length, in seconds. |
| `buffered` | `number` |  | Without `src`: how much has loaded, in seconds. |
| `loading` | `boolean` |  | Without `src`: waiting for frames. |
| `ended` | `boolean` |  | Without `src`: it has played to the end. |
| `onToggle` | `(playing: boolean) => void` |  | Called with the state play or pause asks for. |
| `onSeek` | `(seconds: number) => void` |  | Called with the new playhead, in seconds. |
| `onMute` | `(muted: boolean) => void` |  | Called with the new mute. |
| `className` | `string` |  | Extra class on the player. |
| `style` | `CSSProperties` |  | Inline style on the player. |

## Example

```tsx
import { VideoPlayer } from '@anicanon/sakuga/ui';

export function TakePreview({ src, still }: { src: string; still: string }) {
  return <VideoPlayer src={src} poster={still} name="Red Line fight" alt="Two fighters trade blows on a platform" duration={8} />;
}
```

## Accessibility

A group named "{name}, video". Tab reaches play or pause (a button named "Play {name}", "Pause {name}" or "Play {name} again"), the seek slider ("Seek in {name}", a second per arrow), mute (a toggle, "Mute {name}") and full screen (a toggle, "Full screen"). With focus anywhere in the player, Space or K plays and pauses, M mutes, F goes full screen and Left and Right step a second; keyboard focus inside keeps the controls shown (a pointer's focus lets them fade), and the large play and the picture's press do what play does; the large play goes as it plays, and hands its focus to play or pause. The loader is named "Loading {name}". Gap: the time is read through the slider only, with no live update while it plays.

Used on: Web
Version: 1.3
