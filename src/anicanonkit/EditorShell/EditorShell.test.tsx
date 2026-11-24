import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { EditorShell } from './EditorShell';

afterEach(cleanup);

function shell(focus?: boolean) {
  return render(
    <EditorShell height={480} focus={focus} className="x">
      <nav slot="nav" aria-label="Views"><a href="#a">Rail</a></nav>
      <span slot="header"><button type="button">Header</button></span>
      <span slot="tool"><button type="button">Tool</button></span>
      <button type="button">Centre</button>
      <span slot="inspector"><button type="button">Inspector</button></span>
      <span slot="float"><button type="button">Float</button></span>
      <span slot="overlay"><div role="dialog" aria-label="Over" /></span>
    </EditorShell>,
  );
}

describe('EditorShell', () => {
  it('lays its slots out in Tab order: nav, header, tool, centre, inspector; the overlay last', () => {
    const { container } = shell();
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toBe('sk-editor x');
    expect(root.style.height).toBe('480px');
    expect([...root.querySelectorAll('button, a')].map((b) => b.textContent)).toEqual(['Rail', 'Header', 'Tool', 'Centre', 'Inspector']);
    expect(root.querySelector('.sk-editor__tool')!.textContent).toBe('Tool');
    expect(root.querySelector('.sk-editor__center')!.textContent).toBe('Centre');
    expect(root.lastElementChild!.getAttribute('role')).toBe('dialog');
    expect(root.querySelector('.sk-editor__float')).toBeNull();
    expect(root.getAttribute('tabindex')).toBeNull();
  });

  it('the inspector is a complementary region named Inspector by default, or by inspectorLabel', () => {
    const { rerender } = render(<EditorShell />);
    expect(screen.getByRole('complementary', { name: 'Inspector' }).className).toBe('sk-editor__inspector');
    rerender(<EditorShell inspectorLabel="Cut 2C" />);
    expect(screen.getByRole('complementary', { name: 'Cut 2C' })).toBeTruthy();
  });

  it('focus mode draws the float slot, and without height the shell sets none', () => {
    const { container } = shell(true);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toBe('sk-editor is-focus x');
    expect(root.querySelector('.sk-editor__float')!.textContent).toBe('Float');
    cleanup();
    const plain = render(<EditorShell />);
    expect(plain.container.firstElementChild!.getAttribute('style')).toBeNull();
  });
});

describe('EditorShell focus bars', () => {
  it('shows them as focus starts, fades them after 2 s still, and wakes them on the next move', () => {
    vi.useFakeTimers();
    const { container } = render(<EditorShell focus><span slot="float"><button type="button">Leave focus</button></span><p>centre</p></EditorShell>);
    const shell = container.querySelector('.sk-editor')!, float = container.querySelector('.sk-editor__float')!;
    expect(float.classList.contains('is-asleep')).toBe(false);
    fireEvent.pointerMove(shell);
    act(() => { vi.advanceTimersByTime(2000); });
    expect(float.classList.contains('is-asleep')).toBe(true);
    fireEvent.pointerMove(shell);
    expect(float.classList.contains('is-asleep')).toBe(false);
    vi.useRealTimers();
  });

  it('never fades them while focus is inside', () => {
    vi.useFakeTimers();
    const { container, getByRole } = render(<EditorShell focus><span slot="float"><button type="button">Leave focus</button></span><p>centre</p></EditorShell>);
    act(() => { getByRole('button', { name: 'Leave focus' }).focus(); });
    act(() => { vi.advanceTimersByTime(2500); });
    expect(container.querySelector('.sk-editor__float')!.classList.contains('is-asleep')).toBe(false);
    vi.useRealTimers();
  });

  it('runs the timeline under the panels, across the whole width, only when it is passed', () => {
    const { container, rerender } = render(<EditorShell><span slot="timeline">tracks</span></EditorShell>);
    const timeline = container.querySelector('.sk-editor__col > .sk-editor__timeline');
    expect(timeline?.textContent).toBe('tracks');
    expect(timeline?.previousElementSibling?.className).toBe('sk-editor__body');
    rerender(<EditorShell />);
    expect(container.querySelector('.sk-editor__timeline')).toBeNull();
  });

  it('resizes a pane by its handle between the min and max tokens, by keys and by drag, and reports each width', () => {
    const real = window.getComputedStyle;
    const vars: Record<string, string> = { '--editor-tool-min-width': '280px', '--editor-tool-max-width': '520px', '--editor-inspector-min-width': '260px', '--editor-inspector-max-width': '460px' };
    vi.spyOn(window, 'getComputedStyle').mockImplementation((el) => { const c = real(el); return { ...c, getPropertyValue: (n: string) => vars[n] ?? c.getPropertyValue(n) } as CSSStyleDeclaration; });
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) { return parseFloat(this.style.width) || 312; });
    const onResize = vi.fn();
    const { container } = render(
      <EditorShell onResize={onResize} inspectorWidth={300}>
        <span slot="tool">Tool</span>
        <span slot="inspector">Inspector</span>
      </EditorShell>,
    );
    const tool = screen.getByRole('separator', { name: 'Resize the tool panel' }), insp = screen.getByRole('separator', { name: 'Resize the inspector' });
    expect(tool.getAttribute('aria-orientation')).toBe('vertical');
    expect(insp.getAttribute('aria-valuenow')).toBe('300');
    fireEvent.keyDown(tool, { key: 'ArrowRight' });
    expect(onResize).toHaveBeenLastCalledWith('tool', 328);
    fireEvent.keyDown(tool, { key: 'ArrowRight', shiftKey: true });
    expect(onResize).toHaveBeenLastCalledWith('tool', 392);
    fireEvent.keyDown(tool, { key: 'End' });
    expect(onResize).toHaveBeenLastCalledWith('tool', 520);
    fireEvent.keyDown(tool, { key: 'Home' });
    expect(onResize).toHaveBeenLastCalledWith('tool', 280);
    expect((container.querySelector('.sk-editor__tool') as HTMLElement).style.width).toBe('280px');
    /* The inspector sits right of its handle: Left widens it */
    fireEvent.keyDown(insp, { key: 'ArrowLeft' });
    expect(onResize).toHaveBeenLastCalledWith('inspector', 316);
    /* jsdom has no PointerEvent: a MouseEvent of that type carries the button and position */
    const pointer = (type: string, x: number) => act(() => { insp.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, button: 0, clientX: x })); });
    pointer('pointerdown', 900);
    expect(container.firstElementChild!.classList.contains('is-resizing')).toBe(true);
    pointer('pointermove', 700);
    expect(onResize).toHaveBeenLastCalledWith('inspector', 460);
    pointer('pointerup', 700);
    expect(container.firstElementChild!.classList.contains('is-resizing')).toBe(false);
    vi.restoreAllMocks();
  });

  it('draws no handle beside a pane with nothing in it', () => {
    render(<EditorShell><span slot="tool">Tool</span></EditorShell>);
    expect(screen.getAllByRole('separator').map((s) => s.getAttribute('aria-label'))).toEqual(['Resize the tool panel']);
  });
});

