import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { VoiceTiles, type VoiceTilesProps } from './VoiceTiles';

afterEach(cleanup);

const options: VoiceTilesProps['options'] = [
  { label: 'Shounen Hero', description: 'Bright, determined' },
  { label: 'Cool', description: 'Low, unhurried' },
  { label: 'Gruff Mentor', value: 'mentor' },
];

function Cast({ onChange }: { onChange?: (v: string) => void }) {
  const [v, set] = useState('Shounen Hero');
  return <VoiceTiles label="Archetype" value={v} options={options} onChange={(x) => { set(x); onChange?.(x); }} />;
}

describe('VoiceTiles', () => {
  it('is a radio group named by label, five columns by default', () => {
    render(<VoiceTiles label="Archetype" options={options} />);
    const g = screen.getByRole('radiogroup', { name: 'Archetype' });
    expect(g.className).toBe('sk-voices');
    expect(g.style.gridTemplateColumns).toBe('repeat(5, minmax(0, 1fr))');
  });

  it('each voice is a radio read by its name and description, checked when chosen; the play mark is hidden', () => {
    render(<VoiceTiles label="Archetype" value="Cool" options={options} columns={3} />);
    const radios = screen.getAllByRole('radio');
    expect(radios.map((r) => r.textContent)).toEqual(['Shounen HeroBright, determined', 'CoolLow, unhurried', 'Gruff Mentor']);
    expect(radios.map((r) => r.getAttribute('aria-checked'))).toEqual(['false', 'true', 'false']);
    expect(radios[0].querySelector('.sk-voice__play')!.getAttribute('aria-hidden')).toBe('true');
    expect(screen.getByRole('radiogroup').style.gridTemplateColumns).toBe('repeat(3, minmax(0, 1fr))');
  });

  it('silent tiles draw no play mark and still read and choose the same', () => {
    render(<VoiceTiles label="Archetype" value="Cool" options={options} silent />);
    const radios = screen.getAllByRole('radio');
    expect(radios.map((r) => r.querySelector('.sk-voice__play'))).toEqual([null, null, null]);
    expect(radios.map((r) => r.textContent)).toEqual(['Shounen HeroBright, determined', 'CoolLow, unhurried', 'Gruff Mentor']);
    expect(radios[1].getAttribute('aria-checked')).toBe('true');
  });

  it('one Tab stop, on the chosen voice', () => {
    render(<Cast />);
    const radios = screen.getAllByRole('radio');
    expect(radios.map((r) => r.tabIndex)).toEqual([0, -1, -1]);
  });

  it('arrows move to a voice and choose it through onChange; a press chooses it too', () => {
    const onChange = vi.fn();
    render(<Cast onChange={onChange} />);
    const radios = screen.getAllByRole('radio');
    radios[0].focus();
    fireEvent.keyDown(radios[0], { key: 'ArrowRight' });
    expect(document.activeElement).toBe(radios[1]);
    expect(onChange).toHaveBeenLastCalledWith('Cool');
    expect(radios[1].getAttribute('aria-checked')).toBe('true');
    fireEvent.keyDown(radios[1], { key: 'End' });
    expect(onChange).toHaveBeenLastCalledWith('mentor');
    fireEvent.click(radios[0]);
    expect(onChange).toHaveBeenLastCalledWith('Shounen Hero');
  });
});
