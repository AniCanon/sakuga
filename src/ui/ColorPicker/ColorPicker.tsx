import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { cx } from '../../internal/cx';
import { usePointerArea } from '../../internal/pointerArea';
import { sliderProps } from '../../internal/slider';
import { useUid } from '../../internal/uid';
import { SwatchPicker } from '../SwatchPicker/SwatchPicker';
import { hexOf, hexOfHsv, hsvOf, type Hsv } from './colour';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import '../../base.css';
import './ColorPicker.css';

/** Any colour: a saturation and brightness field, a hue track and the hex. `presets` are the colours a design or kit already has; `fromPicture`
    the colours read from an uploaded picture. For a compact form, put it in a Popover. */
export interface ColorPickerProps {
  /** Names the picker; the hex field is named by it too. */
  label: string;
  /** Hex, "#1f6feb". */
  value?: string;
  /** Called with hex as it changes. */
  onChange?: (hex: string) => void;
  /** The colours the design or kit already has, as swatches under the field. */
  presets?: { label: string; color: string }[];
  /** Default "Colours in use". */
  presetsLabel?: string;
  /** The colours read from an uploaded picture, such as a logo, as a second row. */
  fromPicture?: { label: string; color: string }[];
  /** Default "From the picture". */
  pictureLabel?: string;
  /** The hex field's id; one is made without it. */
  id?: string;
  /** Extra class on the root element. */
  className?: string;
}

/* Any colour: a field for saturation (across) and brightness (up), a hue track and the hex, with the colours a kit already has
   and those read from a picture as swatches. The colour is kept as hue, saturation and brightness, so the hue holds while the
   colour passes through grey, black or white. value and onChange speak hex ("#1f6feb"). */
/**
 * ColorPicker chooses any colour: a field for saturation and brightness, a hue track and the hex. A brand kit's colours, a
 * design's own colour.
 *
 * Not for a colour chosen from a fixed set (skin, coat) (`SwatchPicker`); adjusting colour in the editor (`SliderRow`).
 *
 * Accessibility: A group named by `label`. The field is a slider named "Saturation and brightness" that speaks both; arrows
 * move it 1% (10% with Shift), left and right for saturation, up and down for brightness. The hue track is a slider named "Hue"
 * in degrees: arrows by 1 (10 with Shift), Page Up and Page Down by 30, Home and End. The hex field is a text field named by
 * `label` and "hex". Presets and picture colours are radio groups (see SwatchPicker), the chosen one checked when it matches.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function ColorPicker(props: ColorPickerProps) {
  const tx = useWords(ownWords);
  const hex = hexOf(props.value) || '#000000';
  const [c, setC] = useState<Hsv>(() => hsvOf(hex));
  const [draft, setDraft] = useState<string | null>(null);
  const field = useRef<HTMLDivElement>(null), track = useRef<HTMLDivElement>(null), id = useUid('sk-colorpick', props.id);
  const shown = hexOfHsv(c);
  useEffect(() => {
    const v = hexOf(props.value);
    if (v && v !== hexOfHsv(c)) { const n = hsvOf(v); setC(n.s && n.v ? n : { h: c.h, s: n.s, v: n.v }); }
  }, [props.value]);
  function set(n: Hsv) { setC(n); if (props.onChange) props.onChange(hexOfHsv(n)); }
  function pick(v: string) { const n = hsvOf(v); set(n.s && n.v ? n : { h: c.h, s: n.s, v: n.v }); }
  const fieldDrag = usePointerArea(field, (x, y) => set({ h: c.h, s: x, v: 1 - y }));
  const hueDrag = usePointerArea(track, (x) => set({ h: Math.min(359, x * 360), s: c.s, v: c.v }));
  function fieldKeys(e: KeyboardEvent) {
    const s = e.shiftKey ? 0.1 : 0.01, d = ({ ArrowRight: [s, 0], ArrowLeft: [-s, 0], ArrowUp: [0, s], ArrowDown: [0, -s] } as Record<string, number[]>)[e.key];
    if (!d) return;
    e.preventDefault();
    set({ h: c.h, s: Math.min(1, Math.max(0, c.s + d[0])), v: Math.min(1, Math.max(0, c.v + d[1])) });
  }
  const pct = (u: number) => Math.round(u * 100);
  const group = (title: string, list?: { label: string; color: string }[]) => (list && list.length ? (
    <div className="sk-colorpick__group">
      <span className="sk-colorpick__title" aria-hidden="true">{title}</span>
      <SwatchPicker label={title} value={shown} options={list.map((o) => ({ label: o.label, color: o.color, value: hexOf(o.color) ?? undefined }))} onChange={pick} />
    </div>
  ) : null);
  return (
    <div className={cx('sk-colorpick', props.className)} role="group" aria-label={props.label} style={{ '--colorpick-hue': Math.round(c.h), '--colorpick-current': shown } as CSSProperties}>
      <div
        ref={field} className="sk-colorpick__field" role="slider" tabIndex={0} aria-label={tx('saturationBrightness')}
        aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct(c.s)} aria-valuetext={tx('saturationValue', { s: pct(c.s), v: pct(c.v) })} onKeyDown={fieldKeys} {...fieldDrag}
      >
        <span className="sk-colorpick__thumb" style={{ left: c.s * 100 + '%', top: (1 - c.v) * 100 + '%' }} />
      </div>
      <div ref={track} className="sk-colorpick__hue"
        {...sliderProps({ label: tx('hue'), value: Math.round(c.h), max: 359, step: 1, shiftStep: 10, page: 30, text: tx('hueValue', { h: Math.round(c.h) }), onChange: (v) => set({ h: v, s: c.s, v: c.v }) })}
        {...hueDrag}>
        <span className="sk-colorpick__thumb" style={{ left: c.h / 359 * 100 + '%', top: '50%' }} />
      </div>
      <div className="sk-colorpick__row">
        <span className="sk-colorpick__swatch" aria-hidden="true" />
        <label className="sk-colorpick__hex" htmlFor={id}>
          <span aria-hidden="true">#</span>
          <input
            id={id} aria-label={(props.label ? props.label + ', ' : '') + 'hex'} spellCheck={false} autoComplete="off" maxLength={7} value={draft !== null ? draft : shown.slice(1).toUpperCase()}
            onChange={(e) => { const t = e.target.value.replace(/^#/, ''); setDraft(t); const v = hexOf(t); if (v && (t.length === 6 || t.length === 3)) pick(v); }}
            onBlur={() => setDraft(null)} onKeyDown={(e) => { if (e.key === 'Enter') setDraft(null); }}
          />
        </label>
      </div>
      {group(props.presetsLabel || tx('coloursInUse'), props.presets)}
      {group(props.pictureLabel || tx('fromThePicture'), props.fromPicture)}
    </div>
  );
}
