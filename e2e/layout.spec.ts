import { expect, test } from '@playwright/test';

test('segmentedcontrol indicator follows selection and container resizing', async ({ page }) => {
  await page.goto('/?story=sakuga--actions--segmentedcontrol--full-width&mode=preview');
  await page.waitForSelector('html[data-storyloaded]', { state: 'attached' });
  await page.evaluate(() => document.fonts.ready);
  await page.getByRole('button', { name: 'World', exact: true }).click();
  const delta = () => page.evaluate(() => {
    const selected = document.querySelector('button[aria-pressed="true"]')!.getBoundingClientRect();
    const glide = document.querySelector('.sk-glide')!.getBoundingClientRect();
    return Math.max(Math.abs(selected.left - glide.left), Math.abs(selected.width - glide.width));
  });
  await expect.poll(delta).toBeLessThan(1);
  await page.setViewportSize({ width: 300, height: 640 });
  await expect.poll(delta).toBeLessThan(1);
});

test('timeline markers remeasure after a container resize without a React update', async ({ page }) => {
  await page.goto('/?story=sakuga--media--timeline--markers&mode=preview');
  await page.waitForSelector('html[data-storyloaded]', { state: 'attached' });
  await page.evaluate(() => document.fonts.ready);
  const flag = page.locator('.sk-tl__flag').nth(1);
  const before = await flag.evaluate(el => parseFloat((el as HTMLElement).style.maxWidth));
  await page.locator('.sk-tl').evaluate(el => { (el.parentElement as HTMLElement).style.width = '400px'; });
  await expect.poll(() => flag.evaluate(el => parseFloat((el as HTMLElement).style.maxWidth))).toBeLessThan(before);
});
