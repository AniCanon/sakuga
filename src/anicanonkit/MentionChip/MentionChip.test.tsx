import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MentionChip } from './MentionChip';

afterEach(cleanup);

describe('MentionChip', () => {
  it('reads as text, its mark first then the note; the picture hidden; not focusable', () => {
    const { container } = render(<MentionChip name="Bruce" note="Winter coat · tired" image="b.jpg" />);
    const chip = container.firstElementChild!;
    expect(chip.tagName).toBe('SPAN');
    expect(chip.className).toBe('sk-mchip is-character');
    expect(chip.textContent).toBe('@Bruce · Winter coat · tired');
    expect(chip.querySelector('img')!.getAttribute('alt')).toBe('');
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('kind sets the mark: # a place, $ a reference, & an object (prop is its old name), an event quoted', () => {
    const { container } = render(<><MentionChip kind="place" name="Harbour" /><MentionChip kind="reference" name="rain-look" /><MentionChip kind="prop" name="The phone" /><MentionChip kind="event" type="twist" name="Fire at Sé" /></>);
    expect([...container.querySelectorAll('b')].map((b) => b.textContent)).toEqual(['#Harbour', '$rain-look', '&The phone', '“Fire at Sé”']);
    expect(container.querySelectorAll('.sk-mchip')[2].className).toBe('sk-mchip is-object');
    expect(container.querySelectorAll('.sk-mchip')[2].querySelector('.sk-mchip__slot .sk-icon')).toBeTruthy();
    expect(container.querySelectorAll('.sk-mchip')[3].querySelector('.sk-mchip__slot svg.sk-glyph')).toBeTruthy();
  });

  it('status is a Badge after it; missing reads missing; a character with no portrait shows its age figure', () => {
    const { container } = render(<><MentionChip name="Genzo" figure="age-adult" status={{ label: 'Dead', variant: 'alert' }} /><MentionChip kind="object" name="The logbook" missing /></>);
    const [genzo, log] = [...container.querySelectorAll('.sk-mchip')];
    expect(genzo.querySelector('.sk-mchip__slot.is-figure .sk-icon')).toBeTruthy();
    expect(genzo.querySelector('.sk-badge')!.textContent).toBe('Dead');
    expect(log.className).toContain('is-missing');
    expect(log.textContent).toContain(', missing');
  });

  it('held as context: a remove button beside the chip, never inside it, named Remove {name}', () => {
    const onRemove = vi.fn();
    const { container } = render(<MentionChip name="Kiko" onRemove={onRemove} />);
    const held = container.querySelector('.sk-mchip-held')!;
    expect(held.querySelector('.sk-mchip button')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Remove Kiko' }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('with href it is a link named the same way; tone media', () => {
    render(<MentionChip name="Aiko" href="/cast/aiko" tone="media" className="x" />);
    const a = screen.getByRole('link', { name: '@Aiko' });
    expect(a.getAttribute('href')).toBe('/cast/aiko');
    expect(a.className).toBe('sk-mchip is-character is-media x');
  });

  it('imageStyle shows the face through the square it will be cut to, beside a Cropper', () => {
    render(<MentionChip name="Hana" image="sheet.png" imageStyle="width:493.827%" />);
    expect(document.querySelector<HTMLImageElement>('.sk-mchip .sk-mchip__face.sk-cut img')!.style.width).toBe('493.827%');
    expect(screen.getByText('@Hana')).toBeTruthy();
  });

  it('with onClick is a button that says what it opens and whether it is open', () => {
    const open = vi.fn();
    const { rerender } = render(<MentionChip name="Kiko" note="casual · Determined" onClick={open} expanded={false} controls="st-cast" label="Kiko, casual, determined. Edit cast" />);
    const chip = screen.getByRole('button', { name: 'Kiko, casual, determined. Edit cast' });
    expect(chip.getAttribute('type')).toBe('button');
    expect(chip.getAttribute('aria-expanded')).toBe('false');
    expect(chip.getAttribute('aria-controls')).toBe('st-cast');
    expect(chip.className).toBe('sk-mchip is-character');
    fireEvent.click(chip);
    expect(open).toHaveBeenCalledOnce();
    rerender(<MentionChip name="Kiko" onClick={open} expanded href="/kiko" />);
    expect(screen.getByRole('button').getAttribute('aria-expanded')).toBe('true');
    expect(screen.queryByRole('link')).toBeNull();
  });
});
