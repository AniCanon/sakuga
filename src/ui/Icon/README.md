# Icon

Icon draws one glyph from AniCanon's outline icon set: 24px grid, 2px stroke, round caps and joins, `currentColor`.

## When to use

Use it for one glyph from AniCanon's outline set inside a control or beside words: a field's leading glyph, a tab bar item, a Studio panel's header.

- Not for an action shown as a glyph alone: use `IconButton`.
- Not for the shape of a story event: use `EventGlyph`.
- Not for the Fragments mark: use `FragmentSoul`.

## How it works

- Pass `name` from the set; the preview lists every name.
- Size 18–22 inside controls, 22 in the tab bar. The glyph sits inside a 44px target, never as the target.
- An Icon is decorative (`aria-hidden`) unless you pass `title`. When an icon is the only content of a control, name the control instead (IconButton `label`).
- Colour comes from the parent's `color`: the glyph is `currentColor`, and Icon sets no colour of its own.
- `play` and `pause` are filled shapes; every other icon is a stroke.
- `thing` is a cube: a thing in the world (a prop, a weapon, a pet, a vehicle), and Designs, where things are kept. A thing never uses `composition-centered`, which is a framing mark.
- A design's kinds are outlines: `characters` (Suit), `uniform` (a shirt with a collar and badge), `armour` (a plain shield), `jersey` (a sleeveless top with a number), `occasion-hanger` (Accessory), `weapon`, `thing` (Prop), `pet` and `vehicle`. The filled `occasion-uniform`, `occasion-combat` and `occasion-athletic` stay for wardrobe occasions.
- `pet` is a paw print: the Pet kind and a pet kept in Designs. `creature-size-small` stays in the creature size chart.
- `weapon` is a sword and `vehicle` a car: the Weapon and Vehicle kinds of a thing. A weapon never uses `bolt`, a vehicle never `movement-tracking-shot` (a camera move).
- `lock` is a closed padlock: something only some accounts open.
- `download` is `upload`'s twin, the arrow into the tray: saving a copy to the device.
- `sound` is a waveform: a sound effect, and the Cut's Sound tool that makes them. It is never `mic` (a voice, recording), `volume` (the Audio tool, loudness) or `effect-particles` (a visual effect).
- `heart-filled` is the liked state of `heart`. `captions`, `volume-off`, `clock` and `sliders` cover player and reader controls.
- The set now holds AniCanon's own drawn icons, copied exactly from the portal: shot, angle, depth, movement, composition, lens, mood, lighting, weather, effects, frames, and the registry icons (`camera`, `characters`, `backdrops`, `collection`, `folder`, `video`…). `auto` marks every Auto option, where the director chooses for you: four framing marks around the subject, like a viewfinder. It is never a sparkle.
- Character pickers use filled silhouettes that follow the world's morphology: human (`body-*`, `height-*`, `age-*`, `figure-*`), anthro (`anthro-*`) and creature (`creature-age-*`, `creature-build-*`, `creature-size-*`). Pick the set from the project's morphology, never mix them. `gender-*`, `faction-*` and `trait-*` are shared.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `name` | `IconName` | required | Which icon, from Sakuga's set. |
| `size` | `number \| string` | `20` | Pixels, or a size token such as 'var(--button-icon-size)'. |
| `title` | `string` |  | Names the icon for screen readers; hidden without it. |
| `strokeWidth` | `number` |  | The stroke's width, for an icon drawn larger or smaller than its grid. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { Icon } from '@anicanon/sakuga/ui';

export function IconExample() {
  return (
    <Icon name="search" title="Search" />
  );
}
```

## Accessibility

Decorative by default: hidden from screen readers and never focusable. With `title` it is an image named by that title.

Used on: Web, iOS, Android
Version: 1.5
