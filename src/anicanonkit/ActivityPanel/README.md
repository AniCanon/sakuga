# ActivityPanel

The work in flight and the work waiting on you, in groups: running, needs you, earlier.

## When to use

Use it for the jobs running and waiting across a series, opened from the navigation's activity row.

- Not for the row that opens it: use `ActivityRow`.
- Not for one job's stages in order: use `Stages`.
- Not for a message that comes and goes: use `Toast`.

## How it works

- It opens from `ActivityRow`, over the page on desktop and in place under the row on a phone.
- A job with `href` or `onClick` opens its screen. Its face and words are one link; under the pointer the whole row fills, a press settles it, and a chevron at the end says it goes somewhere.
- A job with an `action` keeps the button as its own control beside the link, and shows no chevron: the button is the row's end. Pressing the row opens the job; pressing the button does only what it says.
- A job without `href` or `onClick` is words only: it neither fills nor shows a chevron.
- A character in its creation shows its face once the face sheet is drawn, and until then the age figure its cast card stands on, never a letter.
- One Activity for the series: characters, Studio takes (stills and clips) and places (a view, motion) share it, in groups by where each stands, never by what it is: Running, then Needs you (a review, a retry), then Earlier today. Each group's title says how many ("Running · 4").
- A take's title is its name or its prompt's start and its kind ("Last train · still"); its line says where it stands ("Rendering · Kiko and Smith at Red Line Platform Edge"). It shows its kind's figure until its picture lands, then the picture: a clip shows its opening frame once drawn. A running take shows its time and the fragments it holds.
- Pressing a take opens it on Studio's stage while it renders or waits; once saved, it opens its Library item. A take that didn't finish says so and that nothing was charged, with Retry.
- A place's job opens the place: a view drawing ("Sé station · new view", "Drawing Ticket Gate Concourse · 2 of 3"), motion ready for review with Review.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `groups` | `object[]` | required | Each group a short heading, then its jobs. |
| `groups[].title` | `string` | required |  |
| `groups[].jobs` | `ActivityJob[]` | required |  |
| `groups[].jobs[].title` | `string` | required | The job's name: what is being made ("Tattoo", "Kiko's winter look"). |
| `groups[].jobs[].text` | `string` |  | What it is ("Tattoo · new character") and where it stands ("Designing the look · stage 2 of 3"). |
| `groups[].jobs[].image` | `string` |  | The job's picture, once it has one: a character's face, a look's portrait. |
| `groups[].jobs[].figure` | `IconName` |  | Drawn in place of a picture until there is one: the age figure of a character not drawn yet, as its cast card shows; for a take or a place, its kind (`image` for a still or a clip, `backdrops` for a view). |
| `groups[].jobs[].shape` | `'frame'` |  | A take's or a place's picture: a 16:9 frame showing the whole picture, never a face's round crop. |
| `groups[].jobs[].held` | `string` |  | The fragments it holds while it runs ("12"), under its time with the fragment mark, its caption in the job's muted words as the time is. |
| `groups[].jobs[].initial` | `string` |  | The last fallback, when there is neither a picture nor a figure. |
| `groups[].jobs[].progress` | `number` |  | How far a running job has come, 0 to 100, drawn as a bar under its words. |
| `groups[].jobs[].time` | `string` |  | A running job's bar and its time so far. |
| `groups[].jobs[].href` | `string` |  | Where the job's screen is: a creation opens on its step, a look on its flow. Its face and words become one link. |
| `groups[].jobs[].onClick` | `MouseEventHandler<HTMLElement>` |  | Where the job's screen is: a creation opens on its step, a look on its flow. |
| `groups[].jobs[].action` | `{ label: string; primary?: boolean; onClick?: MouseEventHandler }` |  | A button for what it waits on (Review, Retry, Resume): its own control beside the link, and the row's end. |
| `onClose` | `() => void` |  | With it, the panel takes focus while shown; Escape and Close run it. |
| `className` | `string` |  | Extra class on the root element. |
| `style` | `CSSProperties` |  | Inline style on the root element. |

## Example

```tsx
import { ActivityPanel } from '@anicanon/sakuga/anicanonkit';

export function WorkInFlight({ onClose }: { onClose: () => void }) {
  return (
    <ActivityPanel
      onClose={onClose}
      groups={[
        { title: 'Running · 1', jobs: [{ initial: 'T', title: 'Tattoo · new character', text: 'Designing the look', progress: 55, time: '0:31', held: '12' }] },
        { title: 'Needs you', jobs: [{ initial: 'S', title: 'Smith · new look', text: 'Ready for your review', href: '/characters/smith/looks', action: { label: 'Review', primary: true } }] },
      ]}
    />
  );
}
```

## Accessibility

A dialog named "Activity". With `onClose`, focus moves to the first job's link or button, Tab and Shift+Tab stay inside, and Escape or Close runs it. A job that opens its screen is a link (a button with `onClick` alone) named by its title and text; its action is a separate button after it, its bar is a named progress bar, and its `held` reads after its time ("12 fragments held"). The picture and figure are hidden, and the chevron is too.

Used on: Web, iOS, Android
Version: 1.3
