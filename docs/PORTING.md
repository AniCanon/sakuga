# Porting a component

Each component is written as a typed, tree-shakeable module that draws exactly what its README describes: behaviour, markup, class names and tokens. The reference files it is compared against are not distributed with this repository. When `SAKUGA_DESIGN_DIR` names a folder that holds them (`v<version>/` for each version, and `snapshots/` for the visual baselines), `npm run design:fetch` copies the pinned version into the git-ignored `.design/` and the visual tests read their baselines from there; without it, the files already in `.design/` are used, baselines live in the git-ignored `.snapshots/`, and the checks that need missing files skip with a message while everything else runs.

`Button`, `Icon`, `ProviderButton` and `FragmentSoul` are the worked examples. Read them before starting.

## Steps

1. **Read the contract.** Start with `src/<ui|anicanonkit>/<Name>/README.md`, which is the component's own README from the design system, then the props in `.design/index.d.ts` and the function in `.design/bundle.js`.
2. **Write `<Name>.tsx`** next to the README, with a doc comment on the component (what it is, what to use instead, its Accessibility line, `@version` and `@see README.md`) and one on every prop.
   - Every README has one shape, in this order: `# <Name>` and one sentence saying what it is; `## When to use` ("Use it for …", then "Not for …: use `X`" lines); `## How it works` (variants, sizes, states and behaviour, one bullet each, with a "Differs from the design" subsection when there is one); `## Props`; `## Example` (one `tsx` block importing from the package path, `@anicanon/sakuga/ui` or `@anicanon/sakuga/anicanonkit`, and showing one real use); `## Accessibility`; then the `Used on:` and `Version:` lines. `npm run check:docs` fails on another order, a Props table that differs from the declarations, or an Example that doesn't compile.
   - The Props table is never written by hand: the prop docs in the code are its words, and `npm run docs:props` writes it. Then `node scripts/check-components.mjs --write` refreshes `docs/components.json` and `llms.txt` from the READMEs.
   - On a version move, the design's README and the port's share these sections. The title, the sentence under it, When to use, How it works, Accessibility and the `Used on:` and `Version:` lines come from the design's README as they are. Props and Example stay the port's: the design's describe the bundle's API, and the port's are written from its own types (`npm run docs:props`) and compiled as an app imports the package. A "Differs from the design" subsection is the port's own, kept at the foot of How it works.
   - Use JSX, typed props from `index.d.ts`, and named exports.
   - A component that renders a native element also accepts that element's native attributes and spreads them, as the bundle did with `omit(props, …)`.
   - An AniCanonKit component takes the core from `@anicanon/sakuga/ui`, as an app does; `npm run check:layers` names the few core parts it may import directly.
   - Use the helpers in `src/internal/` and never re-implement them. If a helper is missing, port it from the bundle into `src/internal/` first.
   - Copy SVG paths from the bundle, never retype them: `npm run check:reference` fails on any `d` the bundle does not draw.
   - Comments explain a constraint, as in the bundle. Carry the bundle's comments over where they still hold.
3. **Split its CSS** with `node scripts/css-split.mjs --write <Name>`.
   - If `--report` lists a class your component shares with another, settle it in `scripts/css-owners.json` and import the owner's CSS.
   - Do not edit the output to look different. The CSS is the design.
4. **Import** `../../base.css` and `./<Name>.css` at the top of the component, in that order. `npm run check:css` fails when your CSS reads a token that only another component declares. Import that component's CSS, or move the token, as `css-owners.json` settles it.
5. **Export** it from its library's `index.ts`.
6. **Test** it in `<Name>.test.tsx`: its role and name, what its Accessibility line promises (keys, focus, what a screen reader hears) and its states.
7. **Write `<Name>.stories.tsx`**: one story per state the README names, plus a `Playground` with its props as controls (Button is the example). Run `npm run test:visual`. A new story fails once, since it has no baseline yet; it writes one, so look at both themes' images in `.snapshots` (local, git-ignored). axe must pass.
8. **Match the reference.** `npm run test:visual` draws the reference preview of your component and the port, and fails on any pixel that differs; `test-results/` holds ref.png, port.png and diff.png. If the test is skipped because the preview also draws a part not ported yet, the component isn't done: port that part too. `npm run parity` (localhost:5199/?c=<Name>) shows the same pair side by side for looking.
9. **Run `npm run check`.**

