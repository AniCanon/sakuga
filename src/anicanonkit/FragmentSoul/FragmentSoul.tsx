import { sized } from '../../internal/size';

export interface FragmentSoulProps {
  /** Pixels, or a size token such as 'var(--button-icon-size)'. */
  size?: number | string;
  /** Shows a held or dormant balance. */
  dim?: boolean;
  /** Extra class on the root element. */
  className?: string;
}

/* The Soul Fragment: AniCanon's currency mark. Flat cel layers in fixed artwork colours, copied from the locked FragmentSoul. */
/**
 * FragmentSoul is the Fragments currency mark: a hitodama spirit-flame in flat cel layers with a deep violet ink line.
 *
 * Not for the balance with its amount, in a top bar, the sidebar or a sentence (`FragmentBalance`); the price on the action
 * that spends it (`SpendButton`); the price on a choice card (`SpendTiles`).
 *
 * Accessibility: Decorative: the mark is hidden from screen readers.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function FragmentSoul({ size = 24, dim, className }: FragmentSoulProps) {
  const dims = sized(size);
  const style = dim ? { filter: 'saturate(0.4) brightness(0.95)', ...dims.style } : dims.style;
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className={className} width={dims.width} height={dims.height} style={style}>
      <path d="M25 4.5c2.6 5.4 5.9 8.2 6.7 14 .9 6.3-1.4 12.2-4.6 15.6 1.2-2.7 1.4-5.8.3-8.2-1 2.1-2.7 3-4.7 3.2 2.2-3.6 1.6-7.2-.7-9.6-1.8 2-3 3.6-3.6 6.6-.6-1.2-1-2.3-1-3.8C13.6 16.9 20.5 13.4 25 4.5z" fill="#8B6CF0" stroke="#241048" strokeWidth={1.6} strokeLinejoin="round" />
      <path d="M16.2 28.5C16.2 35.4 21 41 24.4 41c4.2 0 7.3-4.5 7.3-9.8 0-2.5-.8-4.6-2.1-6.4 1 5-1.4 9.3-5.4 9.3-3.6 0-6.4-2.8-6.7-6.6-.6 1.8-1.3 1.9-1.3 1z" fill="#C779DF" />
      <path d="M24.6 16c2.7 3.6 4.4 6.7 4.4 11 0 4.6-2.3 8.4-5 8.9-1.2-2.4-.7-4.6.3-6.6-2.4 1-4.2-.3-4.6-2.7 2-1.6 2.4-4 .8-6.4 1.6-1.2 2.8-2.7 3.1-4.2z" fill="#FF6FAE" />
      <ellipse cx={23.4} cy={31.5} rx={2.9} ry={4} fill="#FFE6F2" />
      <path d="M33 8c1.5 1.3 1.5 3.2 0 4.5-1.5-1.3-1.5-3.2 0-4.5z" fill="#FF6FAE" />
      <path d="M11.5 12.5c1.1.9 1.1 2.3 0 3.2-1.1-.9-1.1-2.3 0-3.2z" fill="#C779DF" />
    </svg>
  );
}
