# StoryMap

StoryMap draws the story on a canvas you move: characters (portraits) and places (art) are hubs; events are small shapes, linked to the hubs they involve.

## When to use

Use it for the story drawn as hubs and events on a canvas: characters and places as hubs, events on a thread in story order, and a selection's causes and conflicts.

- Not for moving through the story in story order: use `StoryScrubber`.
- Not for the same characters, places and events as rows in a panel: use `EntityRow`.
- Not for the open questions the audience waits on: use `QuestionRow`.

## How it works

- **Drawn as React Flow draws a flow.** A dot-grid ground you pan and zoom. Every hub and event is a node: a flat panel on `map-node-bg` under a hairline, its picture (a 32 px portrait, a 56×36 place frame, an event's shape) beside its name and one quiet line. Handles sit only where a drawn edge attaches: a character gives at its foot, a place receives at its head, an event either; a node with no edge drawn has none. Edges are curves from handle to handle.
- **Laid out by the story's own structure.** A frame per scene, in story order, left to right, named in its corner ("Scene 6 · The fight"); its events run down it, wrapping into another column after five, spread evenly; the scene's place stands at the frame's foot, inside it. An event with no scene sits in its episode's frame, "Episode 1 · not in a scene"; with no episode either, in a frame named for where it came from (its source document, "Manga 3"); "Not in a scene" is for an event with neither. A frame with no place of its own takes the place all its events share; when they share none, its foot stays empty and the frame ends under its last card. Arcs are the scrubber's segments, not frames. A story is never cut into numbered stretches ("Events 1–5"): a frame always means something the author made. Not placed is its own dashed frame, after the last.
- **Only who is in what is shown.** Characters stand in one row above, each over the middle of the events they are in, in order of first appearance, their quiet line their count ("9 events", "1 event"). A character in none of the events laid out is not drawn; they stay in the World panel. An event card's quiet line is its type and who is in it ("Twist · Tattoo, Lisa"); its episode is the frame's to say, never repeated on every card.
- **A card moves only on the map.** Moving it never changes story order, and it never leaves its scene's frame: the frame grows to hold it, and a card dropped outside lands at its own frame's nearest edge. Story order is changed in the event's own When it happens. "Put it back in place" returns one card to where the layout puts it; "Arrange the map" returns every card, and events added later are laid in by the same structure.
- **A long story opens on the moment, readable.** `frame` names what the map opens on, centred at `zoom` (100% when left out), with the map's own edge held at the pane's edge rather than empty ground beyond it. The page passes the events of the scene that holds the moment shown, so Now opens on the last scene and a moment moved back opens on its own. Fit is still there: it shows the whole story at a glance, small, as an overview.
- **More than twelve events: only the links of what is selected.** Counted in story order; events not placed yet and proposed ones don't count. With nothing selected, the moment's event is the selection: its cast and its place are linked, the rest of the map is drawn without links, and each character's quiet line says how many events they are in ("8 events"). Selecting a hub or an event lights all of its links (`tone: "accent"`) and dims what it is not in. Up to twelve, every link is drawn quiet, as before. The page decides which links to pass; the map draws handles only where they land.
- **What a link runs to is never lost off the edge** (`held`). A character is one node, so a lead in every stretch can't sit beside all of them. With `held`, a node a drawn link runs to, out of view, is held at the pane's edge where the link leaves, named, with an arrow towards it, inside the pane and clear of the controls and the minimap; pressing it brings that node into view, and what was left behind is held in its turn. A long story passes it, so the moment's cast and place are always named on the map.
- **Cards never overlap.** Where the map opens, cards closer than their boxes and a 12 px gap are pushed apart by the least move, along the axis that needs less (cards are wide, so mostly up and down), until none touch; an `edges` end that sat on a card's centre moves with the card. When the spread cards run past the area the map was laid out in, it opens as Fit does: all of them while a card still reads, else on the selection, the moment's stretch or the start, never smaller than a card can be read. A canvas that places nodes itself gets the same spreading from `storyMapView.spread(map)`.
- **Words never collide.** A node has a fixed width; its name is one line cut with an ellipsis and whole in its tip and its accessible name. States (Dead, Held, Burning) open the node's second line as a badge, never over the picture. A character dead or gone is `muted`: the portrait greys and fades, the words stay readable. An event's `lead` ("Event 9") comes first on its second line and is never the part cut, so two events of the same title stay apart; its type and `sub` after it give way, and the lead is in its accessible name.
- **No picture yet.** A character without a portrait shows their age figure (`figure`, default `age-adult`) on the canvas colour, as `CastCard` does; a place without art shows AniCanon's mark, quiet, on the canvas colour. Never an initial alone, never an empty box with an icon.
- **Edges.** `links` join ids, so they follow a node as it moves. At rest they are `quiet`; a selection lights its own (`tone: "accent"`) and dims the rest; a link or arc with a warning (a cause that comes after its effect) takes `tone: "warning"`: amber (`map-edge-warning`), as heavy as a selected link, never dimmed, an arc with an amber arrowhead drawn over the rest, and each node it touches reads "a link with a warning" after its name, so the warning is never colour alone; and its nodes take the focus ring. `edges` (fixed coordinates) stay for a map that doesn't move.
- **Moving it** (`interactive`): drag a node (`onMove(id, x, y)` when it lands; it lifts with a shadow while it moves), drag the ground to pan, the wheel or a pinch to zoom around the pointer (25% to 250%). A press that doesn't move still selects. The controls are React Flow's, stacked in the bottom corner: zoom in, zoom out, Fit, and the key, which opens beside them. `fit` opens fitted to everything with an even margin; `fit="focus"` opens on what is selected, never below `minZoom`, as a narrow pane does; `frame` opens on the nodes it names at `zoom`; `zoom` or `view` opens elsewhere.
- **Minimap** (`overview`): in the bottom corner, the nodes as blocks and the part out of view shaded; a press or a drag there moves the view. It appears only while part of the map is out of view, so at Fit it never covers a node, and not on a map narrower than 560 px, where it would take the room the nodes need.
- A selection lights its hubs (`focus`) and dims the rest (`dim`); events after the moment are `ghost`. A proposed event (being added) is drawn dashed in the accent; a just-added one is `new` with a New badge. `arcs` draw causes and conflicts of the selection; `dashed` marks a conflict.
- `onSelect(id, kind)` makes each hub and event a button; all of them are one Tab stop that the arrows move through. `onChipRemove` makes the chip's close work.
- On the web the portal mounts the same parts on React Flow, and the package exports them: `StoryMapNode` (a hub or an event, as a custom node; `ports` ({ in, out }) says which handles a drawn link lands on), `StoryMapGroupFrame` (an arc), `StoryMapTools`, `StoryMapKey`, `StoryMapOverview`, `StoryMapHeld` (a held label: `name`, `direction` towards the node, placed at the pane's edge; StoryMap draws its own with `held`), `StoryMapHeldNames` (all of a map's held names, one per edge, for a map on another canvas: `map`, `view`, `size`, `overview`, `chip`, `onShow`), `storyMapView` (the view as pure functions StoryMap itself uses, so a map on another canvas keeps one behaviour: `open`, where it opens; `fit`; `focus`, the selection and its events; `frame`, a stretch; `held`, where held names stand; `route`, how each drawn link runs; `spread`, the map with its cards pushed apart; `bounds`. Options: `chrome`, the room the pane's controls take at each edge; `overview`; `chip`; `minZoom`, 0.8 by default; `frame`; `moment`), `storyMapCurve` (an edge's path, handle to handle) and `STORY_MAP_NODE` (each node's size, so edges meet its sides). `StoryMap` is built from those same parts; the tools and minimap are these, not React Flow's own.
- **An event card reads at map scale.** Its type's glyph stands bare at 20 px; its title takes two lines before it is cut, whole in its tip; the line under it says the type only when it isn't a plain event, then who is in it ("Twist · Tattoo, Lisa", "Lisa"). Where it was told is the frame's and the scrubber's to say.
- **Fit stays readable.** `fit` never goes below a zoom where a card can be read (0.8, or `minZoom` when given). When the whole story doesn't fit at that zoom, it opens on the selection's events, else on the moment's stretch (`frame`), else on the story's start, and the overview carries the rest.
- **Where it opens.** A bare `fit` opens as `storyMapView.open`: all of it when all of it reads; else on the selection and its events, or the moment's whole column with its characters, from the top; nudged so no card opens cut by the pane's edge, and clear of the chip's row. The Fit button is `storyMapView.fit`.
- **A hub with many links reads as a tree.** Five or more shown links (not quiet or dimmed) between a character or place and events below it (or above it, as a place's are) run as one trunk from its handle, a bus over (or under) the arcs' frames, one run per column along the gutter left of its cards, and a short branch into each card's left side; runs they share overlap, so seventeen links read as a trunk and its branches, not a fan. Fewer links curve from facing side to facing side (`storyMapView.route`).
- **What an opening cuts.** A selection opens whole; when a card must be cut at the pane's edge, it is one the selection is not linked to. Give every node the selection is not linked to, hubs as well as events, `state: 'dim'`, so a cut card reads as context: a dimmed card's name and line take the muted ink, so it reads as dimmed even with its picture out of view. The pane crops like a window, as panning does: a cut card is never hidden or held.
- **Arcs never share a point.** The arcs that meet one card edge stand apart along it, in the order of their other ends, so no arrowhead hides another and a line leaving never starts at an arrow's point.
- **Held names never cover each other.** Each keeps clear of the cards, the frames' labels and the other held names, sliding along its edge; the edges take their turns in whichever order leaves the least covered, so one name never takes the only clear place another had, and a name with no clear place on its edge stands where it covers least.
- **One held name per edge.** A node a drawn link runs to, out of view, is named at the edge the link leaves by; when several are out of view the same way, that edge holds one label, "4 more", and pressing it brings them into view, so held names never stack; a held name slides along its edge to the nearest place clear of every card and of every frame’s label; on the right edge it may stand level with the chip’s row, which is only on the left.
- **The tools keep a safe area.** Fit and a framed opening keep every card clear of the zoom tools in the bottom-left corner; the overview shows only while part of the map is out of view, so it never covers a fitted card.

### Differs from the design

- The port draws what the design means where the design has a defect, until a version carries the fix.
- StoryMap reads `moment`, which the design's `index.d.ts` doesn't declare: `viewOpts` passes `props.moment` to `storyMapView`, which keeps the moment's event whole when a stretch opens. The port declares it.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `height` | `number` |  | The canvas's height in px. |
| `width` | `number` |  | The canvas's width in px. |
| `label` | `string` |  | Names the map for screen readers. |
| `id` | `string` |  | Used for the key's id. |
| `chip` | `string` |  | A removable chip at the top: what the map is narrowed to. |
| `tools` | `boolean` |  | `false` hides the controls. |
| `legend` | `boolean` |  | `false` hides the key. |
| `interactive` | `boolean` |  | A canvas you move: drag a hub or an event, drag the ground to pan, the wheel or a pinch to zoom; Shift and an arrow moves the one in focus. |
| `flow` | `StoryMapFlow` |  | `down`: characters on top, events in their arcs, places below; handles top and bottom. Default `right`. |
| `groups` | `StoryMapGroup[]` |  | Arcs as groups: a named frame on the canvas under the events in it. |
| `groups[].label` | `string` | required | The arc's name, in its corner. |
| `groups[].x0` | `number` | required | Its left edge, in px. |
| `groups[].y0` | `number` | required | Its top edge, in px. |
| `groups[].x1` | `number` | required | Its right edge, in px. |
| `groups[].y1` | `number` | required | Its bottom edge, in px. |
| `groups[].dashed` | `boolean` |  | Drawn dashed: Not placed. |
| `fit` | `boolean \| 'focus'` |  | Opens fitted to everything on it; `focus`: to what is selected (all when nothing is), never below `minZoom`. |
| `frame` | `string[]` |  | The nodes the map opens on, centred at `zoom` (1 when left out), the map's edge held at the pane's: on a long story, the events of the moment's stretch. |
| `held` | `boolean` |  | A node a drawn link runs to, out of view, is held at the pane's edge, named, with an arrow towards it; pressing it brings it into view. |
| `moment` | `string` |  | The moment's event: an opening on its stretch keeps it whole. |
| `minZoom` | `number` |  | The lowest zoom `fit` opens at. |
| `zoom` | `number` |  | Opening zoom, 0.25 to 2.5 (default 1), centred. |
| `view` | `object` |  | Opening view: the canvas's offset and zoom. |
| `view.x` | `number` | required |  |
| `view.y` | `number` | required |  |
| `view.zoom` | `number` | required |  |
| `overview` | `boolean` |  | The minimap in the bottom corner, shown while part of the map is out of view. |
| `keyOpen` | `boolean` |  | Opens with the key shown. |
| `dragging` | `string` |  | A hub or an event drawn mid-drag. |
| `onSelect` | `(id: string, kind: 'hub' \| 'event') => void` |  | Makes each hub and event a button, all one Tab stop. |
| `onMove` | `(id: string, x: number, y: number) => void` |  | A hub or an event placed somewhere new. |
| `onZoomIn` | `() => void` |  | Called after Zoom in. |
| `onFit` | `MouseEventHandler` |  | Called after Fit the map. |
| `onChipRemove` | `MouseEventHandler` |  | The chip's close. |
| `hubs` | `StoryMapHub[]` | required | Characters and places, placed in px, with their badges and states. |
| `hubs[].id` | `string` | required | Its id, for links, arcs, onSelect and onMove. |
| `hubs[].kind` | `'character' \| 'place'` | required | A character or a place. |
| `hubs[].x` | `number` | required | Its centre on the canvas, in px. |
| `hubs[].y` | `number` | required | Its centre on the canvas, in px. |
| `hubs[].size` | `number` |  | Kept for maps drawn before 2.0; a node has a fixed size. |
| `hubs[].image` | `string` |  | The portrait, or the place's art. |
| `hubs[].initial` | `string` |  | Kept for maps drawn before 2.0; a character with no portrait shows `figure`. |
| `hubs[].figure` | `IconName` |  | The age figure drawn until there is a portrait (default `age-adult`). |
| `hubs[].label` | `string` | required | Its name: one line, cut with an ellipsis, whole in its tip. |
| `hubs[].sub` | `string` |  | The node's quiet line (Heros, Place). |
| `hubs[].badge` | `BadgeSpec` |  | A state (Dead, Held, Burning), opening the second line. |
| `hubs[].badge.label` | `string` | required |  |
| `hubs[].badge.variant` | `'new' \| 'alert' \| 'warning'` |  |  |
| `hubs[].badge.icon` | `IconName` |  |  |
| `hubs[].state` | `'focus' \| 'dim'` |  | `focus`: in the selection; `dim`: not at this moment. |
| `hubs[].muted` | `boolean` |  | Dead or gone at this moment: the portrait greys, the words stay readable. |
| `events` | `StoryMapEvent[]` | required | The events, with their types and states. |
| `events[].id` | `string` | required | Its id, for links, arcs, onSelect and onMove. |
| `events[].x` | `number` | required | Its centre on the canvas, in px. |
| `events[].y` | `number` | required | Its centre on the canvas, in px. |
| `events[].type` | `EventType` | required | Its kind, drawn as its shape. |
| `events[].label` | `string` | required | Its title. |
| `events[].state` | `'focus' \| 'dim' \| 'ghost' \| 'proposed' \| 'new'` |  | `focus` selected, `dim` or `ghost` not at this moment, `proposed` being added, `new` just added. |
| `events[].unplaced` | `boolean` |  | It has no place in the story yet. |
| `events[].badge` | `BadgeSpec` |  | A state, opening the second line. |
| `events[].badge.label` | `string` | required |  |
| `events[].badge.variant` | `'new' \| 'alert' \| 'warning'` |  |  |
| `events[].badge.icon` | `IconName` |  |  |
| `events[].sub` | `string` |  | After its type on the quiet line: what told it. |
| `events[].lead` | `string` |  | First on the quiet line, never shortened: what tells it from an event of the same title ("Event 9"). Also in its name. |
| `links` | `StoryMapLink[]` |  | Links by id, following their ends as they move. |
| `links[].from` | `string` | required | The id it leaves. |
| `links[].to` | `string` | required | The id it reaches. |
| `links[].tone` | `'accent' \| 'warning'` |  | `accent`: part of the selection. `warning`: drawn in amber, and each end reads "a link with a warning". |
| `links[].dim` | `boolean` |  | Not part of the selection. |
| `links[].dashed` | `boolean` |  | Drawn dashed. |
| `links[].quiet` | `boolean` |  | Drawn faint until it matters. |
| `edges` | `StoryMapEdge[]` |  | Fixed lines, for a map that does not move. |
| `edges[].x1` | `number` | required | Where it starts, in px. |
| `edges[].y1` | `number` | required | Where it starts, in px. |
| `edges[].x2` | `number` | required | Where it ends, in px. |
| `edges[].y2` | `number` | required | Where it ends, in px. |
| `edges[].tone` | `'accent' \| 'warning'` |  | `accent`: part of the selection. `warning`: drawn in amber. |
| `edges[].dim` | `boolean` |  | Not part of the selection. |
| `edges[].dashed` | `boolean` |  | Drawn dashed. |
| `arcs` | `StoryMapArc[]` |  | The selection's causes and conflicts; `dashed` marks a conflict. |
| `arcs[].x1` | `number` |  | Where it starts, in px, when not joining ids. |
| `arcs[].y1` | `number` |  | Where it starts, in px, when not joining ids. |
| `arcs[].x2` | `number` |  | Where it ends, in px, when not joining ids. |
| `arcs[].y2` | `number` |  | Where it ends, in px, when not joining ids. |
| `arcs[].from` | `string` |  | The event it leaves. |
| `arcs[].to` | `string` |  | The event it reaches. |
| `arcs[].tone` | `'warning'` |  | `warning`: drawn in amber with its arrowhead, over the rest, and both events read "a link with a warning". |
| `arcs[].dashed` | `boolean` |  | A conflict, not a cause. |
| `arcs[].bend` | `number` |  | How far it bows, in px. |
| `children` | `ReactNode` |  | Drawn on the canvas, after the events, in its own coordinates. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { StoryMap } from '@anicanon/sakuga/anicanonkit';

export function ArcOne({ onSelect }: { onSelect: (id: string, kind: 'hub' | 'event') => void }) {
  return (
    <StoryMap
      label="EBA's story"
      width={760}
      height={540}
      flow="down"
      fit
      interactive
      onSelect={onSelect}
      hubs={[
        { id: 'kiko', kind: 'character', x: 140, y: 60, label: 'Kiko', sub: 'Heros' },
        { id: 'ken', kind: 'character', x: 380, y: 60, label: 'Ken', sub: 'Heros' },
        { id: 'se', kind: 'place', x: 260, y: 470, label: 'Sé station', badge: { label: 'Burning', variant: 'alert', icon: 'trait-fierce' } },
      ]}
      events={[
        { id: 'fire', x: 260, y: 200, type: 'event', label: 'Fire at Sé', sub: 'Episode 1' },
        { id: 'doors', x: 260, y: 290, type: 'twist', label: 'The doors close behind the last train', sub: 'Episode 1' },
      ]}
      links={[{ from: 'kiko', to: 'fire' }, { from: 'ken', to: 'doors' }, { from: 'fire', to: 'se' }, { from: 'doors', to: 'se' }]}
      groups={[{ label: 'Arc 1 · The fire', x0: 140, y0: 150, x1: 380, y1: 340 }]}
    />
  );
}
```

## Accessibility

A group named by `label` (default "Story map: characters and places as hubs, events between them") whose hubs and events are one Tab stop the arrows move through, each read with what the drawing shows (an event's type, "proposed", "new", "not at this moment", "not placed", "current" on the focus) and, when `interactive`, as "movable". Dragging has a keyboard way: Shift and an arrow moves the hub or event in focus, and + and − zoom. With `onSelect` each is a button. Tab then reaches the held labels ("Show Mio"), the chip ("Remove" and its words), then the controls in the order drawn: "Zoom in", "Zoom out", "Fit the map" and "Key", which says whether the key is expanded. The overview is a picture named "The whole map, with the part in view framed"; the arrows and Fit reach everything it does. A dimmed, ghost or muted node fades only its picture or shape; its name and quiet line keep their contrast.

Used on: Web
Version: 2.12
