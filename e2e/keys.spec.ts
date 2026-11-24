import { expect, test, type Page } from '@playwright/test';

/* What a keyboard and the system's own settings get, in a real browser: jsdom has no Tab, no forced colours and no reduced motion,
   so the unit tests can only read the markup and the CSS text. Here Tab is pressed and the styles are the computed ones. */

async function story(page: Page, id: string) {
  await page.goto(`/?story=${id}&mode=preview`);
  await page.waitForSelector('html[data-storyloaded]', { state: 'attached' });
  await page.evaluate(() => document.fonts.ready);
}

/* Tab from the top of the story until focus leaves it: each stop by the name a screen reader starts from */
async function tabOrder(page: Page) {
  await page.evaluate(() => { (document.activeElement as HTMLElement | null)?.blur(); });
  const stops: string[] = [];
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Tab');
    const at = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || !el.closest('[data-sk-story]')) return null;
      const by = el.getAttribute('aria-labelledby');
      const named = el.getAttribute('aria-label') || (by && by.split(' ').map((id) => document.getElementById(id)?.textContent || '').join(' ')) || el.getAttribute('title') || el.textContent || el.getAttribute('placeholder') || '';
      return (el.getAttribute('role') || el.tagName.toLowerCase()) + ' ' + named.replace(/\s+/g, ' ').trim();
    });
    if (at === null) break;
    stops.push(at);
  }
  return stops;
}

/* Each order is the one the component's README promises, read in the story's own data (items without href are buttons). AudioPlayer
   is the bundle's: its play button comes before the title's actions, though the README puts the actions first. */
const orders: { story: string; stops: string[] }[] = [
  { story: 'sakuga--navigation--topnav--actions', stops: ['button Home', 'button Series', 'button Shorts', 'button Manga', 'button Creators', 'button Notifications, 3 unread', 'button Search', 'button Your account, Aiko Mori'] },
  { story: 'sakuga--navigation--sidenav--footer', stops: ['button Home', 'button Studio', 'button Cut', 'button Characters', 'button Places', 'button Invite a writer', 'button Your account, Raul Menezes'] },
  {
    story: 'anicanonkit--productions--productionnav--expanded',
    stops: ['button Episodes', 'button Script5 scenes', 'button Plan22 cuts', 'button Make3 to review', 'button Cut6:40', 'button Screen', 'button Publish',
      'button #1 Toddy’s bedroomIn the cut', 'button #2 Smith’s apartment2 to review', 'button #3 The stairsIn the cut', 'button Fragments balance: 9,427'],
  },
  {
    story: 'anicanonkit--productions--productionnav--collapsed',
    stops: ['button Back to productions', 'button Script · 5 scenes', 'button Plan · 22 cuts', 'button Make · 3 to review', 'button Cut · 6:40', 'button Screen', 'button Publish',
      'button Media', 'button Effects', 'button Audio', 'button Captions', 'button Fragments balance: 9,427'],
  },
  /* Previous is off on the first page, so Tab passes it */
  { story: 'sakuga--navigation--pagination--counted', stops: ['button Page 1', 'button Page 2', 'button Next page'] },
  { story: 'sakuga--media--audioplayer--titled', stops: ['button Play His voice', 'button Recast', 'slider Position in His voice'] },
  /* Send waits for words: with some in the field it is a stop */
  { story: 'anicanonkit--maki--makicomposer--typing', stops: ['textarea Message to Maki', 'button Attach', 'button Send'] },
  {
    story: 'anicanonkit--maki--makipanel--chat',
    /* What waits, Close, the conversation (a log the keyboard scrolls), its card's pair, then the composer; Send waits for words */
    stops: ['button 2 to look at', 'button Close Maki', 'log Conversation with Maki', 'button Reject', 'button Accept', 'textarea Message to Maki', 'button Attach'],
  },
  { story: 'anicanonkit--productions--promptcomposer--writing', stops: ['textbox Prompt', 'button Opening frame', 'button Generate~100 fragments'] },
];

for (const o of orders) {
  test(`${o.story}: Tab order`, async ({ page }) => {
    await story(page, o.story);
    expect(await tabOrder(page)).toEqual(o.stops);
  });
}

/* A system colour as the browser resolves it, to compare a computed style against */
const system = (page: Page, name: string) => page.evaluate((n) => {
  const probe = document.createElement('i');
  probe.style.color = n;
  document.body.append(probe);
  const c = getComputedStyle(probe).color;
  probe.remove();
  return c;
}, name);

