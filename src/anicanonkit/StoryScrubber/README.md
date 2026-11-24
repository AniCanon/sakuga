# StoryScrubber

StoryScrubber moves through the story in story order (when things happen in the world, not when they were released).

## When to use

Use it for moving through the story in story order, when things happen in the world: a column per event under arc brackets, and a handle that names the moment ("After Fire at Sé").

- Not for the playhead of an episode or a short: use `Scrubber`.
- Not for the whole cut at a glance: use `ProgramBar`.
- Not for the cut's tracks in time: use `Timeline`.
- Not for the story's people, places and events as a map: use `StoryMap`.

## How it works

- One column per event, grouped under arc brackets. Under each event, marks show what told it (episode, manga, short, Studio), two to a line. A mark is an icon, or `{ icon, label }` when the label says which one ("Episode 2"): screen readers say the label, and it is the mark's tooltip.
- **A long story scrolls; it never squeezes.** A column is at least 36 px, two told marks wide. While the events fit, the columns stretch to fill the track and nothing else changes. When they don't (36 px a column is wider than the track: a desk track of about 700 px holds 19 events, a Foldables pane of about 400 px holds 11), the track scrolls sideways at 36 px a column, with a chevron at each end that pages it ("Earlier events", "Later events"); an end with nothing beyond it keeps its place, hidden, so the track never changes width under the hand. The arc brackets and the fill scroll with the columns; Not placed stays put past the hairline.
- **The handle stays in sight.** The track opens with the first handle in view, two thirds across, so the events before the moment show; at Now that is the end. When the moment moves (the arrows, a press elsewhere on the page), the track follows it, smoothly, once it leaves the middle. Scrolled away by hand, a handle keeps its label in view: the pill is held at the edge it went off, with an arrow towards it, and pressing it brings the handle back ("Show Now"). Comparing two moments, the track follows the first; the second waits at its edge the same way. `start` opens the track at an event instead, for a page that keeps where it was scrolled.
- The handle sits after an event and names it ("After Fire at Sé"), or "Now" at the end. Two handles compare two moments; the track moves the first, and the second is said with it ("After Fire at Sé, compared with Now").
- **At the same time.** An event's `with` lists the other events at that same moment. They share its column: the node holds each one's mark side by side (two, then "+1"), the told marks under it are all of theirs, and the tooltip names them ("Kiko's offer, at the same time as The call"). Never a column each: that would read as one after the other.
- Events with no place yet stand after the track as one more column, past a hairline, under "Not placed" ("Not placed · 3" when there are more). With none (`state: "none"`, or no `unplaced`), nothing is drawn: never an empty box.
- The track is a slider from 0 to the number of events, at the first handle. A screen reader says `valueText`, or the first handle's label when it is left out.
- `onChange(at)` makes the track move by keyboard (arrows a step, Page Up and Page Down a tenth of the story, Home and End to either end); `onFilter(filter)` makes the filter buttons work. The events and arcs drawn in the track are listed beside it for screen readers, in story order.
- A long track narrows to whole columns and then places itself again, so it never opens with Now cut at its end. At either end the handle's hit area points inward, never past the track.
- **Whole columns.** While the track scrolls it shows a whole number of columns, the rest of the width left beside the chevron; columns snap at their start and every scroll lands on one, so a node is never cut at either edge.
- **Press and drag.** A press on a node moves the moment through that event. The Now handle drags once the pointer has travelled 4 px, the moment following it column by column with no easing; a drag elsewhere scrolls the track. The keys do all of it as before.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `events` | `object[]` | required | One column per event, in story order: its type and title, what told it, whether it is `inside` the moment shown, a `mark`, and `with`, the other events at that same moment: one column holds every mark, stacked; the tooltip and screen readers say them ("The call, at the same time as Kiko's offer"). |
| `events[].type` | `EventType` | required |  |
| `events[].title` | `string` |  |  |
| `events[].told` | `ToldMark[]` |  |  |
| `events[].inside` | `boolean` |  |  |
| `events[].mark` | `boolean` |  |  |
| `events[].with` | `object[]` |  |  |
| `events[].with[].type` | `EventType` | required |  |
| `events[].with[].title` | `string` |  |  |
| `events[].with[].told` | `ToldMark[]` |  |  |
| `arcs` | `object[]` | required | The arc brackets over the events, each with how many it spans; `on` for the arc shown. |
| `arcs[].name` | `string` | required |  |
| `arcs[].count` | `number` | required |  |
| `arcs[].on` | `boolean` |  |  |
| `handles` | `object[]` | required | The handle after an event, named ("After Fire at Sé"); a second one compares two moments. |
| `handles[].at` | `number` | required |  |
| `handles[].label` | `string` | required |  |
| `fill` | `[number, number]` | required | The span lit on the track, as event positions from and to. |
| `unplaced` | `object` |  | Events with no place yet, as one column past a hairline; `state: 'none'` (or leaving it out) draws nothing. `count` names more than one. |
| `unplaced.state` | `'event' \| 'none'` |  |  |
| `unplaced.on` | `boolean` |  |  |
| `unplaced.icon` | `IconName` |  |  |
| `unplaced.count` | `number` |  |  |
| `filter` | `string \| false` |  | The filter shown pressed (all, ep, manga, shorts); `false` hides the filter. |
| `onChange` | `(at: number) => void` |  | Arrow keys, Page and Home/End on the track: the new place, 0 to the number of events. |
| `onFilter` | `(filter: string) => void` |  | A filter button pressed: all, ep, manga or shorts. |
| `valueText` | `string` |  | What a screen reader says for the moment shown; the first handle's label when left out. |
| `start` | `number` |  | A long track opens at this event instead of with the first handle in view, for a page that keeps where it was scrolled. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { StoryScrubber } from '@anicanon/sakuga/anicanonkit';

export function AfterTheFire() {
  return (
    <StoryScrubber
      events={[
        { type: 'event', title: 'Arthur taken', told: ['play'], inside: true },
        { type: 'clue', title: 'Smoke', told: ['manga'], inside: true },
        { type: 'twist', title: 'The doors close', told: ['play', 'manga'], inside: true },
        { type: 'event', title: 'Fire at Sé', told: ['shorts'], mark: true, inside: true },
        { type: 'revelation', title: 'Cell four', told: ['play'] },
        { type: 'goal', title: 'Find Arthur', told: ['image'] },
      ]}
      arcs={[{ name: 'Arc 1', count: 3, on: true }, { name: 'Arc 2', count: 3, on: true }]}
      handles={[{ at: 4, label: 'After Fire at Sé' }]}
      fill={[0, 4]}
    />
  );
}
```

## Accessibility

A slider that Tab reaches, named "Show the world at a moment in the story" and read as `valueText` (else the first handle's label, else "After event 3 of 12"); with `onChange` arrows move it an event, Page Up and Page Down a tenth of the story and Home and End to either end, and without it it reads as read-only. Beside it, screen readers get the events in story order (type, title, the events at the same time, by each mark's `label` when it has one, "in the moment shown") and the arcs as lists, and, on a long story, buttons around it in the order drawn: "Earlier events" before it, then a held label ("Show Now") and "Later events" after it, each only while there is something that way; below it a group named "Show events told by" holds filter buttons that read "pressed" on the current one and run `onFilter`.

Used on: Web
Version: 1.7
