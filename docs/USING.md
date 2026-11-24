# Using Sakuga in an app

The [README](../README.md) shows how to install Sakuga and start it. This page covers what an app needs to know after that.

## 1. Install

Sakuga is published to GitHub Packages. Point the `@anicanon` scope at it in the app's `.npmrc`:

```ini
@anicanon:registry=https://npm.pkg.github.com
```

Then install it with `npm install @anicanon/sakuga`. It needs React 18 or later.

## 2. The CSS

Import two stylesheets once, at the app's entry:

- `@anicanon/sakuga/tokens.css`: the design tokens, both themes, and the base styles.
- `@anicanon/sakuga/fonts.css`: the fonts.

Each component imports its own CSS, so a page carries the styles of the components it uses and nothing else. Your bundler needs to
keep CSS imports from packages; Vite, webpack and esbuild all do. Never import a component's CSS yourself, and never copy it.

## 3. Themes

Sakuga is dark until a person chooses light. `useTheme()` reads the theme and switches it; the choice is kept and follows into
every open tab.

- `data-theme="light"` or `data-theme="dark"` on any element themes that part of the page alone.
- Surfaces over video or artwork stay dark in both themes, so a picture never sits on a light ground. These are Button's `media`
  variants, `tone="media"` and Sheet's `media`. Use them over pictures, never the theme's own surfaces.

## 4. Words and languages

Every word Sakuga says by itself, such as Close, Done or "3 selected", has a key and an English default. They're listed with
their keys in `SakugaMessages`, in `src/internal/words.ts`.

- Give `<Sakuga>` the app's `locale` and either a translator `t` (react-i18next's `useTranslation('sakuga')`) or a `messages`
  object. Sakuga asks `t` first, then `messages`, then falls back to English.
- Plurals, numbers, dates and lists follow `locale`.
- A component's own label prop always wins over its key. Pass one when the words should name their object ("Remove Silver chain").
- Sakuga never translates the app's words. Titles, options and descriptions arrive already in the person's language.

## 5. Tokens

Style the app with Sakuga's roles (`--bg-surface`, `--text-secondary`, `--border-hairline`, `--accent`), never raw colours or
sizes, so both themes and every later version keep working. A component's own tokens (`--button-gap`) belong to that component:
don't set them from outside.

## 6. Core or AniCanonKit

- **`@anicanon/sakuga/ui`, the core:** controls any product could use. It knows nothing of AniCanon.
- **`@anicanon/sakuga/anicanonkit`:** AniCanon's own parts, such as stories, cast, Maki, manga, the editor and fragments.

A kit component is built only from the core's public parts, so AniCanonKit is never needed to use the core. When both libraries
have a component for the same need, use the kit's in AniCanon: `SpendButton`, not `Button` with a price.

## 7. Versions

- **The package** has a semantic version, like 2.21.0: patch versions fix, minor versions add, and major versions break.
- **Each component** has its own version, like Panel 1.3, which goes up when that component changes. You'll find it in three
  places, and a check keeps all three equal:
  - the `@version` line of its doc comment, which your editor shows on hover;
  - the `Version:` line of its README;
  - the component list.

Before relying on a change, look at the version in the doc comment. A component's README also has its full design notes: when to
use it, its states, and its accessibility in full.

## 8. Accessibility

Every component's Accessibility line, in its doc and its README, says what it promises: its role and name, which keys work, and
what a screen reader hears. Give the names it asks for, such as `label`, `alt` and `title`; a component can't make them up. Those
promises are tested, so the props are what carry them.
