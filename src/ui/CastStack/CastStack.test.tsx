import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { CastStack } from './CastStack';

afterEach(cleanup);

const six = [{ name: 'Kiko', image: 'kiko.jpg' }, { name: 'The Professor', image: 'prof.jpg' }, { name: 'Ken' }, { name: 'Lisa' }, { name: 'Smith' }, { name: 'Toddy', initial: 'T' }];

describe('CastStack', () => {
  it('is one image named by every name joined, including those past max, and is not focusable', () => {
    const { container } = render(<CastStack people={six} />);
    const img = screen.getByRole('img', { name: 'Kiko, The Professor, Ken, Lisa, Smith and Toddy' });
    expect(img.className).toBe('sk-caststack');
    expect(img.tabIndex).toBe(-1);
    expect(img.getAttribute('tabindex')).toBeNull();
    const faces = container.querySelectorAll('.sk-caststack__face');
    expect(faces).toHaveLength(5);
    expect(faces[4].className).toBe('sk-caststack__face sk-caststack__more');
    expect(faces[4].textContent).toBe('+2');
  });

  it('a person without a picture shows their initial; each face is sized from size', () => {
    const { container } = render(<CastStack people={[{ name: 'Kiko', image: 'kiko.jpg' }, { name: 'Ken' }, { name: 'Ren', initial: 'R' }]} size={32} />);
    const faces = [...container.querySelectorAll<HTMLElement>('.sk-caststack__face')];
    expect(faces.map((f) => f.textContent)).toEqual(['', 'K', 'R']);
    expect(faces[0].querySelector('img')!.getAttribute('alt')).toBe('');
    expect([faces[1].style.width, faces[1].style.height, faces[1].style.fontSize]).toEqual(['32px', '32px', '13px']);
    expect(screen.getByRole('img', { name: 'Kiko, Ken and Ren' })).toBeTruthy();
  });

  it('one person is named alone; label replaces the names; max sets how many faces', () => {
    render(<><CastStack people={[{ name: 'Kiko' }]} /><CastStack people={six} max={2} label="Everyone in take 3" /></>);
    expect(screen.getByRole('img', { name: 'Kiko' })).toBeTruthy();
    const many = screen.getByRole('img', { name: 'Everyone in take 3' });
    expect(many.querySelectorAll('.sk-caststack__face')).toHaveLength(3);
    expect(many.lastElementChild!.textContent).toBe('+4');
  });
});
