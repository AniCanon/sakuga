import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

/* Sound as designed: with sound on, pressing every control in a ported component's design preview must play the same sounds, in
   the same order, with the port as with Version 221's bundle. The audio is a recorder (check/parity/frame.ts, record), so this
   compares what would be heard, not the speakers. A preview that draws an unported part is skipped, as in parity.spec. */
const exported = (file: string) => [...readFileSync(file, 'utf8').matchAll(/export \{ ([A-Z]\w*)/g)].map((m) => m[1]);
const ported = [...exported('src/ui/index.ts'), ...exported('src/anicanonkit/index.ts')].filter((n) => n !== 'Sakuga'); // the app's setup, not a component
const CONTROLS = '#root button, #root a[href], #root [role="switch"], #root [role="checkbox"], #root [role="radio"], #root [role="slider"], #root [role="option"], #root [role="button"]';

async function press(page: Page, side: 'ref' | 'port', name: string) {
  await page.goto(`http://localhost:5199/frame.html?side=${side}&c=${name}&record=1`);
  await page.waitForFunction(() => document.getElementById('root')?.childElementCount || document.body.textContent?.startsWith('No preview'));
  const body = (await page.textContent('body')) ?? '';
  if (body.startsWith('No preview')) return { skip: `${name} has no preview` };
  const gaps = [...body.matchAll(/(Sakuga|AniCanonKit)\.(\w+) not ported/g)].map((m) => m[2]);
  if (gaps.length) return { skip: `its preview also draws ${[...new Set(gaps)].join(', ')}, not ported yet` };
  await page.evaluate(() => (window as unknown as { Sakuga: { sound: { on(): void } } }).Sakuga.sound.on());
  const count = await page.locator(CONTROLS).count();
  for (let i = 0; i < count; i++) {
    const control = page.locator(CONTROLS).nth(i);
    if (!(await control.count()) || !(await control.isVisible()) || !(await control.isEnabled())) continue;
    /* What stays native on phones is not pressed on either side (docs/PORTING.md · Not ported) */
    if (await control.evaluate((el) => !!el.closest('[class*="--glass"]:not(.sk-seg--glass),.sk-glass,.sk-tabbar:not(.is-web),.sk-composer--media'))) continue;
    await control.click({ timeout: 2000, trial: false }).catch(() => undefined);
    /* Past the touch interval, so each press can sound */
    await page.waitForTimeout(160);
  }
  await page.waitForTimeout(300);
  return { sounds: await page.evaluate(() => (window as unknown as { __sounds: string[] }).__sounds) };
}

for (const name of ported) {
  test(`${name} sounds as Version 221 does`, async ({ page }) => {
    const ref = await press(page, 'ref', name);
    test.skip('skip' in ref, String(ref.skip));
    const port = await press(page, 'port', name);
    test.skip('skip' in port, String(port.skip));
    expect(port.sounds, 'the port plays different sounds from the design').toEqual(ref.sounds);
  });
}
