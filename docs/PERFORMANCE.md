# Performance findings

What the icon-compiler investigation measured, and what came out of it. The investigation's code is not part of this repository.

## Icons

- **One sprite, cached once, stays.** A build-time compiler that picks each route's icons was built and measured on the real portal. It kept all 159 icons there, since the design-system gallery draws every one, saved 345 bytes compressed, and added about 3.5 s to each build. It needs TypeScript at build time and works only with Vite. Unfinished; not shipped.
- **Where the sprite's weight is.** In 2.0.0, `icons.svg` is 234 KB raw and 85.9 KB compressed. The 72 detailed character pictograms (`anthro-`, `trait-`, `creature-`, `faction-`, `age-`) take 63 KB of that. With `body-`, `figure-` and `height-` they're about 80 KB. The 150 interface icons together are about 23 KB. Any lighter first load starts there, not in a compiler.

## Rendering

- **Opening a surface rendered it twice.** `usePresence` recorded an opening in an effect, so an opening Select or Popover committed its subtree, then updated again. It now records the opening during render, the React pattern for state derived from a prop. Covered by `src/internal/presence.test.tsx`.
- **No idle re-renders** were found in the profiled stories. Re-renders are small elsewhere, so blanket memoization isn't warranted.
- **Profiling a story:** `npm run profile:renders` builds Ladle with a render counter and drives eight stories at 1× and 4× CPU. The results go to `check/.generated/render-profile/renders.json`. It's a tool to use when something feels slow, not a gate.

## Sound

- **Decoding each sound only when it's first asked for was tried and rejected.** The sounds came out of order: a Select opened and closed quickly played "close" before "open", because "open" was still decoding. Each sound's first play was also late. All eleven still decode at the first press after `sound.on()`.
- **The sound test now names each recorded sound by its bytes**, not by the order it was decoded, so it checks what actually played, in any decoding order.

## Size limits

`npm run check:treeshake` fails when the one-Button page grows past its limit, compressed: script 60,000 bytes (React included), CSS 20,000 and icons 88,000. In 2.0.0 they measured 57,646, 19,166 and 85,728. Raise a limit only for growth that was meant.

## Not taken

- Compacting `tokens.css`: it saved about 306 bytes per page, but it dropped the usage comments and broke the rule that the package and the site generate the same file.
- Re-encoding the sounds (Opus, FLAC): exploratory only.
