import { expect, test, type Page } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

/* The design's own preview of each ported component, drawn once by Sakuga Version 221's bundle and once by the port, must be the
   same picture to the pixel, in both themes. The screenshot baselines in stories.spec.ts catch change; this catches difference
   from the design. A preview that still draws a part not ported yet is skipped, and says which. */
const exported = (file: string) => [...readFileSync(file, 'utf8').matchAll(/export \{ ([A-Z]\w*)/g)].map((m) => m[1]);
const ported = [...exported('src/ui/index.ts'), ...exported('src/anicanonkit/index.ts')].filter((n) => n !== 'Sakuga'); // <Sakuga> sets up the app; the design has no preview of it

async function draw(page: Page, side: 'ref' | 'port', name: string, theme: string) {
  await page.goto(`http://localhost:5199/frame.html?side=${side}&c=${name}&theme=${theme}`);
  await page.waitForFunction(() => document.getElementById('root')?.childElementCount || document.body.textContent?.startsWith('No preview'));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => [...document.querySelectorAll('svg.sk-icon use')].filter((u) => u.closest('svg')!.checkVisibility()).every((u) => (u as SVGGraphicsElement).getBBox().width > 0));
  /* What stays native on phones (docs/PORTING.md · Not ported) is hidden on both sides, keeping its place */
  await page.addStyleTag({ content: '[class*="--glass"]:not(.sk-seg--glass),.sk-glass,.sk-tabbar:not(.is-web),.sk-composer--media{visibility:hidden!important}' });
  await page.evaluate(() => Promise.all([...document.images].map((i) => i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; }))));
  await page.waitForTimeout(400);
  /* SMIL (the Loader's bounce) is not a CSS animation, so animations: 'disabled' leaves it running: both sides hold it at its first drawing */
  await page.evaluate(() => document.querySelectorAll('svg').forEach((s) => { s.pauseAnimations(); s.setCurrentTime(0); }));
  return page;
}

/* A picture can be redrawn sharper a moment after it first paints, so a side is shot until two shots in a row are the same */
async function settled(page: Page) {
  let last = await page.locator('#root').screenshot({ animations: 'disabled' });
  for (let i = 0; i < 8; i++) {
    await page.waitForTimeout(150);
    const next = await page.locator('#root').screenshot({ animations: 'disabled' });
    if (next.equals(last)) return PNG.sync.read(next);
    last = next;
  }
  return PNG.sync.read(last);
}

for (const name of ported) {
  for (const theme of ['dark', 'light'] as const) {
    test(`${name} · ${theme} matches Version 221`, async ({ page }) => {
      await draw(page, 'port', name, theme);
      const body = (await page.textContent('body')) ?? '';
      test.skip(body.startsWith('No preview'), `${name} has no preview in Version 221`);
      const gaps = [...body.matchAll(/(Sakuga|AniCanonKit)\.(\w+) not ported/g)].map((m) => m[2]);
      test.skip(gaps.length > 0, `its preview also draws ${[...new Set(gaps)].join(', ')}, not ported yet`);
      const port = await settled(page);
      await draw(page, 'ref', name, theme);
      const ref = await settled(page);

      expect({ width: port.width, height: port.height }, 'the port is a different size').toEqual({ width: ref.width, height: ref.height });
      const diff = new PNG({ width: ref.width, height: ref.height });
      const changed = pixelmatch(ref.data, port.data, diff.data, ref.width, ref.height, { threshold: 0 });
      if (changed) {
        const dir = test.info().outputPath();
        mkdirSync(dir, { recursive: true });
        writeFileSync(`${dir}/ref.png`, PNG.sync.write(ref));
        writeFileSync(`${dir}/port.png`, PNG.sync.write(port));
        writeFileSync(`${dir}/diff.png`, PNG.sync.write(diff));
      }
      expect(changed, `${changed} pixels differ from the design; see ref.png, port.png and diff.png in test-results`).toBe(0);
    });
  }
}

/* At 1x a line's end is a pixel or two, so a cap drawn square where the design rounds it (an icon's own stroked path) can pass.
   The icon set, which every component draws from, is compared again at 2x. */
test.describe('at 2x', () => {
  test.use({ deviceScaleFactor: 2 });
  for (const theme of ['dark', 'light'] as const) {
    test(`Icon · ${theme} @2x matches Version 221`, async ({ page }) => {
      await draw(page, 'port', 'Icon', theme);
      const port = await settled(page);
      await draw(page, 'ref', 'Icon', theme);
      const ref = await settled(page);
      expect({ width: port.width, height: port.height }).toEqual({ width: ref.width, height: ref.height });
      const changed = pixelmatch(ref.data, port.data, null, ref.width, ref.height, { threshold: 0 });
      expect(changed, `${changed} pixels differ from the design at 2x`).toBe(0);
    });
  }
});
