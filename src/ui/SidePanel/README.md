# SidePanel

SidePanel is the one container for a side area beside a view: an event, a character, a place, Maki.

## When to use

Use it for any side area beside a view: an event, a character or a place on Story, Maki's chat.

- Not for a dialog over the view: use `Dialog`.
- Not for a panel that slides up on a phone: use `Sheet`.
- Not for a boxed group of settings inside a page: use `Panel`.

## How it works

- Every side area shares its insets, so two of them never sit on different edges.
- **One edge.** The head, the body and the foot sit on one 16 px edge (`inset-lg`); the body's parts are `gap-xl` apart. A side area never pads itself again inside it.
- **The head and the foot stay put; only the body scrolls.** A hairline shows under the head once something is scrolled under it, and over the foot while there is more below; at rest neither shows. The foot clears a phone's home bar.
- `follow` is for a conversation: it keeps to the newest line unless the person has scrolled back, and then a round button in its own row above the foot jumps to it, never over the words. `start` opens it scrolled elsewhere.
- `head` (or `slot="head"`) takes a `PanelHeader`, or Maki's face and name; `foot` (or `slot="foot"`) a composer.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `label` | `string` |  | Names the section. |
| `head` | `ReactNode` |  | What sits on top and stays put: a PanelHeader, or Maki's face and name (or slot="head"). |
| `foot` | `ReactNode` |  | What sits at the foot and stays put: a composer (or slot="foot"). |
| `follow` | `boolean` |  | A conversation: keeps to its newest line unless scrolled back, and then offers a jump to it. |
| `start` | `number \| 'end'` |  | Opens scrolled here (or 'end'). |
| `role` | `string` |  | The body's role and name: 'log' for a conversation, 'region' for a body the keyboard scrolls. |
| `bodyLabel` | `string` |  | The body's name for screen readers. |
| `busy` | `boolean` |  | Something is still coming in: the body waits to be read. |
| `children` | `ReactNode` |  | The body: what scrolls between the head and the foot. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { IconButton, SidePanel, Text } from '@anicanon/sakuga/ui';

export function EventPanel({ onClose }: { onClose: () => void }) {
  return (
    <SidePanel
      label="Event"
      role="region"
      bodyLabel="Fire at Sé"
      head={<><Text variant="title-4" as="h2">Fire at Sé</Text><IconButton variant="plain" icon="close" label="Close" onClick={onClose} /></>}
    >
      <Text as="p">The station burns through the night; Kiko gets everyone out but Ken.</Text>
    </SidePanel>
  );
}
```

## Accessibility

A section named by `label`. The body is a region Tab reaches when its `role` is `region`, or a log when it is a conversation, which Tab also reaches so it scrolls from the keyboard, held back while `busy`; "Jump to the latest" is a button.

Used on: Web
Version: 1.1
