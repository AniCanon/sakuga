import { readFileSync } from 'node:fs';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CharacterCard } from './CharacterCard';

afterEach(cleanup);

describe('CharacterCard', () => {
  it('is a complementary region named by name; the silhouette is hidden', () => {
    const { container } = render(<CharacterCard name="Kiko" role="Leads the E.R.A." stage={{ kind: 'icon', icon: 'body-average' }} note="This card fills in as you go." />);
    const card = screen.getByRole('complementary', { name: 'Kiko' });
    expect(card.tagName).toBe('ASIDE');
    expect(card.className).toBe('sk-ccard');
    expect(container.querySelector('.sk-ccard__silhouette')!.getAttribute('aria-hidden')).toBe('true');
    expect(card.querySelector('.sk-ccard__role')!.textContent).toBe('Leads the E.R.A.');
    expect(card.querySelector('.sk-ccard__name')!.textContent).toBe('Kiko');
    expect(card.querySelector('.sk-ccard__note')!.textContent).toBe('This card fills in as you go.');
    expect(screen.queryByRole('img')).toBeNull();
  });

  it('without a name it is "Character"; with no stage it draws the characters silhouette', () => {
    const { container } = render(<CharacterCard name="" />);
    expect(screen.getByRole('complementary', { name: 'Character' })).toBeTruthy();
    expect(container.querySelector('.sk-ccard__silhouette svg')).toBeTruthy();
  });

  it('a portrait’s alt is stage.alt or the name', () => {
    const { rerender } = render(<CharacterCard name="Kiko" stage={{ kind: 'portrait', image: 'kiko.jpg' }} className="mine" />);
    expect(screen.getByRole('img', { name: 'Kiko' }).className).toBe('sk-ccard__portrait');
    expect(screen.getByRole('complementary').className).toBe('sk-ccard sk-ccard--portrait mine');
    rerender(<CharacterCard name="Kiko" stage={{ kind: 'portrait', image: 'kiko.jpg', alt: 'Kiko in her coat' }} />);
    expect(screen.getByRole('img', { name: 'Kiko in her coat' })).toBeTruthy();
  });

  it('an avatar’s alt is stage.alt, empty (so hidden) by default', () => {
    const { container, rerender } = render(<CharacterCard name="Kiko" stage={{ kind: 'avatar', image: 'kiko.jpg' }} />);
    expect(container.querySelector('img.sk-ccard__avatar')!.getAttribute('alt')).toBe('');
    expect(screen.queryByRole('img')).toBeNull();
    rerender(<CharacterCard name="Kiko" stage={{ kind: 'avatar', image: 'kiko.jpg', alt: 'Kiko' }} />);
    expect(screen.getByRole('img', { name: 'Kiko' }).className).toBe('sk-ccard__avatar');
  });

  it('stats and traits read as text', () => {
    const { container } = render(<CharacterCard name="Kiko" stats={[{ icon: 'gender-female', value: 'Female', label: 'Gender' }]} traits={[{ icon: 'trait-calm', label: 'Calm' }, { icon: 'trait-bold', label: 'Bold' }]} />);
    expect(container.querySelector('.sk-cstats')!.textContent).toBe('FemaleGender');
    expect([...container.querySelectorAll('.sk-ccard__trait')].map((t) => t.textContent)).toEqual(['Calm', 'Bold']);
  });

  it('the voice’s play button is named for it, and with onSeek its waveform is a slider', () => {
    const onToggle = vi.fn();
    render(<CharacterCard name="Aiko" voice={{ duration: 6, onToggle, onSeek: () => undefined }} />);
    const play = screen.getByRole('button', { name: 'Play Aiko’s voice' });
    fireEvent.click(play);
    expect(onToggle).toHaveBeenCalledWith(true);
    expect(screen.getByRole('slider')).toBeTruthy();
  });

  it('without onSeek the voice has no slider', () => {
    render(<CharacterCard name="Aiko" voice={{ duration: 6 }} />);
    expect(screen.getByRole('button', { name: 'Play Aiko’s voice' })).toBeTruthy();
    expect(screen.queryByRole('slider')).toBeNull();
  });

  it('a creature portrait stage is 16:9; a character\'s is 9:16', () => {
    const { container } = render(<CharacterCard name="Kitten" stage={{ kind: 'portrait', image: 'k.png', creature: true }} />);
    expect(container.querySelector('aside')!.className).toBe('sk-ccard sk-ccard--portrait sk-ccard--creature');
    const css = readFileSync('src/anicanonkit/CharacterCard/CharacterCard.css', 'utf8');
    expect(css).toContain('.sk-ccard--creature .sk-ccard__stage{aspect-ratio:var(--ratio-creature)}');
  });

  it('an avatar stage with imageStyle follows a Cropper: the picture is seen through the square being chosen', () => {
    render(<CharacterCard name="Hana" stage={{ kind: 'avatar', image: 'sheet.png', imageStyle: 'width:493.827%' }} />);
    const cut = document.querySelector<HTMLElement>('.sk-ccard__stage .sk-ccard__avatar.sk-cut')!;
    expect(cut.querySelector('img')!.style.width).toBe('493.827%');
  });
});
