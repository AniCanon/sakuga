# Button

Button runs an action with a text label: Play, Follow, Remind me, Done.

## When to use

Use it for an action with a word on it: the one main action of a view, the action beside it, and the confirmation in a dialog that deletes something.

- Not for an action inside a sentence or a row of text: use `TextLink`.
- Not for an action that one glyph says better than a word: use `IconButton`.
- Not for narrowing what a feed shows: use `Chip`.
- Not for switching between views of the same thing: use `SegmentedControl`.
- Not for a choice whose options each need a picture or a line of explanation: use `OptionTiles`.
- Not for signing in with Apple or Google: use `ProviderButton`.
- Not for an action that spends fragments: use AniCanonKit's `SpendButton`.

## How it works

- **primary**: the one main action per view (Play, Follow creator, Done). Never two primaries side by side.
- **secondary**: the supporting action beside the primary (Follow, More info).
- **outline**: a standalone action that should not compete with the primary (Remind me).
- **ghost**: quiet actions in rows and headers (See all).
- **destructive**: the one action that confirms a deletion or takes access away (Delete my account, Disconnect Claude), filled in vermilion (`danger`). It lives in the dialog that asks first, and it is that dialog's main action, in place of a primary. The way into it is a `TextLink variant="destructive"`, never a red button on the page. Removals you can simply undo (Remove a tag, Unfollow) stay ghost.
- `size="lg"` for hero actions, `md` by default, `sm` for desktop-only secondary actions. Every size except `sm` meets the 44px target.
- `shape="pill"` on phones; the default rounded corner (`radius-md`) on desktop.
- Labels say what happens, in sentence case. Add `aria-label` when the visible label needs its object ("Follow" → "Follow EBA").
- Pass `href` to render a link that looks like a button.
- `trailing` puts a value after the label, behind a hairline: `{ value, mark, label }`. `mark` is drawn before the value as given: size it at the button's icon size and hide it from a screen reader (`aria-hidden`), as `SpendButton` does; `label` is read after the value, so "~100" is heard as "~100 fragments". The core knows no unit. An action that spends fragments is AniCanonKit's `SpendButton`, which fills `trailing` with the fragment mark. Keep the label a plain verb ("Generate", "Start", "Retake"); never write the price into the label.
- **media** and **media-secondary**: the same two roles drawn over video or key art (hero Play and More info, Skip intro, shorts CTA). They never change with the theme.
- Pressing sinks it to 97% on `motion-instant`; it settles back on `motion-fast`.
- With sound on, a press plays the press sound (README · Sound).
- A disabled primary turns into a quiet fill (`button-disabled-bg`), not a faded white. Say why it's disabled in a visible line near it, never only in a tooltip.
- `busy` is for an action you already took that waits on the server (Plan the shoot while the story is read, Save, Delete in its dialog). It is never `disabled`: disabled says you can't press this, busy says it is working. The fill, the words' weight and the tab stop stay; a second press does nothing, hover and the press sink stop, and the pointer shows progress. For the first `--button-busy-delay` (`motion-slower`, 0.56 s) nothing else changes, so a quick answer never flickers; after it the app's loader (`Loader` unless the app sets one; AniCanon's mark in AniCanon) takes the icon's place (in front of the words when there is no icon), drawn in the button's own text colour a size up from the icon, and the button never narrows.
- `busyLabel` says what is happening: the label's own verb in -ing, with its object, and one ellipsis character. Plan the shoot → Planning the shoot…, Save → Saving…, Delete Sé station → Deleting…. Without it the words stay and only the loader comes. `doneLabel` ("Shoot planned") is said when it ends, for a screen that stays as it was; a screen that changes speaks for itself.
- With reduced motion the loader stands still, and the words say it is working.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'media' \| 'media-secondary' \| 'destructive'` | `'primary'` | media and media-secondary sit over video or artwork and never change with the theme. destructive: the one action that confirms a deletion or takes access away, in the dialog that asks for it. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | `lg` for hero actions, `md` by default, `sm` for desktop-only secondary actions. |
| `shape` | `'rounded' \| 'pill'` |  | pill on phones; rounded (radius-md) on desktop. |
| `icon` | `IconName` |  | An icon before the label. |
| `iconEnd` | `IconName` |  | An icon after the label. |
| `fullWidth` | `boolean` |  | Takes its column's width. |
| `trailing` | `ButtonTrailing` |  | A value after the label, behind the hairline: what the action costs, in whatever unit the product counts. AniCanon's fragment price is AniCanonKit.SpendButton. |
| `trailing.value` | `ReactNode` | required | What sits after the label, behind the hairline ("~100"). |
| `trailing.mark` | `ReactNode` |  | Drawn before the value, at buttonIconSize(size). It must hide itself from a screen reader (aria-hidden); the label speaks for it. |
| `trailing.label` | `string` |  | Read after the value, e.g. "fragments", so "~100" is heard as "~100 fragments". |
| `busy` | `boolean` |  | Waiting on the server: the fill and the tab stop stay, a second press does nothing, and after --button-busy-delay the loader takes the icon's place. |
| `busyLabel` | `string` |  | What is happening while busy, the label's verb in -ing with its object: "Plan the shoot" → "Planning the shoot…". Shown and announced once. |
| `doneLabel` | `string` |  | Announced when busy ends, when the screen itself says nothing new: "Shoot planned". |
| `as` | `ElementType` |  | Renders as another element, such as a router's link. |
| `children` | `ReactNode` |  | The label: what happens, in sentence case. |
| `className` | `string` |  | Extra class on the root element. |

Any other attribute of its root element (`aria-*`, `data-*`, `id`, event handlers) is passed on to it.

## Example

```tsx
import { Button } from '@anicanon/sakuga/ui';

export function ButtonExample() {
  return (
    <Button size="lg" icon="play">Play S1 · E1</Button>
  );
}
```

## Accessibility

A native button (a link with `href`): Tab reaches it, Enter activates it, and Space does too on a button; `disabled` takes a button out of the tab order. A screen reader hears its text (or `aria-label`), with `trailing`'s value and its `label` read after it ("~100 fragments"); icons and the mark are hidden. With `href` and `disabled` it is drawn as a disabled button, out of the tab order, since a link cannot be disabled. With `busy` it keeps focus and its place in the tab order but is `aria-disabled`, so Enter, Space and a click do nothing; after the delay a screen reader hears `busyLabel` once (or "Save, working" without it), and `doneLabel` when it ends; a wait shorter than the delay says nothing. In forced colours it keeps an edge in ButtonText, and a disabled one turns GrayText.

Used on: Web, iOS, Android
Version: 1.2
