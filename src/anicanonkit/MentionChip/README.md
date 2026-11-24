# MentionChip

MentionChip shows who or what a panel holds: a cast member (@), a place (#) or a prop, with its picture and a quiet note.

## When to use

Use it for who or what a panel or a prompt holds: a cast member (@), a place (#), a reference ($) or a prop, with its picture and a quiet note such as the outfit and the emotion.

- Not for a character's face, name and role in a row: use `CastAvatar`.
- Not for a mention inside prose: use `Mention`.
- Not for narrowing a feed by kind: use `Chip`.
- Not for words kept as removable tags: use `TagList`.

## How it works

- `kind` sets the mark: `character` writes @Bruce, `place` writes #Bruce's apartment, `reference` writes $rain-look (a picture the creator added, with what it is for as the note), `object` writes &The red watch (its picture square on the canvas colour, or the thing glyph until it has one; `prop` is the old name and draws the same). `event` shows its type's glyph and the title in quotes; `faction` its faction glyph.
- `note` carries the labels the Story page gives it: role and faction ("E.R.A. · lead"). `status` is a live state as a `Badge` after it ("Dead", "Left", "Burning"; `variant: "alert"` for a turn for the worse).
- A character with no portrait passes `figure` (`age-adult`, `age-child`, …) and shows its age figure on the canvas colour, as `CastCard` does. A chip is for a row of who and what (Maki's "named here", the context); inside a sentence use `Mention` with `image`, which keeps the line's height.
- `missing` is one deleted since: its name in the danger text with a wavy rule, as `Mention` draws it, its picture faded.
- `onRemove` (or `removable` on a board) holds it as Maki's context: a remove button beside the chip, never inside it, named "Remove Kiko".
- `tone="media"` over art, in the phone's dock.
- `note` is what this panel needs of it: the outfit and the emotion for a character ("Winter coat · tired").
- Pass the sheet's picture as `image`; a prop with no sheet yet shows no picture, never a stand-in.
- `imageStyle` (from `Sakuga.cropStyle`) shows the face through the square it will be cut to, beside a `Cropper`.
- `onClick` makes it a button that opens what edits it where you are, such as Studio's cast panel; give it `expanded`, `controls` and a `label` that names the action ("Kiko, casual, determined. Edit cast"). `href` is for a chip that goes somewhere else.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `imageStyle` | `string` |  | From Sakuga.cropStyle: the face shown through the square it will be cut to, beside a Cropper. |
| `name` | `string` | required | Who or what it binds, written with its mark. |
| `kind` | `'character' \| 'place' \| 'reference' \| 'object' \| 'prop' \| 'event' \| 'faction'` | `'character'` | The mark: `character` |
| `type` | `EventType` |  | kind `event`: its type's glyph. |
| `icon` | `IconName` |  | kind `faction` with no picture: its faction glyph (`faction-neutral` by default). |
| `status` | `object` |  | A live state as a Badge after it ("Dead", "Left", "Burning"; `variant: "alert"` for a turn for the worse). |
| `status.label` | `string` | required |  |
| `status.variant` | `BadgeProps['variant']` |  |  |
| `status.icon` | `IconName` |  |  |
| `missing` | `boolean` |  | Deleted since: its name in the danger text with a wavy rule, its picture faded. |
| `figure` | `IconName` |  | A character with no portrait: its age figure on the canvas colour (`age-adult`, `age-child`, …). |
| `onRemove` | `MouseEventHandler<HTMLButtonElement>` |  | Held as Maki's context: a remove button beside the chip, never inside it. |
| `removable` | `boolean` |  | Shows the remove button without a handler, on a board. |
| `tone` | `'media'` |  | `media` over art, as in the phone's dock. |
| `image` | `string` |  | Its sheet's picture; an object with no sheet yet shows the thing glyph, never a stand-in. |
| `note` | `string` |  | What this panel needs of it: a character's outfit and emotion ("Winter coat · tired"), its labels ("E.R.A. · lead"), a reference's purpose. |
| `href` | `string` |  | Makes it a link to its page. |
| `onClick` | `MouseEventHandler<HTMLButtonElement>` |  | Makes it a button that opens what edits it in place (Studio's cast panel); href stays for a link to somewhere else. |
| `expanded` | `boolean` |  | With onClick: whether what it opens is open. |
| `controls` | `string` |  | With onClick: the id of what it opens. |
| `label` | `string` |  | Its name when the words alone do not say what it does, e.g. "Kiko, casual, determined. Edit cast". |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { MentionChip } from '@anicanon/sakuga/anicanonkit';

export function MentionChipExample() {
  return (
    <MentionChip kind="prop" name="The phone" />
  );
}
```

## Accessibility

Read as text, its mark first ("@Aiko", "#Harbour") then the note; with `href` it is a link that Tab reaches and Enter follows, named the same way; with `onClick` it is a button, named by `label` when given, that says whether what it opens is expanded. The picture is hidden.

Used on: Web, iOS, Android
Version: 1.3
