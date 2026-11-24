import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode, type RefObject } from 'react';
import { cx } from '../../internal/cx';
import { useScrollEnds } from '../../internal/scrollEnds';
import { slots } from '../../internal/slots';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import '../../base.css';
import '../../ui/IconButton/IconButton.css';
import './EditorShell.css';

export type EditorPane = 'tool' | 'inspector';

export interface EditorShellProps {
  /** Starting width of the tool pane (px); its handle resizes it between its min and max. */
  toolWidth?: number;
  /** Starting width of the inspector (px); its handle resizes it between its min and max. */
  inspectorWidth?: number;
  /** Called as a pane is resized, to keep its width. */
  onResize?: (pane: EditorPane, width: number) => void;
  /** Slots: nav, header, tool, inspector, timeline (the whole width under the panels), overlay, float (focus mode only). Children are the centre column. */
  height?: number;
  /** Focus mode: the panels fold away, the centre fills, `float` holds the bars that come back on demand. */
  focus?: boolean;
  /** Names the inspector column for screen readers. */
  inspectorLabel?: string;
  /** The centre column (the Monitor and its bar); the other columns go in their slots. */
  children?: ReactNode;
  /** Extra class on the root element. */
  className?: string;
}


/* The production editor: the rail, the tool panel, the monitor over the whole cut and the working timeline, the inspector */
/**
 * EditorShell is the full-screen editor (Cut). Slots: `nav` (the `ProductionNav` rail), `header` (`EditorHeader`), `tool` (the
 * open tool’s panel, 312 px), `inspector` (the selected item, 300 px), `overlay` (a dialog over the editor). Its main content
 * is the centre column: `Monitor`, `MonitorBar`, the `ProgramBar` and the `Timeline`.
 *
 * Not for a production view outside the editor (`ViewHeader`); a full-screen flow that makes one thing step by step
 * (`FlowHeader`); a task over the page (`Dialog`).
 *
 * Accessibility: A layout with no keyboard handling of its own: Tab moves through its slots in order (nav, header, tool,
 * the tool's resize handle, centre, the inspector's resize handle, inspector); each handle is a vertical separator named "Resize
 * the tool panel" or "Resize the inspector" with its width as its value, the inspector is a complementary region named by `inspectorLabel` (default "Inspector"), and
 * EditorHeader's title is a level-1 heading. CanvasStage's selection is a group named by `label` and described by its position
 * and size; with `onBox` it is an application (a "movable item") and one Tab stop where arrows move it and Shift with an arrow
 * resizes it, each change said aloud, and its handles are hidden.
 *
 * @version 1.6
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function EditorShell({ height, focus, inspectorLabel, toolWidth, inspectorWidth, onResize, children, className }: EditorShellProps) {
  const tx = useWords(ownWords);
  const sl = slots(children);
  const toolRef = useRef<HTMLDivElement>(null), inspRef = useRef<HTMLElement>(null);
  const toolEnds = useScrollEnds(toolRef), inspEnds = useScrollEnds(inspRef);
  const [widths, setWidths] = useState<Record<EditorPane, number | null>>({ tool: toolWidth || null, inspector: inspectorWidth || null });
  /* A focusable separator needs its value: each pane's laid-out width and its bounds, read after layout */
  const [range, setRange] = useState<Record<EditorPane, [number, number, number] | null>>({ tool: null, inspector: null });
  useLayoutEffect(() => {
    const read = (pane: EditorPane, el: HTMLElement | null): [number, number, number] | null => {
      if (!el) return null;
      const cs = getComputedStyle(el), v = (n: string) => parseFloat(cs.getPropertyValue(`--editor-${pane}-${n}-width`)) || 0;
      return [Math.round(el.offsetWidth), v('min'), v('max')];
    };
    const next = { tool: read('tool', toolRef.current), inspector: read('inspector', inspRef.current) };
    setRange((o) => (JSON.stringify(o) === JSON.stringify(next) ? o : next));
  });
  /* A pane's width between its min and max (tokens), from a drag on its handle or the arrows; onResize(pane, px) to keep it */
  function grip(pane: EditorPane, ref: RefObject<HTMLElement>, side: 1 | -1) {
    const css = (n: 'min' | 'max') => (ref.current ? parseFloat(getComputedStyle(ref.current).getPropertyValue(`--editor-${pane}-${n}-width`)) || 0 : 0);
    const set = (px: number) => {
      const w = Math.round(Math.min(css('max'), Math.max(css('min'), px)));
      setWidths((o) => ({ ...o, [pane]: w }));
      onResize?.(pane, w);
    };
    const [shown, least, most] = range[pane] || [widths[pane] || 0, 0, 0];
    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
      if (!ref.current) return;
      if (e.key === 'Home') { e.preventDefault(); set(css('min')); return; }
      if (e.key === 'End') { e.preventDefault(); set(css('max')); return; }
      const step = e.shiftKey ? 64 : 16, d = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : undefined;
      if (d === undefined) return;
      e.preventDefault();
      set(ref.current.offsetWidth + d * side);
    };
    const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0 || !ref.current) return;
      e.preventDefault();
      const x0 = e.clientX, w0 = ref.current.offsetWidth, el = e.currentTarget, shell = el.closest('.sk-editor');
      el.setPointerCapture?.(e.pointerId);
      el.classList.add('is-dragging');
      shell?.classList.add('is-resizing');
      const move = (m: globalThis.PointerEvent) => set(w0 + (m.clientX - x0) * side);
      const up = () => {
        el.classList.remove('is-dragging');
        shell?.classList.remove('is-resizing');
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerup', up);
        el.removeEventListener('pointercancel', up);
      };
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
    };
    return (
      <div className={cx('sk-editor__grip', `is-${pane}`)} role="separator" aria-orientation="vertical" tabIndex={0}
        aria-label={tx(pane === 'tool' ? 'resizeTool' : 'resizeInspector')} aria-valuenow={widths[pane] || shown} aria-valuemin={least || undefined} aria-valuemax={most || undefined}
        onKeyDown={onKeyDown} onPointerDown={onPointerDown} />
    );
  }
  /* Focus mode's bars come back on demand: shown as focus starts and on every pointer move, faded out after 2 s still, never while
     the pointer rests on them or focus is inside them */
  const [awake, setAwake] = useState(true), nap = useRef<ReturnType<typeof setTimeout>>(), float = useRef<HTMLDivElement>(null);
  useEffect(() => () => clearTimeout(nap.current), []);
  useEffect(() => { if (focus) setAwake(true); }, [focus]);
  function wake() {
    if (!awake) setAwake(true);
    clearTimeout(nap.current);
    nap.current = setTimeout(() => {
      const f = float.current;
      if (f && (f.matches(':hover') || f.contains(document.activeElement))) return;
      setAwake(false);
    }, 2000);
  }
  return (
    <div className={cx('sk-editor', focus && 'is-focus', className)} style={height ? { height } : undefined}
      onPointerMove={focus ? wake : undefined} onFocus={focus ? wake : undefined}>
      {sl.get('nav')}
      <div className="sk-editor__col">
        {sl.get('header')}
        <div className="sk-editor__body">
          <div ref={toolRef} className={cx('sk-editor__tool', toolEnds)} style={widths.tool ? { width: widths.tool } : undefined}>{sl.get('tool')}</div>
          {sl.get('tool') && grip('tool', toolRef, 1)}
          <div className="sk-editor__center">{sl.body}</div>
          {sl.get('inspector') && grip('inspector', inspRef, -1)}
          <aside ref={inspRef} className={cx('sk-editor__inspector', inspEnds)} style={widths.inspector ? { width: widths.inspector } : undefined}
            aria-label={inspectorLabel || tx('inspector')}>{sl.get('inspector')}</aside>
        </div>
        {/* The timeline runs the editor's whole width under the panels, which scroll above it */}
        {sl.get('timeline') && <div className="sk-editor__timeline">{sl.get('timeline')}</div>}
      </div>
      {focus && <div ref={float} className={cx('sk-editor__float', !awake && 'is-asleep')}>{sl.get('float')}</div>}
      {sl.get('overlay')}
    </div>
  );
}
