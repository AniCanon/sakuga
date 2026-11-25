# Timeline

Timeline is the cut's tracks under the preview, shared by every production (episode or short, Quick or Directed).

## When to use

Use it for the cut's tracks under the preview: video, boards, overlays, sound, captions and effects in time, with the playhead and trim grips on the selected item.

- Not for the whole cut at a glance, in planned proportion: use `ProgramBar`.
- Not for what gets generated for a cut on a frame grid: use `Timesheet`.
- Not for a manga page's layers: use `LayerStrip`.
- Not for the playhead of an episode a viewer watches: use `Scrubber`.

## How it works

- `duration` and every item's `start` and `length` are in seconds. The ruler steps itself unless `step` is set: the least of 1, 2, 5, 10, 15, 30 s, 1, 2, 5 or 10 min that keeps its times about 72 px apart on the lanes as they are laid out, so at any width or zoom they never touch; `rate` names the frame rate shown at the ruler's head ("24 fps").
- Tracks have a `kind`: `video` (a picture strip), `board` (storyboard panels standing in for video), `overlay` (text and images), `audio` (waveform), `caption` (one language per track), `effect`.
- Item `state`: `selected`, `gap` (planned time with no picture yet; never hide it), `board`, `rejected`.
- A `selected` item shows a grip at each end: drag one to trim the item, so its time shrinks or grows from that end, a frame at a time and never over the item beside it; `onTrim` gets each new time as it passes it, and `onTrimEnd` the last one, once, when the grip is let go: save there. While trimming, pass `trimmed` (`{ start, end }` in seconds) to draw the cut-off footage as a dashed ghost beyond the item.
- `markers` name points in time (a scene start, a beat). They have their own rail above the times: each is a flag that starts at its time, with a hairline from it down through the times to the tracks. A flag that would run past the end ends at its time instead, and one that would run into the next is cut short a gap before it, its full name in its title. No marker covers a time. Markers closer than a readable flag at this zoom (about 40 px, or at the same time) share one flag: the first named and the rest counted ("Window goes +1"), each keeping its hairline at its own time. That flag is a button: on hover or focus it opens along the marker rail to list them all with their times, and it is said in full ("2 markers: Window goes at 2:41 and Smith at 2:49"). Zoom in and they part again. `playhead` draws the current time across every track, on the ruler's own scale, so a split made at the playhead lands under it at any time.
- It is flat: no surface, radius or edge of its own, so it sits on the ground of whatever holds it (the editor's, under the pane rule above it). The ruler, the rows and the head column keep their hairlines.
- Track names stay on one line in the 120 px head; a longer one is cut short, with its full name in its title.
- An item too short for its name (a 3-frame impact in a minute of cut) keeps its exact span: its track's icon sits on it as a chip, its name on hover and in its title, and it draws above its neighbours.
- A `gap` has a dashed edge. With no `label`, it says what it is: "No picture yet", or "Storyboard" for a `board` item.
- It never snaps item boundaries: start and length are the author's. A dragged edge goes exactly where it is dragged, a whole frame at a time, and a card dropped on a lane lands exactly where it is dropped.
- `reorderable` gives every track head a drag handle: the order of titles and images decides what draws in front (the picture is always at the back). Drag a handle and its track lifts, a line shows where it lands, and `onMoveTrack(from, to)` is called when it is let go; the move is said then, not at each place it passes. `moving` (`{ track, to }`, indexes) draws a track lifted, for a board.
- `offset` (seconds) labels the ruler in program time when the timeline shows a zoomed window of a longer cut.
- `total` with `onView(start, length)` makes the window zoom and pan, as an editor's timeline does: the ruler's head holds Zoom out, Fit the whole cut and Zoom in, each named in a tooltip; Ctrl/⌘+wheel and a trackpad pinch zoom around the pointer, a sideways wheel or Shift+wheel pans. The closest is a frame about 24 px wide, the furthest the whole cut; nothing snaps. The app passes the window back as `offset` and `duration` (items, markers and the playhead in its time) and as the `ProgramBar`'s `window`. `follow` turns the page when the playhead passes the window's end while playing. Items crossing the window's edges are cut square there, and the ruler's times fall on whole steps of program time.
- **Loop to fill.** A sound item's `loop` is the length made, in seconds (a made sound is 3 to 10 s; an ambience bed runs the scene). The item plays it again from the start, without a gap, across its whole span: it draws the sound once per repeat with a dashed hairline at each seam, the last repeat cut where the item ends. Its end trims as any item's does, as far as the track allows; the app turns it on from the sound's inspector ("Loop to fill"), never in the make form.
- Track kinds `dialogue`, `music` and `audio` (sound) draw the core `Waveform` at the item's width, in their own wave tokens; pass an item's `peaks` for its real loudness. Tracks are told apart by their heads (icon and name), not by colour; the accent marks only the selection and the playhead.
- `onSeek(seconds)` makes the ruler where the playhead is moved: a press puts it there and a drag scrubs, a frame (`trimStep`) at a time, and the playhead gains a head in the ruler, a slider (an arrow a frame, Shift a second, Page Up and Page Down a ruler step, Home and End the ends). Times are on the same scale as `playhead`.
- `onSelect(track, item)` makes the items one Tab stop of buttons: Left and Right move within a track, Up and Down to the nearest item on the track above or below, Enter or Space selects. With `onMoveItem`, Alt and Left or Right move the focused item a frame, with Shift a second, and Alt with Home or End as far as it goes; the new time is said ("Smoke moved to 0:03").
- A selected item's grips sit beside it in the lane and are sliders: an arrow trims by `trimStep` (a frame, 1/24 s, by default), Shift, Page Up or Page Down by a second, and each move calls `onTrim(track, item, edge, seconds)`. An edge stops at the item beside it on its track, never over it; Home and End take it that far. Without `onTrim` the grips only draw.
- `onMoveTrack(from, to)`: with `reorderable`, Up and Down on a track's handle move the track, focus stays on its handle, and the move is said ("Captions track moved to 2 of 5"). Enter or Space lifts the track instead: the arrows move where it lands, Enter or Space drops it there, and Escape puts it back.
- `onDrop(item, at, track)` lets a card or row with `dragData` land on a lane of its `kind`: while it is dragged over, the lane outlines where it lands (its `length` from the drop time, exactly where it is dropped: nothing snaps) with "Lands at 2:41" above it, and on the drop the time is said aloud.
- `newLane={{ label, kind }}` gives drops a lane to start: while a card that fits it is dragged over the Timeline, a dashed lane named `label` shows under the last track, and a drop lands there when no lane that takes the card is free at that time — the first clip on a cut whose Picture takes no drops, or a stretch where every lane is busy. `onDrop` is then called with `track` null and `{ newLane: true }`, and the app creates the track. At rest the lane is not there.
- A drop never covers what is there. Over an occupied stretch the outline moves, while it is still dragged, to the nearest free lane of that kind at the same time ("Lands at 2:41 on Video 3"), and `track` is that lane; the time never moves. With no lane free there, a dashed outline says "No free track at 2:41" and nothing is dropped.
- A track with `drop: false` takes no drop and is never chosen as the free lane (the Cut's Picture track, which only the plan fills); it draws as any other.
- `onMoveItem(track, item, seconds)` lets an item be dragged along its own track: it goes where it is dragged, a whole frame at a time, never snapped and never over the item beside it. A press without a drag still selects it. `onMoveItemEnd` gets its final start once, when it is let go.
- **A change says when it ends.** `onTrim`, `onMoveItem` and `onMoveMarker` follow the pointer or the keys frame by frame, to draw; `onTrimEnd`, `onMoveItemEnd` and `onMoveMarkerEnd` are called once with the final time, when the pointer is let go, or when the key that moved it is released (a held arrow repeats without one) or focus leaves. The app saves on the End call, never on every frame.
- **Markers the app can open and move.** `onSelectMarker(marker)` makes each flag a button: a press, Enter or Space calls it with the marker's index in `markers`, and the app opens it (to rename it, in its inspector). `selected` on a marker draws its flag ringed and its hairline in the selection colour, as a selected item is. `onMoveMarker(marker, seconds)` lets a flag be dragged along the ruler, a whole frame at a time and never snapped, and Alt with Left or Right move it a frame (Shift, a second; Home and End to the ends); `onMoveMarkerEnd` gets the final time. A press on a flag never moves the playhead. In a shared flag, its list opens on hover or focus and each marker in it is a button that selects it; a shared marker is moved from the app once selected, or after zooming in until it has its own flag.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `duration` | `number` | required | The length shown in seconds (the window, with onView); every item's `start` and `length` are seconds from its start. |
| `total` | `number` |  | The whole cut's length in seconds, with onView: the Timeline shows `offset` + `duration` of it and can zoom and pan. |
| `onView` | `(start: number, length: number) => void` |  | Called with the window asked for (seconds): the zoom control, Ctrl/⌘+wheel and pinch around the pointer, a sideways wheel or Shift+wheel to pan; the closest a frame about 24 px wide, the furthest the whole cut. The app passes the new window back as offset and duration. |
| `follow` | `boolean` |  | With onView: the window turns the page when the playhead passes its end (while playing). |
| `playhead` | `number` |  | The current time in seconds, drawn across every track. |
| `offset` | `number` |  | Labels the ruler in program time, in seconds, when the timeline shows a zoomed window of a longer cut. |
| `step` | `number` |  | The ruler's step in seconds; it steps itself (1, 5 or 30) without it. |
| `rate` | `string` |  | The frame rate shown at the ruler's head ("24 fps"). |
| `label` | `string` |  | Names the timeline for screen readers. |
| `onSelect` | `(track: number, item: number) => void` |  | Makes the items one Tab stop of buttons: arrows move between them, Enter or Space calls it with the track and item indexes. |
| `onTrim` | `(track: number, item: number, edge: 'in' \| 'out', seconds: number) => void` |  | A selected item's grip moved by keyboard or dragged: the new time of that edge, in seconds. An edge stops at the item beside it on the track and goes where it is dragged, a whole frame at a time; it never snaps. Without it the grips only draw. |
| `onTrimEnd` | `(track: number, item: number, edge: 'in' \| 'out', seconds: number) => void` |  | A trim has ended: the grip is let go, or the key that moved it is released (or focus leaves). Called once, with the edge's final time: save here, not in onTrim. |
| `trimStep` | `number` |  | What one arrow press trims, in seconds. Default 1/24 (a frame); Shift, Page Up and Page Down trim a second. |
| `onMoveTrack` | `(from: number, to: number) => void` |  | With reorderable, a track's handle moves it: Up and Down a place at once, Enter or Space to lift it and drop it further, or a drag. |
| `onMoveItem` | `(track: number, item: number, seconds: number) => void` |  | An item dragged along its track, or moved with Alt and an arrow (a frame; Shift, a second; Home and End as far as it goes): its new start, whole frames of `trimStep`, never snapped and never over the item beside it. |
| `onMoveItemEnd` | `(track: number, item: number, seconds: number) => void` |  | A move has ended: the item is let go, or Alt and the arrow are released (or focus leaves). Called once, with its final start: save here, not in onMoveItem. |
| `markers` | `object[]` |  | Named times on the ruler, in seconds on the same scale as `playhead`. `selected` draws it selected and says so. |
| `markers[].at` | `number` | required |  |
| `markers[].label` | `string` | required |  |
| `markers[].selected` | `boolean` |  |  |
| `onSelectMarker` | `(marker: number) => void` |  | Makes each marker's flag a button: a press, Enter or Space calls it with the marker's index in `markers` (to open it, rename it). A marker in a shared flag is chosen from the flag's list. |
| `onMoveMarker` | `(marker: number, seconds: number) => void` |  | A marker's flag dragged along the ruler, or moved with Alt and an arrow (a frame; Shift, a second; Home and End to the ends): its new time on every frame it passes, whole frames of `trimStep`, never snapped. A marker in a shared flag is moved from the app, once selected. |
| `onMoveMarkerEnd` | `(marker: number, seconds: number) => void` |  | A marker's move has ended (let go, or the key released): called once with its final time. |
| `reorderable` | `boolean` |  | Track heads carry a drag handle. |
| `moving` | `object` |  | Draws a track being moved, its index and where it lands (a board); a drag or the keys draw their own. |
| `moving.track` | `number` | required |  |
| `moving.to` | `number` | required |  |
| `tracks` | `TimelineTrack[]` | required | The tracks, top to bottom, each with its items. |
| `tracks[].label` | `string` | required |  |
| `tracks[].kind` | `TimelineTrackKind` | required |  |
| `tracks[].items` | `TimelineItem[]` | required |  |
| `tracks[].items[].start` | `number` | required |  |
| `tracks[].items[].length` | `number` | required |  |
| `tracks[].items[].label` | `string` |  |  |
| `tracks[].items[].image` | `string` |  |  |
| `tracks[].items[].peaks` | `number[]` |  | Sound tracks: real loudness, 0–1. |
| `tracks[].items[].loop` | `number` |  | A sound that loops to fill: the length made, in seconds. The item repeats it across its span, a dashed seam at each start, and screen readers hear "loops to fill, 8 seconds made". |
| `tracks[].items[].state` | `'selected' \| 'gap' \| 'board' \| 'rejected'` |  |  |
| `tracks[].items[].trimmed` | `{ start?: number; end?: number }` |  | Seconds trimmed off while trimming, drawn as dashed ghosts before and after the item. A selected item shows a grip at each end. |
| `tracks[].drop` | `boolean` |  | false: nothing is dropped on this lane (a drop over it lands nowhere), drawn as any other. |
| `onDrop` | `(item: InsertData, at: number, track: number \| null, landed?: { newLane: true }) => void` |  | Cards with `dragData` drop onto a lane of their `kind` (any lane when it has none): the lane outlines where it lands, exactly where it is dropped (nothing snaps), and this is called with the card's dragData, the time and the track index (null when it landed on newLane, with `{ newLane: true }`). |
| `newLane` | `object` |  | A lane the app offers for drops: while a card that fits it (its `kind`, or any card without one) is dragged over the Timeline it shows, dashed, under the last track, and takes the drop when no lane that takes it is free at that time (a cut with no clips yet, every lane busy). The app creates the track from onDrop. |
| `newLane.label` | `string` | required |  |
| `newLane.kind` | `TimelineTrackKind` |  |  |
| `onSeek` | `(seconds: number) => void` |  | A press on the ruler, a drag along it, or the playhead's head as a slider (an arrow a frame, Shift a second): the new time in seconds, on the same scale as `playhead`, whole frames of `trimStep`. |
| `seekLabel` | `string` |  | The slider's name. Default "Seek". |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { Timeline } from '@anicanon/sakuga/ui';

export function CutTracks({ onSelect }: { onSelect: (track: number, item: number) => void }) {
  return (
    <Timeline
      duration={12}
      playhead={4}
      rate="24 fps"
      markers={[{ at: 6, label: 'Scene 2' }]}
      onSelect={onSelect}
      tracks={[
        { label: 'Video', kind: 'video', items: [{ start: 0, length: 6, label: 'Take 2', state: 'selected' }, { start: 6, length: 4, label: 'No picture yet', state: 'gap' }] },
        { label: 'Audio', kind: 'audio', items: [{ start: 0, length: 10, label: 'Rain on glass' }] },
        { label: 'Captions JA', kind: 'caption', items: [{ start: 2, length: 1.6, label: '急いで！' }] },
      ]}
    />
  );
}
```

## Accessibility

With `onDrop` a drop is said aloud ("Popcorn night inserted at 2:41", "… on Video 3" when it went to a free lane or "… on Clips" to the new lane, "No free track at 2:41" when refused); dragging is for the pointer, Insert and Enter on the card do the same by keyboard. A group named by `label` (default "Timeline") whose ruler times, track names, markers and playhead ("Playhead at 0:04") read as text, a looped sound adds "loops to fill, 6 seconds made" to its name, with waveforms and icons hidden. With `onSelect` the items are one Tab stop of buttons named by label, track, times and state (Left and Right move within a track, Home and End to its ends, Up and Down to the nearest item on the next one, Enter or Space selects), a selected item's grips are sliders ("Trim the start of" the item) that move a frame per arrow (`trimStep`) and a second with Shift through `onTrim`, and with `reorderable` and `onMoveTrack` Up and Down move a track by its handle, named with its place ("Move the Picture track, 1 of 3"), and Enter or Space lift it to move it further and drop it (Escape puts it back), each keyboard move said aloud, and a dragged track when it drops. With `onSelectMarker` each flag is a button named with its time ("Kiko enters at 0:02", ", selected" when it is), and a shared flag's list holds one such button per marker; with `onMoveMarker` Alt and an arrow move it a frame (Shift a second), said aloud, and its description says so. The End calls come on the key's release, so a held arrow saves once. With `onView` the zoom controls are buttons named "Zoom out", "Fit the whole cut" and "Zoom in", each name shown as a tooltip under it on hover or keyboard focus (Fit and Zoom out unavailable when the whole cut shows). With `onSeek` the playhead is a slider named "Seek" (`seekLabel`), its value said in seconds and frames, in place of the "Playhead at" text.

Used on: Web
Version: 1.10
