# ProductionNav

ProductionNav is the side bar inside a production (an episode, a short, and later a manga issue).

## When to use

Use it for the side bar inside a production (an episode, a short, a manga issue): its views, scenes and the facts that matter while making it, folding to a rail of views and tools in the editor.

- Not for the creator sidebar outside a production, wide or `compact`: use `SideNav`.
- Not for the top of a view with its title and actions: use `ViewHeader`.
- Not for the steps of a full-screen flow: use `Stepper`.
- Not for the desktop header across the app: use `TopNav`.

## How it works

- The app's SideNav is not shown there: a production is a focused, full-screen workspace.
- Expanded (Script, Plan, Cut, Screen, Publish): back to the list, the production's cover, title and format; the views with their state (`note`, and `state: 'attention'` when something needs you; `disabled` for a view that is not open yet, drawn waiting in the muted ink with its note saying when it opens, as Plan before there is a script); the scenes with their picture and state (`sections.selected` is the open scene's `number`, not its place in the list); the facts that matter while making it (runtime against plan, story place, video plan); the fragments balance.
- A fact can be the episode's spending: `fragments` shows its value with the fragment mark ("3,420 of ~4,100", spent against the plan, with `percent`), and `href` or `onClick` makes it open what it sums up, by scene and by kind. It reads as the other facts, and underlines under the pointer.
- `collapsed` (Cut): one 72px rail with the cover, the views as icons, a separator and the editor's `tools` (`currentTool` marks the open one), so the picture gets the room.
- The rail fits a short window: under 820 px tall its cover and rows tighten, under 740 px tighter, and when its tools still do not fit they scroll, a hairline at each end that has more past it. Every tool is always reachable, by wheel, drag or Tab (a focused tool scrolls into view).
- Every place it can take you is a link: `back.href`, and `href` on each view, scene and tool; `balanceHref` is where the balance leads. Without an address, an item is a button that runs its `onClick` (`onBalance` for the balance), never a link to #.
- Hover, as SideNav: a view, tool, scene or the rail's cover takes the hover fill and its words go to ink; the icon tilts up a little and settles back (not under reduced motion); Back goes to ink. A waiting view never answers the pointer.
- The current view, scene and tool read in ink weight with the small state dot (`state-dot`) beside the name; on the rail the dot sits at the edge, centred on the icon. No fill, no edge.
- `production.menu` (`{ items }`, as a `Menu` takes them) gives the production its own ⋯ on its cover, the same as its card's in the list, on every view: Rename, and Delete in the danger tone set apart. Without a cover it sits beside the title. The collapsed rail leaves it out: the Cut folds the bar for the picture, and the ⋯ is one click away on any other view or on the list.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `back` | `object` |  | Back to the list of productions, as a link (`href`) or a button (`onClick`). |
| `back.label` | `string` | required |  |
| `back.href` | `string` |  |  |
| `back.onClick` | `MouseEventHandler` |  |  |
| `production` | `object` |  | The production's cover, title and format. |
| `production.title` | `string` | required |  |
| `production.meta` | `string` |  |  |
| `production.image` | `string` |  |  |
| `production.menu` | `CardMenu` |  | The production's ⋯ (Rename, Delete), on its picture, on every view; the collapsed rail leaves it out. |
| `production.menu.label` | `string` |  |  |
| `production.menu.items` | `MenuProps['items']` | required |  |
| `production.menu.open` | `boolean` |  |  |
| `views` | `object[]` | required | The production's views (Script, Plan, Make, Screen, Publish), each with its state: a `note`, and `attention` when something needs you. |
| `views[].icon` | `IconName` | required |  |
| `views[].label` | `string` | required |  |
| `views[].note` | `string` |  |  |
| `views[].state` | `'attention'` |  |  |
| `views[].href` | `string` |  |  |
| `views[].onClick` | `MouseEventHandler` |  |  |
| `views[].disabled` | `boolean` |  | Not open yet (Plan before there is a script): drawn waiting, out of the tab order, its note saying when it opens. |
| `current` | `string` |  | The label of the view open now. |
| `sections` | `object` |  | The scenes, numbered, with their pictures. `selected` is the open scene's `number` (not its place in `items`). |
| `sections.title` | `string` |  |  |
| `sections.selected` | `number` |  |  |
| `sections.items` | `object[]` | required |  |
| `sections.items[].number` | `number` | required |  |
| `sections.items[].title` | `string` | required |  |
| `sections.items[].image` | `string` |  |  |
| `sections.items[].note` | `string` |  |  |
| `sections.items[].state` | `'attention'` |  |  |
| `sections.items[].href` | `string` |  |  |
| `sections.items[].onClick` | `MouseEventHandler` |  |  |
| `facts` | `object[]` |  | A few facts at the foot (runtime, cut), with an optional bar for `percent`. |
| `facts[].label` | `string` | required |  |
| `facts[].value` | `string` | required |  |
| `facts[].percent` | `number` |  |  |
| `facts[].fragments` | `boolean` |  | The value is a fragment amount ("3,420 of ~4,100"): shown with the fragment mark. |
| `facts[].href` | `string` |  | Opens what the fact sums up (the episode's spending, by scene and by kind). |
| `facts[].onClick` | `MouseEventHandler<HTMLElement>` |  |  |
| `facts[].linkLabel` | `string` |  | The link's name when the label and value alone do not say what it opens. |
| `balance` | `string` |  | The Fragments balance, at the foot. |
| `balanceHref` | `string` |  | Where the balance leads (the Fragments page), open or collapsed. |
| `onBalance` | `MouseEventHandler` |  | Runs when the balance is pressed and it has no `balanceHref`. |
| `collapsed` | `boolean` |  | The Cut's 72 px rail: the cover, the views as icons and the editor's `tools`. |
| `tools` | `object[]` |  | The editor's tools on the collapsed rail. |
| `tools[].icon` | `IconName` | required |  |
| `tools[].label` | `string` | required |  |
| `tools[].short` | `string` |  |  |
| `tools[].href` | `string` |  |  |
| `tools[].onClick` | `MouseEventHandler` |  |  |
| `currentTool` | `string` |  | The label of the tool open now. |
| `label` | `string` |  | Names the region; "Production" without it. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { ProductionNav } from '@anicanon/sakuga/anicanonkit';

export function EpisodeRail({ cover }: { cover: string }) {
  return (
    <ProductionNav
      back={{ label: 'Episodes', href: '/episodes' }}
      production={{ title: 'The First Watch', meta: 'Episode 2 · Directed · 16:9', image: cover }}
      current="Make"
      views={[
        { icon: 'document', label: 'Script', note: '5 scenes', href: '/episodes/2/script' },
        { icon: 'frame-cinematic', label: 'Plan', note: '22 cuts', href: '/episodes/2/plan' },
        { icon: 'video', label: 'Make', note: '3 to review', state: 'attention', href: '/episodes/2/make' },
        { icon: 'film', label: 'Cut', note: '6:40', href: '/episodes/2/cut' },
      ]}
    />
  );
}
```

## Accessibility

A complementary region named by `label` (default "Production"): Tab moves through Back, the links of a navigation named "Views" (the current one "current page", with its note; a `disabled` view is a disabled link, out of the tab order, still read with its note: "Plan, After the script, dimmed"), the scene links ("current" on the selected one) and the balance link, while the production's title is a level-2 heading, the scenes' title a level-3 one, and each fact reads its value and percent. Collapsed, the rail's links are named by their titles ("Cast · 3 waiting"), a `disabled` one the same way and out of the tab order, the tools sit in a navigation named "Tools" and are named by their `label` (not the short word under them), and the balance is the mark alone, still a link named "Fragments balance: 1,240"; pictures, icons and the attention dot are hidden. With `production.menu`, the ⋯ is a button after the production's heading, named "More for" and the title, with a menu popup.

Used on: Web
Version: 1.6
