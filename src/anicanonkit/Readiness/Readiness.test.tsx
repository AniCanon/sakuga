import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Readiness, type ReadinessProps } from './Readiness';

afterEach(cleanup);

const items: ReadinessProps['items'] = [
  { label: '6 looks', detail: '1 waiting on you', state: 'attention' },
  { label: 'Voice cast', detail: 'Shounen Hero' },
  { label: 'No props' },
];

describe('Readiness', () => {
  it('is a list named Ready by default, or by label, and nothing in it is focusable', () => {
    const { container, rerender } = render(<Readiness items={items} />);
    const list = screen.getByRole('list', { name: 'Ready' });
    expect(list.tagName).toBe('UL');
    expect(list.className).toBe('sk-ready');
    expect(container.querySelectorAll('button, a, [tabindex]')).toHaveLength(0);
    rerender(<Readiness items={items} label="Kiko is ready with" className="mine" />);
    expect(screen.getByRole('list', { name: 'Kiko is ready with' }).className).toBe('sk-ready mine');
  });

  it('reads each item as its label, then ready or waiting for you, then its detail; the mark is hidden', () => {
    render(<Readiness items={items} />);
    const [looks, voice, props] = screen.getAllByRole('listitem');
    expect(looks.className).toBe('sk-ready__item is-attention');
    expect(looks.textContent).toBe('6 looks, waiting for you1 waiting on you');
    expect(voice.className).toBe('sk-ready__item');
    expect(voice.textContent).toBe('Voice cast, readyShounen Hero');
    expect(props.textContent).toBe('No props, ready');
    expect(props.querySelector('small')).toBeNull();
    expect(looks.querySelector('.sk-ready__mark')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('a mark settles in only when its item changes, not on arrival', () => {
    const { rerender } = render(<Readiness items={[{ label: 'Looks', state: 'attention' }, { label: 'Voice' }]} />);
    const marks = () => [...document.querySelectorAll('.sk-ready__mark')].map((m) => m.classList.contains('is-fresh'));
    expect(marks()).toEqual([false, false]);
    rerender(<Readiness items={[{ label: 'Looks' }, { label: 'Voice' }]} />);
    expect(marks()).toEqual([true, false]);
  });
});
