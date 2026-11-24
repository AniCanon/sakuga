# ProviderButton

ProviderButton is the button for signing in with Apple or Google, in the provider's own mark and colours as each provider sets them.

## When to use

Use it for signing in or creating an account with Apple or Google.

- Not for any other action: use `Button`.
- Not for linking an account inside the product (YouTube, a connector): use `Button` with the service's name in the label.

## How it works

- `provider` is `apple` or `google`. Apple's is white on Dark and black on Light; Google's is its own dark or light button with a grey edge. Sakuga sets only the size and the shape.
- It takes none of Button's variants, icons or trailing value: the provider decides how it looks, so nothing can be combined with it.
- Apple and Google sit as equals, the same size, Apple first. The labels are "Continue with Apple" and "Continue with Google", which it shows when given no label.
- `size="lg"` (the default) on sign-in pages; `md` where it sits in a row of settings. `shape="pill"` on phones, `fullWidth` in a sign-in column.
- Apple's white button is Apple's, not the view's primary action: a view can have both.
- Pressing sinks it to 97% on `motion-instant`, like Button.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `provider` | `'apple' \| 'google'` | required | Whose button: `apple` or `google`, in that provider's own mark and colours. |
| `size` | `'md' \| 'lg'` |  | lg (default) on sign-in pages; md where it sits in a row of settings. |
| `shape` | `'rounded' \| 'pill'` |  | pill on phones; rounded (radius-md) on desktop. |
| `fullWidth` | `boolean` |  | Takes its column's width, in a sign-in column. |
| `children` | `ReactNode` |  | The label. Defaults to "Continue with Apple" or "Continue with Google". |
| `className` | `string` |  | Extra class on the root element. |

Any other attribute of its root element (`aria-*`, `data-*`, `id`, event handlers) is passed on to it.

## Example

```tsx
import { ProviderButton } from '@anicanon/sakuga/ui';

export function ProviderButtonExample() {
  return (
    <ProviderButton provider="apple" fullWidth />
  );
}
```

## Accessibility

A native button (a link with `href`): Tab reaches it, Enter activates it, and Space does too on a button; `disabled` takes a button out of the tab order. A screen reader hears its label ("Continue with Apple"); the provider's mark is hidden. With `href` and `disabled` it is a disabled button. Under reduced motion its press does not scale, and in forced colours it keeps an edge.

Used on: Web, iOS, Android
Version: 1.0
