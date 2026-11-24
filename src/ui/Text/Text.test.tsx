import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Text } from './Text';

afterEach(cleanup);

describe('Text', () => {
  it('renders display and titles as headings, at their levels', () => {
    render(<><Text variant="display">Kiko</Text><Text variant="title-1">One</Text><Text variant="title-2">Two</Text><Text variant="title-3">Three</Text><Text variant="title-4">Four</Text></>);
    expect(screen.getByRole('heading', { name: 'Kiko', level: 1 }).className).toBe('sk-text sk-text--display');
    expect(screen.getByRole('heading', { name: 'One', level: 1 })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Two', level: 2 })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Three', level: 3 })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Four', level: 3 })).toBeTruthy();
  });

  it('renders lead, body and caption as paragraphs, the rest as spans', () => {
    const { container } = render(<><Text variant="lead">a</Text><Text variant="body">b</Text><Text variant="caption">c</Text><Text variant="label">d</Text><Text variant="small">e</Text><Text variant="micro">f</Text><Text variant="eyebrow">g</Text><Text>h</Text></>);
    expect([...container.children].map((e) => e.tagName)).toEqual(['P', 'P', 'P', 'SPAN', 'SPAN', 'SPAN', 'SPAN', 'SPAN']);
  });

  it('is never focusable', () => {
    render(<Text variant="body">Words</Text>);
    expect(screen.getByText('Words').tabIndex).toBe(-1);
  });

  it('draws mark as highlighted text, with its kind', () => {
    render(<><Text mark>flagged</Text><Text mark="stated">said</Text><Text mark="inferred">implied</Text></>);
    expect(screen.getByText('flagged').tagName).toBe('MARK');
    expect(screen.getByText('flagged').className).toBe('sk-text is-mark');
    expect(screen.getByText('said').className).toBe('sk-text is-mark is-mark--stated');
    expect(screen.getByText('implied').className).toBe('sk-text is-mark is-mark--inferred');
  });

  it('lets as set the element, and tone change only the colour', () => {
    render(<Text variant="title-2" as="p" tone="accent" numeric id="t">0+00</Text>);
    const t = screen.getByText('0+00');
    expect(t.tagName).toBe('P');
    expect(t.id).toBe('t');
    expect(t.className).toBe('sk-text sk-text--title-2 is-accent is-numeric');
  });
});
