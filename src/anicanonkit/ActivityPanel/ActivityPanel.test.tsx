import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ActivityPanel, type ActivityPanelProps } from './ActivityPanel';

beforeEach(() => {
  /* jsdom lays nothing out: every control counts as shown, as it would on a page */
  vi.spyOn(Element.prototype, 'getClientRects').mockReturnValue([{}] as unknown as DOMRectList);
  vi.spyOn(document, 'hasFocus').mockReturnValue(true);
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

const groups: ActivityPanelProps['groups'] = [
  { title: 'Running · 1', jobs: [{ initial: 'T', title: 'Tattoo · new character', text: 'Designing the look', progress: 55, time: '0:31' }] },
  { title: 'Needs you', jobs: [{ image: 'smith.jpg', title: 'Smith · new look', text: 'Ready for your review', action: { label: 'Review', primary: true } }, { title: 'Ken · voice', text: 'Done', time: '2m' }] },
];

function Shown() {
  const [open, set] = useState(false);
  return (
    <>
      <button type="button" onClick={() => set(true)}>Activity</button>
      {open && <ActivityPanel groups={groups} onClose={() => set(false)} />}
    </>
  );
}

describe('ActivityPanel', () => {
  it('is a dialog named Activity with a head, the groups as eyebrows and a row per job', () => {
    const { container } = render(<ActivityPanel groups={groups} />);
    const d = screen.getByRole('dialog', { name: 'Activity' });
    expect(d.className).toBe('sk-activity');
    expect(d.querySelector('.sk-activity__head b')!.textContent).toBe('Activity');
    expect([...container.querySelectorAll('.sk-activity__group')].map((p) => p.textContent)).toEqual(['Running · 1', 'Needs you']);
    expect(container.querySelectorAll('.sk-job')).toHaveLength(3);
    expect(screen.getByRole('button', { name: 'Close activity' })).toBeTruthy();
  });

  it('a job: its picture or a hidden initial, title and text, an action button, else its time', () => {
    const { container } = render(<ActivityPanel groups={groups} />);
    const [t, s, k] = [...container.querySelectorAll('.sk-job')];
    expect(t.querySelector('span.sk-job__av')!.getAttribute('aria-hidden')).toBe('true');
    expect(t.querySelector('.sk-job__av')!.textContent).toBe('T');
    expect(t.querySelector('.sk-job__time')!.textContent).toBe('0:31');
    expect(s.querySelector('img.sk-job__av')!.getAttribute('alt')).toBe('');
    expect(s.querySelector('.sk-job__time')).toBeNull();
    const review = screen.getByRole('button', { name: 'Review' });
    expect(review.className).toContain('sk-btn--primary');
    expect(review.className).toContain('sk-btn--sm');
    expect(k.querySelector('.sk-job__av')!.textContent).toBe('?');
  });

  it('each job’s progress is a progress bar named by its title', () => {
    render(<ActivityPanel groups={groups} />);
    const bar = screen.getByRole('progressbar', { name: 'Tattoo · new character' });
    expect(bar.getAttribute('aria-valuenow')).toBe('55');
    expect(bar.className).toContain('sk-job__bar');
    expect(screen.getAllByRole('progressbar')).toHaveLength(1);
  });

  it('without onClose it does not take focus', () => {
    const opener = document.createElement('button');
    document.body.append(opener);
    opener.focus();
    render(<ActivityPanel groups={groups} />);
    expect(document.activeElement).toBe(opener);
    opener.remove();
  });

  it('with onClose focus moves to the first job’s action; Tab and Shift+Tab stay inside', () => {
    render(<Shown />);
    const opener = screen.getByRole('button', { name: 'Activity' });
    opener.focus();
    fireEvent.click(opener);
    const review = screen.getByRole('button', { name: 'Review' }), close = screen.getByRole('button', { name: 'Close activity' });
    expect(document.activeElement).toBe(review);
    fireEvent.keyDown(review, { key: 'Tab' });
    expect(document.activeElement).toBe(close);
    fireEvent.keyDown(close, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(review);
  });

  it('Escape runs onClose and focus goes back', () => {
    render(<Shown />);
    const opener = screen.getByRole('button', { name: 'Activity' });
    opener.focus();
    fireEvent.click(opener);
    fireEvent.keyDown(screen.getByRole('button', { name: 'Review' }), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(opener);
  });

  it('"Close activity" runs onClose and focus goes back', () => {
    render(<Shown />);
    const opener = screen.getByRole('button', { name: 'Activity' });
    opener.focus();
    fireEvent.click(opener);
    fireEvent.click(screen.getByRole('button', { name: 'Close activity' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(opener);
  });

  it('takes className and style', () => {
    render(<ActivityPanel groups={[]} className="mine" style={{ width: 320 }} />);
    const d = screen.getByRole('dialog', { name: 'Activity' });
    expect(d.className).toBe('sk-activity mine');
    expect(d.style.width).toBe('320px');
  });

  it('a job with href opens its screen: its face and words are one link, and a chevron says it goes somewhere', () => {
    const onClick = vi.fn();
    render(<ActivityPanel groups={[{ title: 'Running · 2', jobs: [
      { figure: 'age-adult', title: 'Tattoo · new character', text: 'Designing the look', href: '/s/eba/characters/new?character=t' },
      { image: 'lyra.jpg', title: 'Lyra · new look', text: 'Rendering the portrait', onClick },
    ] }]} />);
    const link = screen.getByRole('link', { name: /Tattoo · new character/ });
    expect(link.getAttribute('href')).toBe('/s/eba/characters/new?character=t');
    expect(link.querySelector('.sk-job__av--figure svg')).not.toBeNull();
    expect(link.closest('.sk-job')!.querySelector('.sk-job__chev')).not.toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Lyra · new look/ }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('an action stays its own button beside the link, and the row shows no chevron; a job with neither is words only', () => {
    const review = vi.fn();
    render(<ActivityPanel groups={[{ title: 'Needs you', jobs: [
      { initial: 'S', title: 'Smith · new look', text: 'Ready for your review', href: '/s/eba/characters/smith', action: { label: 'Review', primary: true, onClick: review } },
      { initial: 'K', title: 'Ken · voice', text: 'Done', time: '2m' },
    ] }]} />);
    const row = screen.getByRole('link', { name: /Smith · new look/ }).closest('.sk-job')!;
    expect(row.querySelector('.sk-job__chev')).toBeNull();
    expect(screen.getByRole('link', { name: /Smith/ }).contains(screen.getByRole('button', { name: 'Review' }))).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: 'Review' }));
    expect(review).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('link', { name: /Ken/ })).toBeNull();
    expect(screen.getByText('Ken · voice').closest('.sk-job')!.className).toBe('sk-job');
  });

  it('a take’s or a place’s picture is a 16:9 frame, its kind’s figure before it lands; held reads after the time as fragments held', () => {
    const { container } = render(<ActivityPanel groups={[{ title: 'Running · 2', jobs: [
      { title: 'Last train · still', text: 'Rendering · Kiko at Red Line', shape: 'frame', figure: 'image', progress: 40, time: '0:42', held: '63', href: '/s/eba/studio' },
      { title: 'Sé station · new view', text: 'Drawing Ticket Gate Concourse · 2 of 3', shape: 'frame', image: '/se.jpg', href: '/s/eba/places/se' },
    ] }]} />);
    const [take, place] = [...container.querySelectorAll('.sk-job__av')];
    expect(take.className).toBe('sk-job__av sk-job__av--figure sk-job__av--frame');
    expect(place.className).toBe('sk-job__av sk-job__av--frame');
    const time = container.querySelector('.sk-job__time')!;
    expect(time.textContent).toBe('0:42' + '63 fragments held');
    expect(time.querySelector('.sk-frag__caption')!.textContent).toBe(' held');
  });
});
