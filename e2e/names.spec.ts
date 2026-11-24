import { expect, test } from '@playwright/test';

/* What a screen reader hears, exactly, in a real browser: jsdom joins inline parts without the spaces a browser computes, so the
   unit tests cannot pin these names down. */
const cases: { story: string; role: 'button' | 'heading'; name: string }[] = [
  { story: 'sakuga--actions--button--trailing', role: 'button', name: 'Subscribe $4 a month' },
  { story: 'anicanonkit--fragments--spendbutton--sizes', role: 'button', name: 'Generate ~100 fragments' },
  { story: 'anicanonkit--fragments--spendbutton--sizes', role: 'button', name: 'Retake ~10 fragments' },
  { story: 'sakuga--navigation--sectionheader--group', role: 'heading', name: 'The Guild 4' },
];

for (const c of cases) {
  test(`${c.story} names "${c.name}"`, async ({ page }) => {
    await page.goto(`/?story=${c.story}&mode=preview`);
    await page.waitForSelector('html[data-storyloaded]');
    await expect(page.getByRole(c.role, { name: c.name, exact: true })).toHaveCount(1);
  });
}
