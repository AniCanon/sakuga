# Architecture

A page should carry only the components it renders. Each rule below exists to keep that true. `npm run check:treeshake` proves it on every build: a page that imports only `Button` retains Button and Icon while excluding unrelated components, including FragmentSoul.

## Modules

- **One module per source file in `dist/`.** `tsc` builds the package, not a bundler, so the module graph a bundler sees is the source graph. Never add a build step that joins files.
- **Named exports only.** No default exports, no namespace objects (`window.Sakuga = {…}` is gone), no `Kit.X` aliases.
- **Barrels only re-export.** `src/ui/index.ts` and `src/anicanonkit/index.ts` hold `export { X } from './X/X'` lines and nothing else.
- **Nothing runs on import.** The bundle did several things as it loaded: it restored the theme, added storage listeners, made the live region and started the sound listeners. Those now live in `<Sakuga>`, which runs them as it mounts, and `sound.on()`. The design system bundle's globals (`Sakuga.setTheme`) are not the web API: an app wraps itself in `<Sakuga icons>` and reads the theme with `useTheme()`. A module-level statement with an effect makes `"sideEffects"` a lie, and the bundler would then keep everything.
- **`"sideEffects": ["**/*.css"]`** is the only promise the package makes, and it is the reason a component's CSS import survives tree-shaking.
- **AniCanonKit is built on Sakuga, never the reverse.** Nothing under `src/ui`, `src/internal`, `src/icons` or `src/tokens` imports from `src/anicanonkit`; `npm run check:layers` fails if it does. Where the design draws a kit part inside a core component, the core takes a neutral slot and AniCanonKit fills it:
  - `Button`'s `cost` drew `FragmentSoul`. The core Button now has a neutral `trailing` slot (a value behind the hairline, an optional mark, a spoken label), and AniCanonKit's `SpendButton` fills it with the fragment mark.
  - `OptionTiles`' large tiles draw `FragmentSoul` for `amount` and `cost`. They take the same shape when ported: a neutral slot in the core, filled by an AniCanonKit part.

## CSS

- **Each component imports `../../base.css` and its own `Name.css`.** `base.css` holds what every component may draw:
  - `sk-sr`;
  - the shared keyframes;
  - the glide;
  - focus basics;
  - the theme fade;
  - the reduced-motion catch-all;
  - light on art;
  - the sound levels;
  - the reset that draws an action with no address, a button, as the link it stands in for (a `:where()` rule naming TopNav's, SideNav's, ProductionNav's, FragmentBalance's and LookPlate's items), and the glide hidden in forced colours;
  - a few tokens two components read (`css-owners.json` "props").
- **A component that draws another's class imports that component's CSS.** For example, `Select` imports `TextField.css`, because `sk-tf` belongs to TextField. `scripts/css-owners.json` records who owns each class two components draw, and who declares a token the split would give to a component that does not read it.
- **`tokens.css` stands alone.** It carries:
  - the colour tokens, dark first, with a light block;
  - the scales;
  - the type classes;
  - the dimension roles (`gap-*`, `inset-*`, `line-*`, `text-*-size`, motion moments).

  The roles live in `src/tokens/roles.css`, because the Design System type's compiler drops aliased dimensions.
- **Every property is a component token that aliases a role.** No raw values; see Sakuga's README.
- **Forced-colours rules stay with their component.** The design gives every control its rules, in one block of `bundle.css`; the split hands each component its own.
- **Hover looks sit inside `@media (hover:hover)`,** as the design has every one; css-split keeps the wrapper.

## Icons

- **`icons.svg` is generated** by `scripts/build-icons.mjs` from the reference bundle's icon tables, along with the `IconName` union. It has 222 symbols. Generation uses pinned, build-only SVGO settings to compact paths while preserving public IDs, viewBoxes, inherited paint and CSS stroke tokens. The browser still downloads one sprite and caches it. `npm run build` regenerates it automatically.
- **Optimization is verified against the source.** `e2e/icons.spec.ts` compares all 222 symbols at 16, 24 and 48 pixels, three stroke widths, both light/dark backgrounds and 1×/2× pixel densities with zero differing pixels. Ten detailed outlines listed in `scripts/optimize-icons.mjs` keep their source path commands because converting absolute to relative coordinates changes browser rasterization; their markup is still compacted. Other geometry-changing transforms and ID cleanup are disabled.
- **Each symbol carries its own fill and stroke,** so `<use>` draws an icon exactly as the bundle did. Colour comes from `currentColor`, and a path icon's stroke reads `--icon-stroke-width`.
- **Compression belongs to delivery.** Build output reports raw, gzip and Brotli sizes; the consuming host must negotiate HTTP compression. Merely including a `.br` file in the npm package would not configure that host.
- **The file must be well-formed XML.** One fault and an external `<use>` draws no icon at all. `src/icons/icons.test.ts` parses it.

## Sound

A component that makes a choice without a state of its own changing (a Picker hands its option over and closes) plays it with `soundChose()`, so the menu's close stays silent. `src/ui/sound/files.ts` holds the eleven sounds, and `sound.ts` imports it dynamically the first time sound wakes. The bundler makes it a chunk of its own, so a page that never turns sound on never downloads its 54 KB.

## Shared behaviour

`src/internal/` holds the helpers the components share. They are ported once, so components never redefine them:

| Helper | What it does |
|---|---|
| `cx` | Joins class names |
| `motionMs` | Reads motion timing from the tokens |
| `sized`, `tokenPx` | Sizes from tokens |
| `usePresence` | Keeps a surface mounted while its exit plays |
| `useComings` | Items that come and go by key: one added later arrives, one removed keeps its place while it leaves |
| `useGlide`, `Glide` | The selection indicator that travels |
| `useFresh` | Tells a state mark that has just changed |
| `useDrag` | Tells a drag from a press |
| `usePointerSeek` | Seeking by pointer |
| `usePointerArea` | Choosing a point in an area by pointer |
| `useUid` | Ids for aria relations |
| `useFocusScope` | Focus held by a surface; one that closes on a press outside also closes when focus leaves it |
| `useRoving` | One Tab stop for a set |
| `sliderProps` | Values on a track |
| `fmt`, `spoken`, `tc` | A time shown ("3:12"), said ("3 minutes 12 seconds") and as the editor's timecode |
| `pressProps` | Enter and Space on a non-native control |
| `GoLink` | A place to go is a link; an action with no address is a button, never a link to # |
| `textOf` | The words a piece of markup says, for a name built from it |
| `announce`, `useLoadingVoice` | The live region |

## React updates

List animation history is committed in layout effects, so abandoned renders cannot change the next animation. Leaving items keep their DOM identity and latest committed content until their exit finishes.

Timeline memoizes track content separately from its playhead and ruler. Pass immutable track and marker arrays; changes replace the corresponding array. Trim boundaries are calculated only for selected, interactive grips. The ruler measures markers on content, container-size and font changes. Waveform memoizes peak resampling and bar elements separately from playback position; replace the peaks array when samples change.

Selection indicators measure on selection/content changes and observe group and sibling dimensions. They read geometry before writing styles. TextField exposes conventional controlled `value` and uncontrolled `defaultValue` props; initial-only consumers must use `defaultValue`.
