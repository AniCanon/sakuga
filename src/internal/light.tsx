import type { CSSProperties, PointerEvent } from 'react';

/* Light on art: a picture's own highlights, baked once into its light map, show through a soft circle where the pointer is over
   its frame (the sk-light layer). The position is written on the frame's style, so a move never re-renders; under keyboard focus
   the light rests at the centre. --frame-ratio keeps the light a circle on a frame of any shape. */
export function lightAt(e: PointerEvent<HTMLElement>): void {
  if (e.pointerType === 'touch') return;
  const f = e.currentTarget, r = f.getBoundingClientRect();
  if (e.type === 'pointerenter') f.style.setProperty('--frame-ratio', (r.width / r.height).toFixed(3));
  f.style.setProperty('--light-x', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
  f.style.setProperty('--light-y', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
}

export function lightRest(f: HTMLElement | null): void {
  if (!f || f.matches(':hover')) return;
  const r = f.getBoundingClientRect();
  f.style.setProperty('--frame-ratio', (r.width / r.height).toFixed(3));
  f.style.removeProperty('--light-x');
  f.style.removeProperty('--light-y');
}

export function lightLayer(map: string, style?: CSSProperties) {
  return <img key="light" className="sk-light" src={map} alt="" aria-hidden="true" loading="lazy" decoding="async" style={style} />;
}
