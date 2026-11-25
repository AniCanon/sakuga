import { Fragment, useLayoutEffect, useRef, useState, type MouseEventHandler } from 'react';
import { Icon, type IconName } from '@anicanon/sakuga/ui';
import { cx } from '../../internal/cx';
import { GoLink } from '../../internal/link';
import { MoreWrap, type CardMenu } from '../../ui/MoreWrap/MoreWrap';
import { FragmentBalance } from '../FragmentBalance/FragmentBalance';
import { FragmentSoul } from '../FragmentSoul/FragmentSoul';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import '../../base.css';
import '../../ui/MoreWrap/MoreWrap.css';
import './ProductionNav.css';

/** Each item with href is a link; without, a button that runs its onClick. */
export interface ProductionNavProps {
  /** Back to the list of productions, as a link (`href`) or a button (`onClick`). */
  back?: { label: string; href?: string; onClick?: MouseEventHandler };
  /** The production's cover, title and format. */
  production?: {
    title: string; meta?: string; image?: string;
    /** The production's ⋯ (Rename, Delete), on its picture, on every view; the collapsed rail leaves it out. */
    menu?: CardMenu;
  };
  /**
   * The production's views (Script, Plan, Make, Screen, Publish), each with its state: a `note`, and `attention` when something
   * needs you.
   */
  views: {
    icon: IconName;
    label: string;
    note?: string;
    state?: 'attention';
    href?: string;
    onClick?: MouseEventHandler;
    /** Not open yet (Plan before there is a script): drawn waiting, out of the tab order, its note saying when it opens. */
    disabled?: boolean;
  }[];
  /** The label of the view open now. */
  current?: string;
  /** The scenes, numbered, with their pictures. `selected` is the open scene's `number` (not its place in `items`). */
  sections?: { title?: string; /** The open scene's `number`. */ selected?: number; items: { number: number; title: string; image?: string; note?: string; state?: 'attention'; href?: string; onClick?: MouseEventHandler }[] };
  /** A few facts at the foot (runtime, cut), with an optional bar for `percent`. */
  facts?: {
    label: string;
    value: string;
    percent?: number;
    /** The value is a fragment amount ("3,420 of ~4,100"): shown with the fragment mark. */
    fragments?: boolean;
    /** Opens what the fact sums up (the episode's spending, by scene and by kind). */
    href?: string;
    onClick?: MouseEventHandler<HTMLElement>;
    /** The link's name when the label and value alone do not say what it opens. */
    linkLabel?: string;
  }[];
  /** The Fragments balance, at the foot. */
  balance?: string;
  /** Where the balance leads (the Fragments page), open or collapsed. */
  balanceHref?: string;
  /** Runs when the balance is pressed and it has no `balanceHref`. */
  onBalance?: MouseEventHandler;
  /** The Cut's 72 px rail: the cover, the views as icons and the editor's `tools`. */
  collapsed?: boolean;
  /** The editor's tools on the collapsed rail. */
  tools?: { icon: IconName; label: string; short?: string; href?: string; onClick?: MouseEventHandler }[];
  /** The label of the tool open now. */
  currentTool?: string;
  /** Names the region; "Production" without it. */
  label?: string;
  /** Extra class on the root element. */
  className?: string;
}

