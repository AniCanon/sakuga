# MakiComposer

MakiComposer is where the person writes to Maki: one container that holds what is asked about, the field and one set of controls.

## When to use

Use it for where the person writes to Maki.

- Not for writing the prompt that makes a take: use `PromptComposer`.
- Not for a plain text field in a form: use `TextField`.
- Not for a message already sent: use `ChatMessage`.

## How it works

- **@** inserts an @ at the caret and opens the picker, as typing it does, unless the page passes `onMention`. The field types it through its own editing, so the first press opens the picker; a port on another editor (Lexical) gives its field the same way in.
- **Inside the container**, in order: "Asking about" and the `context` chips (what is selected on the map or the scrubber, each a `MentionChip` with its picture or an event's mark, removable); "Attached" and the `files` the creator added with +, in their own row so what the question is about and what it is given stay apart (each a `Thumb`: its preview, its name, "Adding…" while `adding`, then "Picture" or "Video", and Remove with `onRemoveFile`); the field, which grows from one line to six and then scrolls; the toolbar.
- **One set of controls**: add (+) and @ at the left and send at the right, three rounds of one size; send is the action colour, waits for words, and becomes Stop while Maki writes (`writing`, `onStop`). `cost` sits beside send as "✦ 12 a reply" with the fragment mark.
- The placeholder is short ("Ask Maki…") so it never cuts. `hint` is a quiet line under the container, only when something is at stake.
- `mentions` makes the field `PromptComposer`'s own: `@` the cast (a question to Maki names people, not outfits: no outfit line and no outfit to choose; someone with no portrait shows their age figure), `#` the places, `&` the objects, `$` references, where the caret is. Enter sends once the list is closed; Shift+Enter starts a new line.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `placeholder` | `string` |  | Shown in the empty field; short, so it never cuts ("Ask Maki…"). |
| `label` | `string` |  | The field's name for screen readers. Default "Message to Maki". |
| `attach` | `boolean` |  | `false` hides Attach (a picture or a file). |
| `value` | `string` |  | The words in the field. |
| `onChange` | `(text: string) => void` |  | Called with the words as they change. |
| `onSend` | `(text: string) => void` |  | Enter, or Send: the message. Shift+Enter makes a new line. Send waits for words. |
| `onAttach` | `MouseEventHandler` |  | Attach's press. |
| `onMention` | `MouseEventHandler` |  | The @ button's press; without it, an @ at the caret opens the picker, as typing it does. |
| `files` | `MakiFile[]` |  | The files the creator added with +, under "Attached" after the context: each its preview, "Adding…" while `adding`, then "Picture" or "Video". |
| `files[].id` | `string` |  | Its key among the files. |
| `files[].name` | `string` | required | Its name. |
| `files[].image` | `string` |  | Its preview (a video's poster). |
| `files[].kind` | `'picture' \| 'video'` |  | A picture (default) or a video. |
| `files[].adding` | `boolean` |  | Still uploading. |
| `onRemoveFile` | `(file: MakiFile) => void` |  | With it (or `removable`, as on a board), each file has Remove. |
| `removable` | `boolean` |  | Draws each file's Remove without a handler, on a board. |
| `mentions` | `PromptMentions` |  | Who |
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
| `context` | `ReactNode` |  | What is selected, as removable MentionChips under "Asking about", inside the container (or slot="context"). |
| `cost` | `number \| string` |  | What a reply costs, in fragments: "12 a reply" with the fragment mark. |
| `writing` | `boolean` |  | Maki is writing: Send becomes Stop. |
| `onStop` | `MouseEventHandler` |  | Stop's press. |
| `ready` | `boolean` |  | Send stays available with an empty field, for a page that sends something of its own. |
| `hint` | `string` |  | A quiet line under the container, only when something is at stake. |
| `children` | `ReactNode` |  | The selection as slot="context". |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { MakiComposer } from '@anicanon/sakuga/anicanonkit';

export function MakiComposerExample() {
  return (
    <MakiComposer />
  );
}
```

## Accessibility

Tab reaches each context chip's remove ("Remove Kiko"), each file's Remove ("Remove lighthouse.png"; a file still adding is busy), the field (named by `label`, default "Message to Maki"), "Attach", "Mention someone or something", then "Send" or "Stop". Enter sends, Shift+Enter starts a new line; Send is unavailable until there are words.

Used on: Web, iOS, Android
Version: 2.3
