# PlaceCard

The place or backdrop being made, on the left of its flow: its picture once drawn, or before that an empty frame naming what fills it (with the loader while it draws), its name, a quiet line under it, its facts and a note.

## When to use

Use it for the place or backdrop being made, on the left of its flow: its picture or an empty frame, its name, its facts and what happens next.

- Not for a character in its flows: use `CharacterCard`.
- Not for a picture with its caption, in a grid or a strip: use `Thumb`.
- Not for a place named in a prompt or a script: use `MentionChip`.
- Not for a job's stages in order: use `Stages`.

## How it works

- Built from the core's `Thumb` and `FactList`; it lives in AniCanonKit, not the core.
- One per flow screen, on the left, as `CharacterCard` is in the character flows. Nothing sits on the picture: the flow's footer holds the action.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `name` | `string` | required | The place or backdrop. |
| `caption` | `string` |  | The quiet line under the name ("A place in EBA"). |
| `image` | `string` |  | The picture at 16:9 once there is one: a place's anchor, or the backdrop. |
| `alt` | `string` |  | Names the picture; the place's name without it. |
| `lightMap` | `string` |  | The picture's baked light map, passed to its Thumb: its own highlights glow under the pointer (light on art). |
| `light` | `boolean` |  | Passed to its Thumb: on wherever there is a `lightMap`; false turns it off. |
| `placeholder` | `string` |  | With no picture yet: what the frame will hold ("The anchor is drawn here", "Drawing", "Not drawn"). |
| `drawing` | `boolean` |  | With no picture yet: the loader beside the placeholder while it draws. |
| `facts` | `object[]` |  | A few facts, as a `FactList`: district, inside or out, views planned. |
| `facts[].label` | `string` | required |  |
| `facts[].value` | `string` | required |  |
| `note` | `string` |  | What happens next, under everything ("Nothing is drawn until you approve the plan."). |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { PlaceCard } from '@anicanon/sakuga/anicanonkit';

export function NewPlace() {
  return (
    <PlaceCard
      name="Sé station"
      caption="A place in EBA"
      placeholder="Drawing"
      drawing
      facts={[{ label: 'District', value: 'Centro' }, { label: 'Inside or out', value: 'Interior' }, { label: 'Views', value: '5 planned' }]}
      note="You can close this. We’ll tell you when the anchor is ready."
    />
  );
}
```

## Accessibility

Not focusable; a region named by `name`, with the picture's alt from `alt` or the name, the name as a level-2 heading, then the caption, facts and note as text. While it draws, the empty frame reads its `placeholder`, and its loader stays quiet inside the card.

Used on: Web
Version: 1.0
