import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { EntityRow } from '../EntityRow/EntityRow';
import { PanelSection } from './PanelSection';

afterEach(cleanup);

describe('PanelSection', () => {
  it('the label and its count are a level-3 heading, then the rows and the footer in order; not focusable', () => {
    const { container } = render(
      <PanelSection label="Changes" count={3}>
        <EntityRow visual={{ kind: 'place' }} name="Sé station" after="Burning" />
        <span slot="footer">Two more in Ep 4</span>
      </PanelSection>,
    );
    const s = container.firstElementChild!;
    expect(s.tagName).toBe('SECTION');
    expect(s.className).toBe('sk-psec');
    expect(screen.getByRole('heading', { level: 3, name: 'Changes 3' }).className).toBe('sk-psec__label');
    expect(s.querySelector('.sk-psec__body .sk-erow')).toBeTruthy();
    expect(s.textContent).toBe('Changes3Sé stationBurningTwo more in Ep 4');
    expect(s.querySelectorAll('[tabindex], button')).toHaveLength(0);
  });

  it('draws no count when it is left out or empty', () => {
    const { container } = render(<><PanelSection label="A">x</PanelSection><PanelSection label="B" count="">y</PanelSection></>);
    expect(container.querySelectorAll('.sk-psec__label span')).toHaveLength(0);
  });
});