## Done means

- `e2e/parity.spec.ts` passes for it, not skipped, in dark and light: the port is the design to the pixel.
- `npm run check` passes.
- `node scripts/css-split.mjs --coverage` shows nothing left for this component.
- The README's Accessibility line is covered by a test.
- Every state has a story, its baselines are written locally, and axe passes on each.

## Upstream defects

Fix a defect in the reference here only when the fix draws the same thing, and say so in the component README's "Differs from the design" section. The section goes when a new version carries the fix. A README states the component's contract: what it is, its props and states, its behaviour and its Accessibility line. Who decided what, and when, stays out of it; `npm run check:provenance` fails on a person's name, the private design folder's name, or a date or version recording when something was decided, and `node scripts/check-provenance.mjs --fix` strips the dated and versioned asides a README copied from the design brings with it. When a new Sakuga version lands, the port moves to it in one commit: `design.json`, the component READMEs, and whatever the change log says changed. Then `node scripts/check-components.mjs --write` fills the component list (`docs/components.json`) from the READMEs, so every component carries its README's version; `npm run check` fails while the two disagree. Each component's doc comment carries the same version on its `@version` line: change it with the README, and `npm run check:docs` fails while it differs, or while any export or prop has no doc.

**A version move tests only what it touches.** Run the unit tests and stories of the components the change log names, never the whole repository: `npm test -- src/ui/List src/anicanonkit/StoryMap` and `npm run test:visual -- --grep "/list|storymap/i"`. A change to a shared token or a `src/internal/` helper touches every component that reads it, so those are tested too. The whole-repo checks that take seconds still run: `check:public`, `typecheck`, `check:layers`, `check:reference`, `check:components`, `check:docs`, `build`, `check:css` and `check:treeshake`. The full `npm test` and `npm run test:visual` are not part of a version move.

## Not ported

These stay native on phones, where the platform draws them in its own language. The web package leaves them out.

- **TabBar**'s glass capsule (its default form): phone-only. Sheet is ported: the phone web's bottom panel, as its README draws it on the web, with no swipe gesture of its own. TabBar's web form (`variant="web"`, the phone browser's solid bar) is ported, and so is SegmentedControl's `media`, the old glass surface under its web name.
- **Glass**: every `glass` variant (`IconButton`, the shared `sk-glass`), and `PromptComposer variant="media"`, the phone's glass dock over the take (`sk-composer--media`). That is phone chrome floating over the page.
- **Android-only** parts and boards.

`e2e/parity.spec.ts` hides these on both sides of a pair, so a preview that shows one beside the parts we do port still compares the rest to the pixel.

## How the port reads the design

- **Thumb develops every picture in.** Every frame develops in once as it arrives, so the `develop` prop adds nothing; it stays so older pages that pass it still work. Not a defect: the port draws it as the bundle does.
- **The web `<Sakuga>` takes the app's translator, `t`.** Design systems differ here (React Aria, MUI and Polaris ship their own translations; Carbon takes the app's `translateWithId`). The portal keeps every word in i18next, so the port asks `t` first, then `messages`, then the English. The design README's Words section still names only `locale` and `messages`.
- **Tokens the design files under another component's label** (the design's `bundle.css` puts `--more-wrap-*`, `--drop-remove-*` and `--character-card-portrait-stage-max-height` inside the `/* Thumb */` block). `scripts/css-owners.json` settles them to MoreWrap, DropZone and CharacterCard (`--more-wrap-on-art-size` to LookPlate, the one rule that reads it).
- **MoreWrap is a core part.** The design draws the same ⋯ on MediaCard, a core component, as on CastCard, LookPlate and ProductionNav's production. The core never imports AniCanonKit, so MoreWrap lives in `src/ui/MoreWrap`, unexported, and `check:layers` names it as a part the kit may import.
- **The pick outline belongs to Monitor.** The design draws `.sk-pick` from a helper Monitor and CanvasStage share. `scripts/css-owners.json` gives it to Monitor, whose CSS CanvasStage already loads, and the helper is `src/anicanonkit/Monitor/pick.tsx`.
