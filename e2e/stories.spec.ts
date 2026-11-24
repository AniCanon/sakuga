import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

/* The story list is read from the build Playwright serves, so a new story is tested without touching this file */
const meta = JSON.parse(readFileSync('build/meta.json', 'utf8')) as { stories: Record<string, unknown> };
const stories = Object.keys(meta.stories);

for (const id of stories) {
  for (const theme of ['dark', 'light'] as const) {
    test(`${id} · ${theme}`, async ({ page }) => {
      await page.goto(`/?story=${id}&mode=preview&theme=${theme}`);
      /* Ladle marks the page once the story's chunk has replaced its loading ring; before that, an entrance (a Popover dropping in)
         has not started, so waiting on the page's animations would not wait for it */
      await page.waitForSelector('html[data-storyloaded]', { state: 'attached' });
      /* The workbench's sound switch is not part of any story */
      await page.addStyleTag({ content: '[data-sk-sound-desk]{display:none!important}' });
      await page.waitForFunction((t) => (document.documentElement.getAttribute('data-theme') ?? 'dark') === t, theme);
      await page.evaluate(() => document.fonts.ready);
      /* Icons come from the sprite: wait until every <use> has drawn */
      await page.waitForFunction(() => [...document.querySelectorAll('svg.sk-icon use')].filter((u) => u.closest('svg')!.checkVisibility()).every((u) => (u as SVGGraphicsElement).getBBox().width > 0));
      /* An entrance (a Notice rising in) must have landed before axe reads its contrast; a loop never ends, so it is not waited for */
      await page.evaluate(() => Promise.all(document.getAnimations().filter((a) => a.effect?.getTiming().iterations !== Infinity).map((a) => a.finished.catch(() => undefined))));

      const axe = await new AxeBuilder({ page }).include('#ladle-root').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      expect(axe.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(' ')).join(', ')})`)).toEqual([]);

      /* SMIL (the Loader's bounce) is not a CSS animation, so animations: 'disabled' leaves it running: hold it at its first drawing */
      await page.evaluate(() => document.querySelectorAll('svg').forEach((s) => { s.pauseAnimations(); s.setCurrentTime(0); }));
      /* A pane that scrolls itself into place (MakiPanel's thread to its end) must have come to rest, or the shot catches it a
         pixel short under load: every scroll offset the same across two frames */
      await page.waitForFunction(
        () =>
          new Promise<boolean>((done) => {
            const offsets = () => [...document.querySelectorAll('*')].filter((e) => e.scrollHeight > e.clientHeight).map((e) => e.scrollTop).join();
            const before = offsets();
            requestAnimationFrame(() => requestAnimationFrame(() => done(offsets() === before)));
          }),
      );
      /* The story alone, not the page around it: a change of a few pixels on a small component is still a change */
      await expect(page.locator('[data-sk-story]')).toHaveScreenshot(`${id}--${theme}.png`);
    });
  }
}
