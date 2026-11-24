// AniCanonKit imports the core through its public entry, as an app does; inside this repo that entry is the core's source, so
// tests, stories and the parity page run one copy of each component. The built package keeps the import, resolved by the app.
// `@design` is the fetched design (scripts/design.mjs): stories draw its sample art and previews.
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export const coreEntry = {
  '@anicanon/sakuga/ui': fileURLToPath(new URL('./src/ui/index.ts', import.meta.url)),
  '@design': fileURLToPath(new URL('./.design', import.meta.url)),
};

export default defineConfig({ resolve: { alias: coreEntry } });
