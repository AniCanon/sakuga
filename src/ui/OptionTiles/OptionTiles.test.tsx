import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { OptionTiles, type TileOption } from './OptionTiles';

afterEach(cleanup);

const shots: TileOption[] = [{ value: 'Auto', label: 'Auto', icon: 'auto' }, { value: 'Close-up', label: 'Close-up', icon: 'shot-closeup' }, { value: 'Medium', label: 'Medium', icon: 'shot-medium', disabled: true }, { value: 'Wide', label: 'Wide', icon: 'shot-wide' }];

function One({ start = 'Close-up', onChange }: { start?: string; onChange?: (v: string) => void }) {
  const [v, set] = useState(start);
  return <OptionTiles label="Shot type" value={v} options={shots} onChange={(x) => { set(x); onChange?.(x); }} help={{ title: 'How close the camera is.', text: 'Examples: close-up, wide.' }} note="Fills the frame with the face." />;
}

describe('OptionTiles', () => {
  it('with one choice is a radio group named by the label’s words alone, each tile a radio, checked when chosen, icons hidden', () => {
    const { container } = render(<One />);
    const g = screen.getByRole('radiogroup', { name: 'Shot type' });
    expect(g.className).toBe('sk-tiles');
    expect(g.style.gridTemplateColumns).toBe('repeat(4, minmax(0, 1fr))');
    expect(screen.getByRole('radio', { name: 'Close-up', checked: true })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'About Shot type' })).toBeTruthy();
    container.querySelectorAll('.sk-tile svg').forEach((s) => expect(s.getAttribute('aria-hidden')).toBe('true'));
    expect(screen.getByText('Fills the frame with the face.').className).toBe('sk-field__note');
  });

  it('is one Tab stop, on the chosen tile, else the first', () => {
    render(<><One /><OptionTiles ariaLabel="Angle" value="" options={shots} /></>);
    /* The disabled tile is out of the tab order by being disabled */
    expect(screen.getAllByRole('radio').slice(0, 4).map((r) => ((r as HTMLButtonElement).disabled ? 'off' : r.tabIndex))).toEqual([-1, 0, 'off', -1]);
    expect(screen.getByRole('radiogroup', { name: 'Angle' }).querySelectorAll<HTMLElement>('.sk-tile')[0].tabIndex).toBe(0);
  });

  it('the arrows move to a tile and choose it, skipping a disabled one; Home and End go to either end', () => {
    const changed = vi.fn();
    render(<One onChange={changed} />);
    const close = screen.getByRole('radio', { name: 'Close-up' });
    close.focus();
    fireEvent.keyDown(close, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'Wide', checked: true }));
    fireEvent.keyDown(document.activeElement!, { key: 'Home' });
    fireEvent.keyDown(document.activeElement!, { key: 'End' });
    expect(changed.mock.calls.map((c) => c[0])).toEqual(['Wide', 'Auto', 'Wide']);
  });

  it('with multiple each tile is a toggle button Tab reaches, pressed when chosen', () => {
    const changed = vi.fn();
    render(<OptionTiles label="Effects" multiple value={['Rain']} onChange={changed} options={[{ value: 'Rain', label: 'Rain', icon: 'effect-rain' }, { value: 'Fog', label: 'Fog', icon: 'effect-fog' }]} />);
    expect(screen.getByRole('group', { name: 'Effects' })).toBeTruthy();
    const rain = screen.getByRole('button', { name: 'Rain', pressed: true }), fog = screen.getByRole('button', { name: 'Fog', pressed: false });
    expect([rain.tabIndex, fog.tabIndex]).toEqual([0, 0]);
    fireEvent.click(fog);
    expect(changed).toHaveBeenCalledWith('Fog');
    expect(document.querySelector('.sk-glide')).toBeNull();
  });

  it('large tiles read the badge, the amount and cost with their labels, the description and the footnote, the art hidden', () => {
    render(
      <OptionTiles size="lg" label="Pack" value="bloom" options={[
        { value: 'spark', label: 'Spark', image: 'spark.png', amount: '4,990', description: '$4.99 · never expires' },
        { value: 'bloom', label: 'Bloom', badge: 'Best value', amount: { value: '24,990', mark: <i aria-hidden="true" />, label: 'fragments' }, cost: '~10 a second', description: 'For a season', footnote: 'Taxes may apply' },
      ]} />,
    );
    expect(screen.getByRole('radio', { name: /^Best value\s*Bloom\s*24,990 fragments\s*For a season\s*~10 a second\s*Taxes may apply$/ })).toBeTruthy();
    const spark = screen.getByRole('radio', { name: /^Spark/ });
    expect(spark.className).toBe('sk-tile sk-tile--lg has-image');
    expect(spark.querySelector('.sk-tile__art')!.getAttribute('aria-hidden')).toBe('true');
    expect(spark.querySelector('.sk-tile__top')).toBeNull();
    expect(screen.getByRole('radiogroup').className).toBe('sk-tiles sk-tiles--lg');
  });

  it('a disabled option dims and cannot be chosen; one column of large tiles sets them as rows', () => {
    const changed = vi.fn();
    render(<OptionTiles size="lg" columns={1} label="Plan" value="creator" onChange={changed} options={[{ value: 'creator', label: 'Creator' }, { value: 'studio', label: 'Studio', disabled: true, badge: 'Coming soon' }]} />);
    const studio = screen.getByRole('radio', { name: /Studio/ }) as HTMLButtonElement;
    expect(studio.disabled).toBe(true);
    fireEvent.click(studio);
    expect(changed).not.toHaveBeenCalled();
    expect(screen.getByRole('radiogroup').className).toBe('sk-tiles sk-tiles--lg sk-tiles--rows');
  });

  it('art="fill" marks large tiles for a scene picture across the top, in a grid and in one column; small tiles ignore it', () => {
    const scene = [{ value: 'people', label: 'People', image: 'people.webp', description: 'Human bodies and faces.' }];
    const { rerender } = render(<OptionTiles size="lg" art="fill" label="Who lives in it" value="people" options={scene} />);
    expect(screen.getByRole('radiogroup').className).toBe('sk-tiles sk-tiles--lg sk-tiles--fill');
    expect(screen.getByRole('radio', { name: /^People/ }).querySelector('.sk-tile__art')!.getAttribute('aria-hidden')).toBe('true');
    rerender(<OptionTiles size="lg" art="fill" columns={1} label="Who lives in it" value="people" options={scene} />);
    expect(screen.getByRole('radiogroup').className).toBe('sk-tiles sk-tiles--lg sk-tiles--rows sk-tiles--fill');
    rerender(<OptionTiles art="fill" label="Who lives in it" value="people" options={scene} />);
    expect(screen.getByRole('radiogroup').className).toBe('sk-tiles');
  });

  it('imagePosition sets where the crop holds the picture, and leaves it unset otherwise', () => {
    render(<OptionTiles size="lg" art="fill" label="Who lives in it" value="people" options={[
      { value: 'people', label: 'People', image: 'people.webp' },
      { value: 'creatures', label: 'Creatures', image: 'creatures.webp', imagePosition: '30% 0%' },
    ]} />);
    const img = (name: RegExp) => screen.getByRole('radio', { name }).querySelector('img')!;
    expect(img(/^Creatures/).style.objectPosition).toBe('30% 0%');
    expect(img(/^People/).getAttribute('style')).toBeNull();
  });

  it('large tiles with href or onClick are ways in: a group of links (a button for onClick alone), no chosen state, no value needed', () => {
    const go = vi.fn();
    render(<OptionTiles label="Create in EBA" size="lg" columns={5} options={[
      { value: '', label: 'Episode', icon: 'play', description: 'Widescreen story, scene by scene', href: '/episodes/new' },
      { value: '', label: 'Character', icon: 'users', description: 'A face, a body, outfits, a voice', onClick: go },
    ]} />);
    expect(screen.queryByRole('radiogroup')).toBeNull();
    const g = screen.getByRole('group', { name: 'Create in EBA' });
    expect(g.style.gridTemplateColumns).toBe('repeat(5, minmax(0, 1fr))');
    const ep = within(g).getByRole('link', { name: /^Episode/ });
    expect(ep.getAttribute('href')).toBe('/episodes/new');
    expect(ep.className).toBe('sk-tile sk-tile--lg');
    expect(ep.getAttribute('aria-checked')).toBeNull();
    const ch = within(g).getByRole('button', { name: /^Character/ });
    expect(ch.getAttribute('type')).toBe('button');
    fireEvent.click(ch);
    expect(go).toHaveBeenCalledTimes(1);
    expect(g.querySelectorAll('[role="radio"]')).toHaveLength(0);
  });
});
