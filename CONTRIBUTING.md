# Contributing to Sakuga

Sakuga is the design system AniCanon™ is built with. AniCanon's team runs it: we review every change and decide what merges. Everything is MIT licensed, so if you want to take Sakuga somewhere else, fork it and make it yours.

## What this repo is

This repository is code only: the components, tokens, icons, fonts, documentation and tests. AniCanon™'s design files, the screenshots its visual tests compare against and the sample art its stories use are private, and are never committed. `.design/` and `.snapshots/` are git-ignored for that reason, and `npm run check:public` (also a pre-commit hook the repo installs on `npm install`, and a GitHub Actions workflow on every push and pull request) fails on any tracked image, audio or video that is not Sakuga's own, on anything under those folders, and on private links or hosts. Do not add files to its allowlist to get a check to pass.

Without those private files you can still:

- read and change the source, and run `npm ci`, `npm run typecheck`, `npm test` (the one test that compares icons against the references skips) and `npm run build`;
- run `npm run check:public`, `npm run check:layers`, `npm run check:docs`, `npm run check:components`, `npm run check:css` and `npm run check:treeshake`.

The checks that compare components against the references (`check:reference`, `test:visual`, `test:sound`, `parity`, `ladle`) skip with a message when the reference files are absent; maintainers have them next to their checkout. Open your pull request anyway: the team runs them before merging, and tells you what they find. Visual baselines are not shared either; if you have the reference files, `npm run test:visual:update` writes your own into `.snapshots/`.

## Bug fixes

Bug fixes are always welcome. Open a pull request that:

- says what's broken and how to see it;
- fixes one thing;
- for anything visual, shows it in the light and dark themes, before and after.

## New components

New components come on request. Open an issue before you build one: say what you're making and why the existing components don't cover it. Sakuga grows with AniCanon, so a component that doesn't fit AniCanon may not ship, however well it's built.

## What every change keeps

- **Tokens only.** Components read their own component tokens, which alias semantic tokens. A component never uses a raw colour, size or duration.
- **Both themes.** Check light and dark, and a `[data-theme]` section of one inside a page of the other.
- **Reduced motion.** With reduced motion on, every move becomes a 100 ms fade, or nothing.
- **Accessible names.** A button with only an icon still has a label a screen reader says. Anything you can tap is at least 44 px.
- **The principles.** The art leads. One accent, used small. Flat colour, with a scrim as the only gradient. An action is named, never shown as a sparkle.

## Sign your commits

Sakuga uses the [Developer Certificate of Origin 1.1](https://developercertificate.org/) and no contributor licence agreement. Signing off a commit certifies that you wrote the change, or have the right to submit it, under the project's licence:

```bash
git commit -s
```

That adds a line with your name and email to the commit message: `Signed-off-by: Your Name <you@example.com>`. Pull requests with unsigned commits can't be merged.

## Code of conduct

Everyone taking part in Sakuga's spaces follows our [code of conduct](CODE_OF_CONDUCT.md).

## Licence

By contributing, you agree that your contribution is licensed under the MIT licence, like the rest of Sakuga.
