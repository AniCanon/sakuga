# Pagination

Pagination reads a long list a page at a time: what this page holds, then previous, the page numbers and next.

## When to use

Use it for reading a long list a page at a time, under the list it pages: productions at 24 a page, counted as "1–24 of 31 shorts".

- Not for where a person is in a flow they step through: use `Stepper`.
- Not for a shelf that leads to everything on it: use `SectionHeader`.
- Not for the pages of a manga issue in the editor: use `IssueStrip`.

## How it works

- A list of one page shows none.
- Pass `page`, `pages` and, when the total is known, `total`, `pageSize` and `noun`: the count reads "1–24 of 31 shorts".
- Every number carries the locale's thousands separator (the Sakuga locale, README · Words; else `<html lang>`, else English): "1–25 of 2,481 people", and "2.481" on a Portuguese page. The page numbers do too, spoken and shown.
- Lists of productions page at 24, as the product's clips list does; search and filters sit above the list and send you back to page 1.
- Far pages fold into an ellipsis around the current one: 1 … 4 5 6 … 12.
- `hrefs` gives each page an address; without it the pages are buttons that call `onChange` with the page.
- The current page's fill slides to the new page on `motion-base`; numbers sink on press.
- With sound on, going to another page plays the choose sound, from a number or an arrow (README · Sound).
- Put it under the list it pages, across the list's full width. One per list.
- Sliding across the page numbers moves the pill with the pointer; let go on a number to go to that page.

## Props

| Prop | Type | Default | What it does |
|---|---|---|---|
| `page` | `number` | required | The page shown, from 1. |
| `pages` | `number` | required | How many pages there are. |
| `total` | `number` |  | With total, the count reads "1–24 of 31 shorts"; without, "Page 1 of 2". |
| `pageSize` | `number` |  | Items to a page (default 24), for the count. |
| `noun` | `string` |  | What is counted ("shorts"): the count reads "1–24 of 31 shorts". |
| `label` | `string` |  | Default "Pages". |
| `hrefs` | `string[]` |  | One address per page, in order. |
| `onChange` | `(page: number) => void` |  | Without hrefs: called with the page to show. |
| `className` | `string` |  | Extra class on the root element. |

## Example

```tsx
import { Pagination } from '@anicanon/sakuga/ui';

export function PaginationExample() {
  return (
    <Pagination page={12} pages={12} total={281} noun="pictures" onChange={() => undefined} />
  );
}
```

## Accessibility

A navigation region named by `label` (default "Pages"): the count reads as text, then Tab moves through "Previous page", each "Page 3" (the current one marked "current page") and "Next page", which are disabled at the ends: an arrow that turns off under focus hands focus to the current page. The ellipsis is hidden. Sliding is for the pointer; each page is still its own link or button.

Used on: Web, iOS, Android
Version: 1.1
