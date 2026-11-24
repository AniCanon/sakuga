import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Dialog } from '../ui/Dialog/Dialog';
import { NumberField } from '../ui/NumberField/NumberField';
import { Sakuga } from '../ui/Sakuga';
import { messages } from './allWords';
import { wordsOf } from './words';

afterEach(cleanup);

describe('words', () => {
  it('says a key in English with its values; a key the app leaves out keeps its English', () => {
    const tx = wordsOf('en', null, null, messages);
    expect(tx('stepOf', { n: 2, total: 5, name: 'Cast' })).toBe('Step 2 of 5: Cast');
    expect(tx('close')).toBe(messages.close);
    expect(wordsOf('pt-BR', { close: 'Fechar' }, null, messages)('back')).toBe('Back');
  });

  it('chooses a plural by the locale’s rules (pt-BR counts 0 as one), and English rules for an English fallback', () => {
    const pt = wordsOf('pt-BR', { results: { one: '{count} resultado', other: '{count} resultados' } }, null, messages);
    expect(pt('results', { count: 1 })).toBe('1 resultado');
    expect(pt('results', { count: 0 })).toBe('0 resultado');
    expect(pt('results', { count: 2 })).toBe('2 resultados');
    expect(pt('seconds', { count: 1 })).toBe('1 second');
    expect(wordsOf('en', null, null, messages)('results', { count: 3 })).toBe('3 results');
  });

  it('formats numbers in a message and joins lists through listAnd, in the locale', () => {
    const pt = wordsOf('pt-BR', { listAnd: '{list} e {last}', pageOf: 'Página {n} de {total}' }, null, messages);
    expect(pt('pageOf', { n: 1, total: 2481 })).toBe('Página 1 de 2.481');
    expect(pt.list(['Kiko', 'Smith', 'Ken'])).toBe('Kiko, Smith e Ken');
    expect(wordsOf('en', null, null, messages).list(['Kiko', 'Smith', 'Ken'])).toBe('Kiko, Smith and Ken');
    expect(wordsOf('en', null, null, messages).list(['Kiko'])).toBe('Kiko');
    expect(pt.num(1.5)).toBe('1,5');
  });

  it('a message can be a function of its values', () => {
    expect(wordsOf('en', { removeItem: (v) => 'Take ' + v.name + ' out' })('removeItem', { name: 'rain' })).toBe('Take rain out');
  });

  it('<Sakuga locale messages> gives every component its words; a prop’s own label still wins', () => {
    const { rerender } = render(<Sakuga icons="" locale="pt-BR" messages={{ close: 'Fechar' }}><Dialog open title="Elenco" onClose={() => undefined} /></Sakuga>);
    expect(screen.getByRole('button', { name: 'Fechar' })).toBeTruthy();
    rerender(<Sakuga icons="" locale="pt-BR" messages={{ close: 'Sair' }}><Dialog open title="Elenco" onClose={() => undefined} /></Sakuga>);
    expect(screen.getByRole('button', { name: 'Sair' })).toBeTruthy();
  });

  it('an app’s own translator is asked first, with numbers formatted in the locale and count left a number for its plurals', () => {
    const seen: Record<string, string | number>[] = [];
    /* as i18next answers: its words for a key it has, the key itself for one it hasn't */
    const pt: Record<string, string> = { pageOf: 'Página {{n}} de {{total}}', results_one: '{{count}} resultado', results_other: '{{count}} resultados' };
    const t = (key: string, values: Record<string, string | number>) => {
      seen.push(values);
      const k = key === 'results' ? (values.count === 1 ? 'results_one' : 'results_other') : key;
      return pt[k] ? pt[k].replace(/\{\{(\w+)\}\}/g, (_a, x: string) => String(values[x])) : key;
    };
    const tx = wordsOf('pt-BR', { close: 'Fechar' }, t, messages);
    expect(tx('pageOf', { n: 1, total: 2481 })).toBe('Página 1 de 2.481');
    expect(seen[0]).toEqual({ n: '1', total: '2.481' });
    expect(tx('results', { count: 1 })).toBe('1 resultado');
    expect(seen[1]).toEqual({ count: 1 });
    expect(tx('close')).toBe('Fechar');
    expect(tx('back')).toBe('Back');
    expect(wordsOf('en', null, () => undefined)('removeItem', { name: null })).toBe('Remove ');
  });

  it('<Sakuga t> gives every component its words, and a new translator re-renders them', () => {
    const { rerender } = render(<Sakuga icons="" locale="pt-BR" t={(key) => (key === 'close' ? 'Fechar' : key)}><Dialog open title="Elenco" onClose={() => undefined} /></Sakuga>);
    expect(screen.getByRole('button', { name: 'Fechar' })).toBeTruthy();
    rerender(<Sakuga icons="" locale="pt-BR" t={(key) => (key === 'close' ? 'Sair' : key)}><Dialog open title="Elenco" onClose={() => undefined} /></Sakuga>);
    expect(screen.getByRole('button', { name: 'Sair' })).toBeTruthy();
  });

  it('NumberField shows a number in the locale and, where decimals take a comma, reads a typed point as grouping', () => {
    const onChange = vi.fn();
    render(<Sakuga icons="" locale="pt-BR"><NumberField label="Blur" value={1.5} unit="px" onChange={onChange} /></Sakuga>);
    const input = screen.getByRole('spinbutton') as HTMLInputElement;
    expect(input.value).toBe('1,5px');
    fireEvent.input(input, { target: { value: '2.481' } });
    fireEvent.blur(input);
    expect(onChange).toHaveBeenLastCalledWith(2481);
  });
});
