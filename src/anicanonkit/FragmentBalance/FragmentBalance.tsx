import { useEffect, type MouseEventHandler } from 'react';
import { GoLink } from '../../internal/link';
import { announce } from '../../internal/live';
import { FragmentSoul } from '../FragmentSoul/FragmentSoul';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import '../../base.css';
import './FragmentBalance.css';

export interface FragmentBalanceProps {
  /**
   * Where it sits: `pill` in a top bar, `block` in the sidebar, `held` while a generation runs, `inline` inside a sentence,
   * `card` as the wallet card.
   */
  variant?: 'pill' | 'block' | 'held' | 'inline' | 'card';
  /** The balance, or the amount held, as text ("1,240"). */
  amount: string;
  /** A line beside or under the amount; on the card, the promise ("available · Fragments never expire"). */
  caption?: string;
  /** card: the plan's name, in its corner. */
  title?: string;
  /** held: what it is held for; card: a line along the foot. */
  text?: string;
  /** card: what jobs in progress hold, read along the foot with the mark ("520" is read "520 held"). */
  held?: string;
  /** card: the plan's own art, resting in the far corner. */
  image?: string;
  /** block: where it leads; without it, a button that runs onClick. */
  href?: string;
  /** block: runs when pressed and it has no `href`. */
  onClick?: MouseEventHandler;
}

/* A held amount is said once through the page's live region when it appears */
/**
 * The Fragments balance in its places: a pill in top bars, a block in the sidebar, a held line while a generation is running,
 * `inline`: the mark and an amount inside a sentence ("~520 is held when you start"), and `card`: the balance as a wallet card.
 * Built only from core components and tokens; it lives in AniCanonKit, not the core.
 *
 * Not for the bare mark or a medallion with no amount (`FragmentSoul`); the price on the action that spends it (`SpendButton`);
 * the price on a choice card (`SpendTiles`).
 *
 * Accessibility: The `variant` decides: block is a link named "Fragments balance: 1,240" (a button running `onClick` without
 * `href`), card a group of that name, and pill, card and inline read their amount as "1,240 fragments"; held is said once
 * through the page's live region when it appears ("120 held"), then reads as its text. The mark is hidden in every variant.
 *
 * @version 1.1
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function FragmentBalance({ variant, amount, caption, title, text, held, image, href, onClick }: FragmentBalanceProps) {
  const tx = useWords(ownWords);
  const v = variant || 'pill';
  const heldSaid = v === 'held' ? [title || tx('held', { amount }), text].filter(Boolean).join('. ') : '';
  useEffect(() => { if (heldSaid) announce(heldSaid); }, [heldSaid]);
  const soul = <FragmentSoul size={v === 'block' ? 'var(--fragments-block-mark-size)' : v === 'held' ? 'var(--fragments-held-mark-size)' : 'var(--fragments-pill-mark-size)'} />;
  if (v === 'block') {
    return (
      <GoLink href={href} onClick={onClick} className="sk-frag sk-frag--block" aria-label={tx('fragmentsBalance', { amount })}>
        {soul}<span><span className="sk-frag__eyebrow">{tx('fragments')}</span><span className="sk-frag__amount">{amount}</span></span>
      </GoLink>
    );
  }
  if (v === 'card') {
    return (
      <div className="sk-frag sk-frag--card" role="group" aria-label={tx('fragmentsBalance', { amount })}>
        {image && <img className="sk-frag__art" src={image} alt="" />}
        <span className="sk-frag__eyebrow">{tx('fragments')}</span>{title && <span className="sk-frag__plan">{title}</span>}
        <span className="sk-frag__big"><FragmentSoul size="var(--fragments-big-mark-size)" />{amount}<span className="sk-sr">{' ' + tx('fragmentsUnit')}</span></span>
        <span className="sk-frag__caption">{caption || tx('available')}</span>
        {held && <span className="sk-frag__foot"><FragmentSoul size="var(--fragments-foot-mark-size)" /><b>{tx('held', { amount: held })}</b>{text && <span>{text}</span>}</span>}
      </div>
    );
  }
  if (v === 'held') return <div className="sk-frag sk-frag--held">{soul}<b>{title || tx('held', { amount })}</b>{text && <span>{text}</span>}</div>;
  if (v === 'inline') {
    return (
      <span className="sk-frag sk-frag--inline">
        <FragmentSoul size="var(--fragments-inline-mark-size)" />{amount}<span className="sk-sr">{' ' + tx('fragmentsUnit')}</span>{caption && <span className="sk-frag__caption">{' ' + caption}</span>}
      </span>
    );
  }
  return <span className="sk-frag sk-frag--pill">{soul}{amount}<span className="sk-sr">{' ' + tx('fragmentsUnit')}</span>{caption && <span className="sk-frag__caption">{caption}</span>}</span>;
}
