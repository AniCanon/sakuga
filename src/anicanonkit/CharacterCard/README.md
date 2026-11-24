# CharacterCard

A character as one card: stage (silhouette, avatar or 9:16 portrait; 16:9 with `stage.creature`), role, name, stat tiles, traits, an optional listen-only voice and a note.

## When to use

Use it for a character as one card in every character flow (creation, editing, looks, voice and face): the stage, role, name, stats, traits and a note.

- Not for a cast member on the cast page: use `CastCard`.
- Not for a character's facts on their own, across their page: use `CharacterStats`.
- Not for a character's face and name in a row or on a series page: use `CastAvatar`.
- Not for one look of a character: use `LookPlate`.
- Not for a place or backdrop being made: use `PlaceCard`.

## How it works

- The same card in creation, editing, looks, voice and face flows. Built only from core components and tokens; it lives in AniCanonKit, not the core.
- The stage is the picture's ground, as media is, so it never follows the theme: a silhouette or an avatar stands on black (`bg-media`) in light and dark alike, and a portrait on the white paper its sheet is drawn on (`look-plate-bg`). A ground that changed with the theme would change how the picture reads.
- `voice` takes `playing`, `onToggle` and `onSeek`, as `AudioPlayer` does; its play button is named for the character's voice.
- `stage.imageStyle` (from `Sakuga.cropStyle`) shows an avatar stage through the crop being chosen, so the card follows a `Cropper` as it moves.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `name` | `string` | required | The character's name, the card's title. |
| `role` | `string` |  | A one-line role under the name. |
| `stage` | `object` |  | A portrait stands head to toe at 9:16, as it is drawn; `creature` makes it 16:9. |
| `stage.kind` | `'icon' \| 'avatar' \| 'portrait'` | required |  |
| `stage.creature` | `boolean` |  | A creature's portrait: 16:9 (a character's is 9:16). |
| `stage.image` | `string` |  |  |
| `stage.icon` | `IconName` |  |  |
| `stage.alt` | `string` |  |  |
| `stage.imageStyle` | `string` |  | From Sakuga.cropStyle: an avatar stage follows a Cropper as it moves. |
| `stats` | `(CharacterStat & { icon: IconName })[]` |  | Drawn as `CharacterStats` tiles; `changed` rings a stat edited in this session. |
| `traits` | `object[]` |  | Traits as chips under the stats, each with its icon. |
| `traits[].icon` | `IconName` | required |  |
| `traits[].label` | `string` | required |  |
| `voice` | `object` |  | Listen-only player. |
| `voice.duration` | `number` | required |  |
| `voice.value` | `number` |  |  |
| `voice.seed` | `number` |  |  |
| `voice.playing` | `boolean` |  |  |
| `voice.onToggle` | `(playing: boolean) => void` |  |  |
| `voice.onSeek` | `(seconds: number) => void` |  |  |
| `note` | `string` |  | A quiet line at the card's foot. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { CharacterCard } from '@anicanon/sakuga/anicanonkit';

export function NewCharacter() {
  return (
    <CharacterCard
      name="Kiko"
      role="Leads the E.R.A."
      stage={{ kind: 'icon', icon: 'body-average' }}
      stats={[
        { icon: 'gender-female', value: 'Female', label: 'Gender' },
        { icon: 'age-adult', value: 'Adult', label: 'Age' },
        { icon: 'height-average', value: 'Average', label: 'Height' },
      ]}
      traits={[{ icon: 'trait-calm', label: 'Calm' }, { icon: 'trait-bold', label: 'Bold' }]}
      note="This card fills in as you go."
    />
  );
}
```

## Accessibility

A complementary region named by `name` (or "Character"); a portrait's alt is `stage.alt` or the name, an avatar's is `stage.alt` (empty, so hidden, by default), and the silhouette is hidden. The role, name, stats, traits and note read as text, the voice's play button is named for it ("Play Aiko's voice"), and with `voice.onSeek` its waveform is a slider.

Used on: Web, iOS, Android
Version: 1.3
