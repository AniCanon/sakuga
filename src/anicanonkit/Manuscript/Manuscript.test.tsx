import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ManuscriptSection } from '../ManuscriptSection/ManuscriptSection';
import { Manuscript } from './Manuscript';

afterEach(cleanup);

describe('Manuscript', () => {
  it('is a region named by label (default "Script")', () => {
    const { rerender } = render(<Manuscript><ManuscriptSection number={1}>A</ManuscriptSection></Manuscript>);
    expect(screen.getByRole('region', { name: 'Script' }).className).toBe('sk-manuscript');
    rerender(<Manuscript label="The Winter script" className="x"><ManuscriptSection number={1}>A</ManuscriptSection></Manuscript>);
    expect(screen.getByRole('region', { name: 'The Winter script' }).className).toBe('sk-manuscript x');
  });

  it('its toolbar, sections and footer read and take focus in order; no keyboard handling of its own', () => {
    const { container } = render(
      <Manuscript>
        <span slot="toolbar"><button type="button">Block</button></span>
        <ManuscriptSection number={3}>A</ManuscriptSection>
        <ManuscriptSection number={4} current>B</ManuscriptSection>
        <span slot="footer"><button type="button">Saved</button></span>
      </Manuscript>,
    );
    const r = screen.getByRole('region');
    expect([...r.children].map((c) => c.className || c.tagName)).toEqual(['sk-manuscript__tools', 'sk-manuscript__body', 'BUTTON']);
    expect(r.querySelectorAll('.sk-manuscript__body .sk-msec')).toHaveLength(2);
    expect(screen.getAllByRole('button').map((b) => b.textContent)).toEqual(['Block', 'Saved']);
    expect(r.getAttribute('tabindex')).toBeNull();
    expect(container.querySelector('[onkeydown]')).toBeNull();
  });

  it('draws no toolbar when the slot is empty', () => {
    const { container } = render(<Manuscript>Body</Manuscript>);
    expect(container.querySelector('.sk-manuscript__tools')).toBeNull();
  });

  it('its body is a Tab stop, a group named "Scenes", only while it scrolls; when everything fits it is no stop', () => {
    const fits = render(<Manuscript>Words</Manuscript>);
    const still = fits.container.querySelector<HTMLElement>('.sk-manuscript__body')!;
    expect(still.hasAttribute('tabindex')).toBe(false);
    expect(still.getAttribute('role')).toBeNull();
    fits.unmount();
    // jsdom lays nothing out: a body whose words run past its height is what scrolls
    const tall = vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockImplementation(function (this: HTMLElement) { return this.classList.contains('sk-manuscript__body') ? 900 : 0; });
    const box = vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(function (this: HTMLElement) { return this.classList.contains('sk-manuscript__body') ? 400 : 0; });
    render(<Manuscript>Words</Manuscript>);
    const body = screen.getByRole('group', { name: 'Scenes' });
    expect(body.tabIndex).toBe(0);
    expect(body.className).toContain('sk-manuscript__body');
    tall.mockRestore();
    box.mockRestore();
  });
});
