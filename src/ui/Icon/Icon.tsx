import type { CSSProperties } from 'react';
import { cx } from '../../internal/cx';
import { sized } from '../../internal/size';
import { iconRatios, type IconName } from './names';
import { iconHref } from './sprite';
import '../../base.css';
import './Icon.css';

export type { IconName };

export interface IconProps {
  /** Which icon, from Sakuga's set. */
  name: IconName;
  /** Pixels, or a size token such as 'var(--button-icon-size)'. */
  size?: number | string;
  /** Names the icon for screen readers; hidden without it. */
  title?: string;
  /** The stroke's width, for an icon drawn larger or smaller than its grid. */
  strokeWidth?: number;
  /** Extra class on the root element. */
  className?: string;
}

/**
 * Icon draws one glyph from AniCanon's outline icon set: 24px grid, 2px stroke, round caps and joins, `currentColor`.
 *
 * Not for an action shown as a glyph alone (`IconButton`); the shape of a story event (`EventGlyph`); the Fragments mark
 * (`FragmentSoul`).
 *
 * Accessibility: Decorative by default: hidden from screen readers and never focusable. With `title` it is an image named by
 * that title.
 *
 * @version 1.5
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function Icon({ name, size = 20, title, strokeWidth, className }: IconProps) {
  const a11y = title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true as const };
  const dims = sized(size), ratio = dims.style && iconRatios[name];
  const sizedStyle = ratio ? { ...dims.style, aspectRatio: ratio } : dims.style;
  const style: CSSProperties | undefined = strokeWidth
    ? { ...sizedStyle, ['--icon-stroke-width' as string]: strokeWidth }
    : sizedStyle;
  return (
    <svg className={cx('sk-icon', className)} width={dims.width} height={dims.height} style={style} {...a11y}>
      <use href={iconHref(name)} />
    </svg>
  );
}
