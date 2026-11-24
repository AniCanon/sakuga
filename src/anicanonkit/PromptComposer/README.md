# PromptComposer

PromptComposer is Studio's prompt: who and where it binds on top, the words, then its tools.

## When to use

Use it for the prompt that makes a take (in Studio, and for episodes in Quick mode): the cast, places and references it binds on top, the words, then its tools with Generate and its cost, `variant="media"` as the phone app's dock over the take and `variant="web"` as the phone browser's.

- Not for writing to Maki: use `MakiComposer`.
- Not for a plain text field: use `TextField`.
- Not for the script itself: use `Manuscript`.
- Not for choosing direction as tiles: use `OptionTiles`.

## How it works

- `slot="refs"`: `MentionChip`s for the cast (@), places (#) and references ($) the prompt binds.
- The words are its children; a mention inside them is a `Mention`.
- `slot="tools"`: the opening frame, the length, templates, with Generate (a `SpendButton` and its `cost`) at the end of the row (or in `slot="footer"`).
- `placeholder` shows while there are no words; `slot="hint"` is the one line that says what is missing before Generate works ("Add a place, or describe the moment in 24 characters or more").
- `variant="media"` is the phone app's dock over the take: glass, and its chips take `tone="media"`.
- `variant="web"` is the phone browser's dock: the same layout on a solid surface across the width, its top edge a hairline, sitting on TabBar's web form. Glass stays native, so a phone web page uses this one; its tools are solid `IconButton`s, Generate a primary button and its chips take no tone.
- Episodes in Quick mode and Studio take from the same composer.
- `rows` gives the words that many lines of room before they grow (one by default). `fill` makes the composer take its column's free height, the words growing in it (three lines at least), as in a dialog where the prompt is the main thing written; with `onChange`, a press on any empty part of it puts the caret at the end of the words, and the refs, tools and foot keep their own presses.
- `revisions` lists the phrases a plan added, as they read in the words ("Medium shot, slow push in.", "at the edge of", a place's name): each is marked as `Revision`'s insertion, over the live words, while they stay editable. The first edit clears the marks, and the app drops `revisions` when the plan is kept or undone. A phrase that is not in the words is left unmarked. Where a browser has no highlight support the words show unmarked, so the plan's list of changes beside the composer still says what changed.
- `onChange(value)` makes the words a field the creator writes in, showing `placeholder` until they type; `value` is the saved prompt it holds. Without `onChange` the words only show.
- `mentions` lists who the field can tag: `cast` (@, with each member's `outfits`, and their age `figure` shown when they have no portrait), `places` (#) and `references` ($). Typing @, # or $ at the start of a word opens the matching list ("Cast · matching “Ki”": a round picture, "2 outfits" or "no outfit yet"; places; $aliases with their hint). A character with more than one outfit then asks which one ("Outfit for Kiko", the first marked "default"), so the same character can wear a different outfit each time it is tagged; a character with one outfit wears it.
- A place in `places` can hold its `views` (each an `id`, the view's backdrop, a `name` and an `image`). After #, a place with two or more views shows its cover and "3 views" and ends in a chevron: choosing it (Enter, Tab, Right or a click) lists its views in the same list, under a head with Back and the place's name, and Back, Left, or Backspace right after the #, returns to the places on that place. A place with one view is that view ("1 view · The room from the door") and chooses it at once. A place with no `views` is itself the backdrop, as before. Typed words after # find places and the views of every place, each view with its place's name under it.
- A reference's `group` puts the $ list in groups, each under its own heading in the order its first reference comes ("Frames", then "References"), its references in their own order; one with no group is under References. A typed run is said in each heading ("Frames · matching “plat”"), and a group with nothing matching is left out. With one group the list has its one heading, as before.
- A `$alias` the field draws with no reference behind it is a missing `Mention`: one solid piece, drawn as Mention's `missing`. It turns missing when its reference leaves `mentions` (a frame removed) and back when it returns, in place, the words and the caret left as they are; it is saved as `$alias` either way. A loaded or pasted prompt draws every `$alias` as a mention, missing when nothing in `references` has it. A `$` run being typed and never chosen stays words, as a loose @Name does, until the prompt is loaded again.
- The list opens at the trigger: its left edge on the @, just above the line holding it, or below that line when the page has no room above, 300 wide (the board Picker's width).
- A mention is one solid piece, drawn as `Mention` with a character's outfit after it, muted ("@Kiko (casual)"): the caret steps over it, Backspace takes it whole and Undo brings it back. A pasted token becomes a mention again.
- A view is saved as its backdrop, `@[view name:backdrop:viewId]`, and a place with views is never saved itself. A loose `#Name` binds a view by its name, and a place with one view by the place's name.
- The saved prompt is the server's: text with `@[name:character:id:outfit:outfitId]`, `@[name:backdrop:id]` and `$alias`. The id binds and the name is refreshed from `mentions`. A loose `@Name` or `#Place` typed without choosing, that is exactly a name in `mentions`, is saved as its token (the longest name first), since the Studio path reads only tokens; any other stays text, and so does an unclosed `@[`.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `label` | `string` |  | Names the composer for screen readers. |
| `promptLabel` | `string` |  | Names the words' field for screen readers. |
| `placeholder` | `string` |  | Shown while there are no words. |
| `onChange` | `(value: string) => void` |  | Makes the words a field the creator writes in, called with the saved prompt: text with |
| `value` | `string` |  | With onChange: the saved prompt the field holds. |
| `mentions` | `PromptMentions` |  | With onChange: who |
| `mentions.cast` | `PromptCastMember[]` |  | Who @ can tag. |
| `mentions.cast[].id` | `string` | required | Its id, written into the saved prompt's mention. |
| `mentions.cast[].name` | `string` | required | The name @ tags and writes. |
| `mentions.cast[].image` | `string` |  | Their face in the @ list. |
| `mentions.cast[].hint` | `string` |  | Their labels in the @ list ("E.R.A. · lead"), in place of the outfit count. |
| `mentions.cast[].outfits` | `{ id: string; label: string }[]` |  | Their outfits; with any, choosing them asks which one they wear. |
| `mentions.cast[].figure` | `IconName` |  | With no `image`: their age figure in the @ list. Default age-adult. |
| `mentions.places` | `PromptPlace[]` |  | What # can tag. |
| `mentions.places[].id` | `string` | required | Its id, written into the saved prompt's mention. |
| `mentions.places[].name` | `string` | required | The name # tags and writes. |
| `mentions.places[].image` | `string` |  | Its picture in the # list. |
| `mentions.places[].category` | `'backdrop' \| 'location'` |  | Whether it is a backdrop (a view) or a location (the place itself). |
| `mentions.places[].views` | `PromptPlaceView[]` |  | Its views, each a backdrop # saves: two or more open as a level of their own, one is chosen at once. With views the place itself is never saved. |
| `mentions.references` | `PromptReference[]` |  | What $ can point at. |
| `mentions.references[].alias` | `string` | required | What $ writes: the reference's name in the prompt. |
| `mentions.references[].name` | `string` |  | Its title in the $ list, when it differs from the alias. |
| `mentions.references[].image` | `string` |  | Its picture in the $ list. |
| `mentions.references[].hint` | `string` |  | What it is for, under its name in the $ list ("Style lock"). |
| `mentions.references[].group` | `string` |  | The $ list's heading it is listed under ("Frames"); groups follow the order their first reference comes. Without it: References. |
| `mentions.objects` | `PromptObject[]` |  | What & can tag. |
| `mentions.objects[].id` | `string` | required | Its id, written into the saved prompt's mention. |
| `mentions.objects[].name` | `string` | required | The name & tags and writes. |
| `mentions.objects[].image` | `string` |  | Its picture in the & list; the thing glyph until it has one. |
| `mentions.objects[].hint` | `string` |  | A quiet line under its name in the & list. |
| `variant` | `'web'` |  | 'web': the phone browser's dock, solid across the width on the tab bar. ('media', the phone app's glass dock, stays native: docs/PORTING.md · Not ported.) |
| `rows` | `number` |  | The lines of room the words have before they grow (one by default). |
| `fill` | `boolean` |  | Takes the column's free height, the words growing in it (three lines at least); with onChange a press on its empty parts puts the caret at the end of the words. |
| `revisions` | `string[]` |  | The phrases a plan added, as they read in the words: each marked as Revision's insertion until the first edit. |
| `children` | `ReactNode` |  | The words, when they only show; the chips as slot="refs", a line as slot="hint", the tools as slot="tools" and the actions as slot="footer". |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { Mention, MentionChip, PromptComposer, SpendButton } from '@anicanon/sakuga/anicanonkit';

export function MakeATake({ lisaFace, onGenerate }: { lisaFace: string; onGenerate: () => void }) {
  return (
    <PromptComposer label="Make a take">
      <Mention>Lisa</Mention> waits for the last train in the rain; the doors close before she moves.
      <span slot="refs"><MentionChip name="Lisa" note="school" image={lisaFace} /></span>
      <span slot="footer"><SpendButton variant="primary" fullWidth cost="~100" onClick={onGenerate}>Generate</SpendButton></span>
    </PromptComposer>
  );
}
```

## Accessibility

A region named by `label` (default "Prompt"): Tab reaches the refs, then the words, then the tools. A missing mention reads as its name then "missing" ("$platform-edge, missing"), and a grouped $ list is one listbox whose groups are named by their headings, the arrows moving through every group in order. With `onChange` the words are a multi-line textbox named by `promptLabel` (default "Prompt"), with `placeholder` as its placeholder: focus stays in the words while the list is open (the field controls it, `aria-autocomplete="list"`), the arrows move its active option (announced as the field's active descendant), Enter or Tab chooses it and Escape closes it; Right opens a place's views, the list then named by the place, and Left or Backspace after the # goes back, as does the head's Back button ("Back to Places"), which a press leaves focus in the words. While the words have focus the composer’s frame shows the focus ring, in every form, and the words draw none of their own; without `onChange` the words are text and take no focus.

Used on: Web, iOS, Android
Version: 1.7
