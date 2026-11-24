import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

/* The folder SAKUGA_DESIGN_DIR names keeps the reference files and their baselines (snapshots/); unset, baselines live in .snapshots/ */
const designBaselines = process.env.SAKUGA_DESIGN_DIR ? join(resolve(process.env.SAKUGA_DESIGN_DIR), 'snapshots') : null;

/* The built workbench the story tests read; SAKUGA_STORY_PORT moves it when another Ladle holds 61001 */
const storyPort = Number(process.env.SAKUGA_STORY_PORT) || 61001;

/* stories.spec: every story in both themes, from a production build of the workbench, screenshots against approved baselines and axe.
   parity.spec: every ported component's design preview, the port against Version 221, to the pixel. */
export default defineConfig({
  testDir: 'e2e',
  /* Baselines are never committed: the pictures they compare hold sample art that is not part of this repository. They are read from
     the reference folder's snapshots/, else from a git-ignored .snapshots/ (`npm run test:visual:update` writes your own) */
  snapshotPathTemplate: '{snapshotDir}/{arg}{ext}',
  snapshotDir: designBaselines && existsSync(designBaselines) ? designBaselines : '.snapshots',
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${storyPort}`,
    viewport: { width: 1024, height: 640 },
    deviceScaleFactor: 1,
    /* Pixels are compared exactly, so drawing must not depend on load: rasterize on the CPU, in one thread, the same every run */
    launchOptions: { args: ['--disable-gpu', '--disable-gpu-rasterization', '--num-raster-threads=1', '--disable-partial-raster', '--force-color-profile=srgb'] },
  },
  expect: { toHaveScreenshot: { maxDiffPixels: 0, animations: 'disabled' } },
  webServer: [
    { command: `npm run ladle:build && node_modules/.bin/ladle preview -p ${storyPort}`, url: `http://localhost:${storyPort}/meta.json`, reuseExistingServer: false, timeout: 120_000 },
    /* The parity page: the design's previews, drawn by Version 221 or by the port */
    { command: 'npm run parity', url: 'http://localhost:5199/frame.html', reuseExistingServer: true, timeout: 120_000 },
  ],
});
