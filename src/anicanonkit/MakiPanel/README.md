# MakiPanel

MakiPanel is Maki in a side area: a `SidePanel` with Maki's face and name, what is waiting, and close; the conversation; the composer at the foot.

## When to use

Use it for the chat with Maki beside a view, opened from the Maki button in the view's header.

- Not for the button that opens it: use `AskMaki`.
- Not for a side area about a character, place or event: use `SidePanel` with a `PanelHeader`.
- Not for one thing Maki says: use `MakiTurn`.

## How it works

- **One conversation.** Review is one of Maki's replies, not a tab: she posts it in the chat ("I read the story through … 4 things don't hold up"), its findings grouped inside it. There is no view switch.
- `waiting` is how many things wait to be looked at, counted by cause, the one number everywhere (`AskMaki`'s pill says the same). Its press (`onWaiting`) jumps to Maki's Review reply.
- **The insets are SidePanel's**, the same 16 px edge as the event panel beside it. Turns are `gap-2xl` apart. The conversation keeps to its newest line unless the person has scrolled back, and then a jump to the latest takes its own row above the composer.
- **Nothing said yet**: Maki's face, `greeting` in one line, and `suggestions` as rows that send on a press, phrased as the person would type them.
- The composer's props pass through (`mentions`, `context`, `cost`, `writing` and `onStop`, `value`, `onChange`, `onSend`, `attach`, `files` and `onRemoveFile`, `onAttach`, `onMention`; `attach={false}` draws no + where there is nothing to attach). `composer={false}` drops it for someone who can only read.

### Differs from the design

- The port draws what the design means where the design has a defect, until a version carries the fix.
- The design's own preview still passes `review`, the 1.x name of `waiting`, and the bundle reads it as `waiting`. The port keeps `review` as that old name.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `avatar` | `string` | required | Maki's face, at the panel's head. |
| `waiting` | `number` |  | How many things wait to be looked at, counted by cause: the one number everywhere. Its press jumps to Maki's Review reply. |
| `review` | `number` |  | The old name of `waiting`. |
| `onWaiting` | `MouseEventHandler` |  | "{count} to look at"'s press: jump to Maki's Review reply. |
| `children` | `ReactNode` |  | The conversation: MakiTurns and ChatMessages, oldest first; Review is one of Maki's replies. |
| `onClose` | `MouseEventHandler` |  | Close Maki. |
| `busy` | `boolean` |  | A reply is still coming in: the conversation waits to be read. |
| `start` | `number` |  | Opens scrolled here rather than at the newest line. |
| `greeting` | `string` |  | Nothing said yet: Maki, this line, and what to ask first. |
| `suggestions` | `string[]` |  | Nothing said yet: what to ask first, as rows that send on a press. |
| `onSuggestion` | `(suggestion: string) => void` |  | Called with the suggestion pressed. |
| `composer` | `boolean` |  | `false` drops the composer, for someone who can only read. |
| `attach` | `boolean` |  | As on MakiComposer: false draws no +. |
| `files` | `MakiFile[]` |  | As on MakiComposer: the files added with +. |
| `files[].id` | `string` |  | Its key among the files. |
| `files[].name` | `string` | required | Its name. |
| `files[].image` | `string` |  | Its preview (a video's poster). |
| `files[].kind` | `'picture' \| 'video'` |  | A picture (default) or a video. |
| `files[].adding` | `boolean` |  | Still uploading. |
| `onRemoveFile` | `(file: MakiFile) => void` |  | As on MakiComposer. |
| `removable` | `boolean` |  | As on MakiComposer. |
| `onMention` | `MouseEventHandler` |  | As on MakiComposer: |
| `mentions` | `PromptMentions` |  | As on MakiComposer: who |
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
| `context` | `ReactNode` |  | As on MakiComposer: what is selected, as MentionChips under "Asking about" (or slot="context"). |
| `cost` | `number \| string` |  | As on MakiComposer: what a reply costs, in fragments. |
| `writing` | `boolean` |  | As on MakiComposer: Maki is writing, Send becomes Stop. |
| `onStop` | `MouseEventHandler` |  | As on MakiComposer: Stop's press. |
| `placeholder` | `string` |  | As on MakiComposer: the composer's empty-field words. |
| `hint` | `string` |  | As on MakiComposer: the quiet line under the composer. |
| `value` | `string` |  | As on MakiComposer. |
| `onChange` | `(text: string) => void` |  | As on MakiComposer: called with the words as they change. |
| `onSend` | `(text: string) => void` |  | As on MakiComposer: called with the words when they are sent. |
| `onAttach` | `MouseEventHandler` |  | As on MakiComposer: adds a picture or a file to the message. |
| `ready` | `boolean` |  | As on MakiComposer: Send stays available with an empty field. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { ChatMessage, MakiPanel, MakiTurn } from '@anicanon/sakuga/anicanonkit';

export function MakiSide({ makiFace, onClose }: { makiFace: string; onClose: () => void }) {
  return (
    <MakiPanel avatar={makiFace} waiting={2} onClose={onClose}>
      <MakiTurn><p>Two things don’t hold up.</p></MakiTurn>
      <ChatMessage>Fix the last train</ChatMessage>
    </MakiPanel>
  );
}
```

## Accessibility

A section named "Maki". Tab moves through "{count} to look at", "Close Maki", the conversation's controls and the composer; Maki's face is hidden. The conversation is a log named "Conversation with Maki", so each reply is read as it arrives, held back while `busy` or `writing`.

Used on: Web
Version: 2.1