test.describe('in forced colours', () => {
  test.use({ colorScheme: 'dark' });
  test.beforeEach(async ({ page }) => { await page.emulateMedia({ forcedColors: 'active' }); });

  test('a SegmentedControl hides its glide and draws the chosen segment in Highlight, inside a ButtonText edge', async ({ page }) => {
    await story(page, 'sakuga--actions--segmentedcontrol--values');
    const seg = page.locator('.sk-seg').first();
    expect(await seg.locator(':scope > .sk-glide').evaluate((g) => getComputedStyle(g).display)).toBe('none');
    const on = seg.locator('button[aria-pressed="true"]');
    expect(await on.evaluate((b) => getComputedStyle(b).backgroundColor)).toBe(await system(page, 'Highlight'));
    expect(await seg.evaluate((s) => [getComputedStyle(s).outlineStyle, getComputedStyle(s).outlineColor])).toEqual(['solid', await system(page, 'ButtonText')]);
  });

  test('a lifted Timeline track and its drop line take Highlight', async ({ page }) => {
    await story(page, 'sakuga--media--timeline--moving');
    const hl = await system(page, 'Highlight');
    expect(await page.locator('.sk-tl__row.is-lifted').evaluate((r) => [getComputedStyle(r).outlineStyle, getComputedStyle(r).outlineColor])).toEqual(['solid', hl]);
    expect(await page.locator('.sk-tl__drop').evaluate((d) => getComputedStyle(d).borderTopColor)).toBe(hl);
  });

  test('a text field keeps a ButtonText edge, and its focus is a Highlight outline', async ({ page }) => {
    await story(page, 'sakuga--forms--textfield--filled');
    const f = page.locator('.sk-tf__control').first();
    expect(await f.evaluate((el) => [getComputedStyle(el).outlineStyle, getComputedStyle(el).outlineColor])).toEqual(['solid', await system(page, 'ButtonText')]);
    await page.keyboard.press('Tab');
    expect(await f.evaluate((el) => el === document.activeElement && getComputedStyle(el).outlineColor)).toBe(await system(page, 'Highlight'));
  });

  test('a removable Chip is drawn chosen, in Highlight', async ({ page }) => {
    await story(page, 'sakuga--actions--chip--removable');
    expect(await page.locator('.sk-chip.is-removable').first().evaluate((c) => getComputedStyle(c).backgroundColor)).toBe(await system(page, 'Highlight'));
  });
});

test('under reduced motion a move becomes a short fade: a segment\'s transition is the reduced duration, and a press does not sink', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await story(page, 'sakuga--actions--segmentedcontrol--values');
  const b = page.locator('.sk-seg button').first();
  const [duration, reduced] = await b.evaluate((el) => [getComputedStyle(el).transitionDuration, getComputedStyle(document.documentElement).getPropertyValue('--motion-instant').trim()]);
  const sec = (v: string) => (v.endsWith('ms') ? parseFloat(v) / 1000 : parseFloat(v));
  expect(duration.split(', ').map(sec)).toEqual(duration.split(', ').map(() => sec(reduced)));
  const box = await b.boundingBox();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  expect(await b.evaluate((el) => getComputedStyle(el).transform)).toBe('none');
  await page.mouse.up();
});

test('in EditorShell focus the Monitor\'s corner labels step aside while the floating bars show, and come back when they sleep', async ({ page }) => {
  await story(page, 'anicanonkit--productions--editorshell--focus');
  const hud = page.locator('.sk-monitor__hud').first();
  await expect.poll(() => hud.evaluate((el) => getComputedStyle(el).opacity)).toBe('0');
  const box = await page.locator('.sk-monitor').first().boundingBox();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height - 20);
  await expect(page.locator('.sk-editor__float')).toHaveClass(/is-asleep/, { timeout: 4000 });
  await expect.poll(() => hud.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
  await page.mouse.move(box!.x + box!.width / 2 + 10, box!.y + box!.height - 30);
  await expect.poll(() => hud.evaluate((el) => getComputedStyle(el).opacity)).toBe('0');
});

test('MakiComposer: the first press of @, in a field never focused, puts an @ in it and opens who to mention', async ({ page }) => {
  await story(page, 'anicanonkit--maki--makipanel--rich');
  const field = page.locator('.sk-mk-composer [contenteditable]');
  await expect(field).not.toBeFocused();
  await page.getByRole('button', { name: 'Mention someone or something' }).click();
  await expect(field).toHaveText('@');
  await expect(page.locator('.sk-composer__menu')).toBeVisible();
  // After a word it puts a space first, so the @ starts a mention of its own
  await page.keyboard.press('Escape');
  await page.keyboard.press('Backspace');
  await page.keyboard.type('Why does');
  await page.getByRole('button', { name: 'Mention someone or something' }).click();
  await expect(field).toHaveText('Why does @');
  await expect(page.locator('.sk-composer__menu')).toBeVisible();
});
