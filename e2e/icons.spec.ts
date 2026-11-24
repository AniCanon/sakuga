import { expect, test } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const original = execFileSync(process.execPath, ['--input-type=module', '-e', `
  import { readIconSource } from './scripts/icon-source.mjs';
  console.log('<svg xmlns="http://www.w3.org/2000/svg">' + readIconSource().symbols.join('') + '</svg>');
`], { encoding: 'utf8' });
const optimized = readFileSync('src/icons/icons.svg', 'utf8');
const names = [...original.matchAll(/<symbol id="([^"]+)"/g)].map(m => m[1]);

// Compare every symbol against its source, not an updated golden screenshot. Real external <use>
// rendering covers viewBoxes, inherited currentColor and configurable stroke widths together.
for (const density of [1, 2]) test.describe(`${density}x display`, () => {
  test.use({ deviceScaleFactor: density });
  for (const size of [16, 24, 48]) for (const stroke of [1, 2, 3]) for (const dark of [false, true]) {
    test(`icons preserve pixels at ${size}px, stroke ${stroke}, ${dark ? 'dark' : 'light'}`, async ({ page }) => {
      await page.route('http://sakuga-icons.test/**', route => {
        const path = new URL(route.request().url()).pathname;
        return route.fulfill({ contentType: path.endsWith('.svg') ? 'image/svg+xml' : 'text/html',
          body: path === '/original.svg' ? original : path === '/optimized.svg' ? optimized : '<html><body></body></html>' });
      });
      const shots: PNG[] = [];
      for (const source of ['original', 'optimized']) {
        await page.goto('http://sakuga-icons.test/');
        await page.setContent(`<body style="margin:0;background:${dark ? '#111' : '#fff'};color:${dark ? '#eee' : '#274469'}"><div id="icons" style="display:grid;grid-template-columns:repeat(16,64px);width:1024px">${names.map(name => `<div style="width:64px;height:64px;display:grid;place-items:center"><svg style="--icon-stroke-width:${stroke}" width="${size}" height="${size}"><use href="http://sakuga-icons.test/${source}.svg#${name}"/></svg></div>`).join('')}</div></body>`);
        await page.waitForFunction(() => [...document.querySelectorAll('use')].every(el => el.getBBox().width > 0));
        shots.push(PNG.sync.read(await page.locator('#icons').screenshot()));
      }
      const [before, after] = shots;
      expect([after.width, after.height]).toEqual([before.width, before.height]);
      const changed = names.filter((_, i) => {
        const x = (i % 16) * 64 * density, y = Math.floor(i / 16) * 64 * density;
        for (let row = y; row < y + 64 * density; row++) {
          const start = (row * before.width + x) * 4, end = start + 64 * density * 4;
          if (!before.data.subarray(start, end).equals(after.data.subarray(start, end))) return true;
        }
        return false;
      });
      expect(changed, 'Icons with changed pixels').toEqual([]);
      expect(pixelmatch(before.data, after.data, null, before.width, before.height, { threshold: 0, includeAA: true })).toBe(0);
    });
  }

});
