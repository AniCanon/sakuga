/** A crop of a picture: the centre as fractions of its width and height, and the side of the square it cuts as a fraction of its
 *  height. What the server cuts. */
export interface CropValue {
  /** The centre, as a fraction of the picture's width. */
  x: number;
  /** The centre, as a fraction of the picture's height. */
  y: number;
  /** The side of the square it cuts, as a fraction of the picture's height. */
  size: number;
}

/** A part of the picture shown alone (a phone shows one face of a sheet), in the same fractions. */
export interface CropView {
  /** The area's left edge, as a fraction of the picture's width. */
  x: number;
  /** The area's top edge, as a fraction of the picture's height. */
  y: number;
  /** Its width, as a fraction of the picture's width. */
  w: number;
  /** Its height, as a fraction of the picture's height. */
  h: number;
}

/* The circle stays inside the picture (or the view), between min and max; its ring and handle stay inside the stage too, never on
   its edge */
export function cropClamp(v: CropValue, aspect: number, view?: CropView, min?: number, max?: number): CropValue {
  const vw = view ? view.w : 1, vh = view ? view.h : 1, vx = view ? view.x : 0, vy = view ? view.y : 0;
  const pad = vh * 0.02, room = Math.min(vh, vw * aspect) - 2 * pad;
  const size = Math.max(Math.min(min || 0.05, room), Math.min(v.size, max || 1, room)), rx = (size / 2 + pad) / aspect, ry = size / 2 + pad;
  return { size, x: Math.max(vx + rx, Math.min(vx + vw - rx, v.x)), y: Math.max(vy + ry, Math.min(vy + vh - ry, v.y)) };
}

/** The picture placed so a square box shows exactly the square the crop cuts: the `imageStyle` that previews a crop at any size in
 *  a Thumb, CastAvatar, MentionChip or a CharacterCard avatar. */
export function cropStyle(v: CropValue, aspect: number): string {
  const pct = (n: number) => (n * 100).toFixed(3) + '%';
  return 'inset:auto;max-width:none;object-fit:fill;width:' + pct(aspect / v.size) + ';height:' + pct(1 / v.size) +
    ';left:' + pct(-(v.x * aspect - v.size / 2) / v.size) + ';top:' + pct(-(v.y - v.size / 2) / v.size);
}
