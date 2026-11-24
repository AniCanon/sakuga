# TagList

TagList keeps words as tags: a character's visual vibe, the garments read from a photo.

## When to use

Use it for words kept as tags, each one removable and restorable: a character's visual vibe, the garments read from a photo.

- Not for picking words from a set, such as traits: use `Chip`.
- Not for a label over artwork: use `Badge`.
- Not for who or what a panel holds, with its picture: use `MentionChip`.
- Not for a free sentence someone types: use `TextField`.

## How it works

- A tag added after the list first draws rises in; a removed one keeps its place while it fades out, and focus moves to the tag that takes its place.
- Each tag carries its own button: `removeLabel` names what it does ("Leave out Silver chain"). A tag that is `off` reads struck through and its button puts it back (`restoreLabel`).
- With a `placeholder` the tags sit in a field you type more into.
- Short words, lower case unless a name.
- `onRemove(label, index)` and `onRestore(label, index)` make the tag buttons work; `onAdd(words)` takes what is typed in the box when Enter is pressed.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `items` | `(string \| { label: string; off?: boolean })[]` | required | The tags in order; one `off` reads struck through and can be put back. |
| `placeholder` | `string` |  | With it the tags sit in a field you type more into, shown while it is empty. |
| `label` | `string` |  | Names the list for screen readers. |
| `inputLabel` | `string` |  | Names the field you type into; the placeholder without it. |
| `removeLabel` | `string` |  | The remove button's verb ("Leave out Silver chain"). |
| `restoreLabel` | `string` |  | The put-back button's verb, on a tag that is `off`. |
| `className` | `string` |  | Extra class on the root element. |
| `onRemove` | `(label: string, index: number) => void` |  | Called with a tag's words and index when it is removed. |
| `onRestore` | `(label: string, index: number) => void` |  | Called with a tag's words and index when it is put back. |
| `onAdd` | `(words: string) => void` |  | Enter in the box hands its words over and empties it. |

## Example

```tsx
import { useState } from 'react';
import { TagList } from '@anicanon/sakuga/ui';

export function VisualVibe() {
  const [tags, setTags] = useState(['fire', 'red and black', 'street hero']);
  return (
    <TagList
      label="Visual vibe"
      items={tags}
      placeholder="Add a vibe…"
      onAdd={(word) => setTags([...tags, word])}
      onRemove={(_, i) => setTags(tags.filter((__, k) => k !== i))}
    />
  );
}
```

## Accessibility

A group named by `label`: Tab reaches each tag's button ("Remove Gentle", or "Add back Gentle" once it is out; `removeLabel` and `restoreLabel` change the verb), which runs `onRemove` or `onRestore`, and focus moves to the tag that takes its place; the change is said ("Gentle removed", "Gentle added back"). With `placeholder`, a text input named by `inputLabel` or the placeholder shows a focus ring and hands its words to `onAdd` on Enter.

Used on: Web, iOS, Android
Version: 1.0