/**
 * ProductionNav is the side bar inside a production (an episode, a short, and later a manga issue). The app's SideNav is not
 * shown there: a production is a focused, full-screen workspace.
 *
 * Not for the creator sidebar outside a production, wide or `compact` (`SideNav`); the top of a view with its title and actions
 * (`ViewHeader`); the steps of a full-screen flow (`Stepper`); the desktop header across the app (`TopNav`).
 *
 * Accessibility: A complementary region named by `label` (default "Production"): Tab moves through Back, the links of a
 * navigation named "Views" (the current one "current page", with its note), the scene links ("current" on the selected one)
 * and the balance link, while the production's title is a level-2 heading, the scenes' title a level-3 one, and each fact
 * reads its value and percent. Collapsed, the rail's links are named by their titles ("Cast · 3 waiting"), the tools sit in a
 * navigation named "Tools" and are named by their `label` (not the short word under them), and the balance is the mark alone,
 * still a link named "Fragments balance: 1,240"; pictures, icons and the attention dot are hidden. With `production.menu`, the ⋯
 * is a button after the production's heading, named "More for" and the title, with a menu popup.
 *
 * @version 1.6
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function ProductionNav({ back, production, views: given, current: cur, sections: sec, facts, balance, balanceHref, onBalance, collapsed, tools, currentTool, label, className }: ProductionNavProps) {
  const tx = useWords(ownWords);
  const p: { title?: string; meta?: string; image?: string; menu?: CardMenu } = production || {}, bk: { label?: string; href?: string; onClick?: MouseEventHandler } = back || {}, views = given || [];
  /* The rail's tools scroll when the window is too short for them all: an edge marks each end with more past it */
  const toolsRef = useRef<HTMLElement>(null), [ends, setEnds] = useState(''), toolsLen = (tools || []).length;
  useLayoutEffect(() => {
    const el = toolsRef.current;
    if (!el) return;
    const mark = () => {
      const more = (el.scrollTop > 1 ? 'is-more-above ' : '') + (el.scrollTop + el.clientHeight < el.scrollHeight - 1 ? 'is-more-below' : '');
      setEnds((was) => (was === more ? was : more));
    };
    mark();
    el.addEventListener('scroll', mark, { passive: true });
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(mark) : null;
    if (ro) ro.observe(el); else window.addEventListener('resize', mark);
    return () => { el.removeEventListener('scroll', mark); if (ro) ro.disconnect(); else window.removeEventListener('resize', mark); };
  }, [collapsed, toolsLen]);
  if (collapsed) {
    return (
      <aside className={cx('sk-prodnav', 'is-collapsed', className)} aria-label={label || tx('production')}>
        <GoLink href={bk.href} onClick={bk.onClick} className="sk-prodnav__railhead" title={tx('backTo', { name: bk.label || tx('productions') })}>
          {p.image ? <img src={p.image} alt="" /> : <Icon name="back" size="var(--prodnav-railhead-icon-size)" />}
        </GoLink>
        <nav className="sk-prodnav__rail" aria-label={tx('views')}>
          {views.map((v) => {
            const name = v.label + (v.note ? ' · ' + v.note : '');
            /* A view that is not open yet is no action: a disabled link, out of the tab order, named with the note that says when it opens */
            if (v.disabled) return (
              <span key={v.label} role="link" aria-disabled="true" aria-label={name} title={name} className="sk-prodnav__ricon is-waiting">
                <Icon name={v.icon} size="var(--prodnav-ricon-icon-size)" />
              </span>
            );
            return (
              <GoLink key={v.label} href={v.href} onClick={v.onClick} title={name} className="sk-prodnav__ricon" aria-current={v.label === cur ? 'page' : undefined}>
                <Icon name={v.icon} size="var(--prodnav-ricon-icon-size)" />{v.state === 'attention' && <i aria-hidden="true" />}
              </GoLink>
            );
          })}
        </nav>
        {(tools || []).length > 0 && <span className="sk-prodnav__sep" aria-hidden="true" />}
        {(tools || []).length > 0 && (
          <nav ref={toolsRef} className={cx('sk-prodnav__rail', 'sk-prodnav__tools', ends)} aria-label={tx('tools')}>
            {tools!.map((t) => (
              <GoLink key={t.label} href={t.href} onClick={t.onClick} title={t.label} aria-label={t.label} className="sk-prodnav__ricon is-tool" aria-current={t.label === currentTool ? 'true' : undefined}>
                <Icon name={t.icon} size="var(--prodnav-ricon-icon-size)" /><small>{t.short || t.label}</small>
              </GoLink>
            ))}
          </nav>
        )}
        <span className="sk-prodnav__fill" />
        {balance && (
          <GoLink href={balanceHref} onClick={onBalance} className="sk-prodnav__mark" title={tx('fragmentsAmount', { amount: balance })} aria-label={tx('fragmentsBalance', { amount: balance })}>
            <FragmentSoul size="var(--prodnav-fill-mark-size)" />
          </GoLink>
        )}
      </aside>
    );
  }
  const head = <div className="sk-prodnav__head">{p.image && <img src={p.image} alt="" />}<b title={p.title} role="heading" aria-level={2}>{p.title}</b>{p.meta && <span>{p.meta}</span>}</div>;
  return (
    <aside className={cx('sk-prodnav', className)} aria-label={label || tx('production')}>
      <GoLink href={bk.href} onClick={bk.onClick} className="sk-prodnav__back"><Icon name="back" size="var(--prodnav-back-icon-size)" />{bk.label || tx('back')}</GoLink>
      {p.menu ? (
        <MoreWrap menu={p.menu} name={p.title || ''} className={cx('sk-prodnav__headwrap', !p.image && 'is-plain')} variant={p.image ? 'media' : 'plain'} align="end">{head}</MoreWrap>
      ) : head}
      <nav className="sk-prodnav__group" aria-label={tx('views')}>
        {views.map((v) => v.disabled ? (
          <span key={v.label} role="link" aria-disabled="true" aria-label={v.label + (v.note ? ' · ' + v.note : '')} className="sk-prodnav__item is-waiting">
            <Icon name={v.icon} size="var(--prodnav-item-icon-size)" /><span>{v.label}</span>{v.note && <small>{v.note}</small>}
          </span>
        ) : (
          <GoLink key={v.label} href={v.href} onClick={v.onClick} className="sk-prodnav__item" aria-current={v.label === cur ? 'page' : undefined}>
            <Icon name={v.icon} size="var(--prodnav-item-icon-size)" /><span>{v.label}</span>
            {v.note && <small className={v.state === 'attention' ? 'is-attention' : undefined}>{v.note}</small>}
          </GoLink>
        ))}
      </nav>
      {sec && (
        <div className="sk-prodnav__group sk-prodnav__scenes">
          <p className="sk-prodnav__title" role="heading" aria-level={3}>{sec.title || tx('scenes')}</p>
          {(sec.items || []).map((s) => (
            <GoLink key={s.number} href={s.href} onClick={s.onClick} className="sk-prodnav__scene" aria-current={s.number === sec.selected ? 'true' : undefined}>
              {s.image ? <img src={s.image} alt="" /> : <span className="sk-prodnav__noimg" />}
              <span><b>{'#' + s.number + ' ' + s.title}</b>{s.note && <small className={s.state === 'attention' ? 'is-attention' : undefined}>{s.note}</small>}</span>
            </GoLink>
          ))}
        </div>
      )}
      <span className="sk-prodnav__fill" />
      {(facts || []).length > 0 && (
        <dl className="sk-prodnav__facts">
          {facts!.map((f) => (
            <Fragment key={f.label}>
              <dt>{f.label}</dt>
              <dd>
                {(f.href || f.onClick) ? (
                  <GoLink href={f.href} onClick={f.onClick} className="sk-prodnav__fact-link" aria-label={f.linkLabel}>
                    {f.fragments ? <FragmentBalance variant="inline" amount={f.value} /> : f.value}
                  </GoLink>
                ) : f.fragments ? <FragmentBalance variant="inline" amount={f.value} /> : f.value}
                {f.percent !== undefined && <i><em style={{ width: Math.min(100, f.percent) + '%' }} /></i>}
                {f.percent !== undefined && <span className="sk-sr">{', ' + Math.round(f.percent) + '%'}</span>}
              </dd>
            </Fragment>
          ))}
        </dl>
      )}
      {balance && <FragmentBalance variant="block" amount={balance} href={balanceHref} onClick={onBalance} />}
    </aside>
  );
}
