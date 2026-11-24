import type { MouseEventHandler, ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { GoLink } from '../../internal/link';
import { useUid } from '../../internal/uid';
import { Icon, type IconName } from '../Icon/Icon';
import { IconButton } from '../IconButton/IconButton';
import { Thumb } from '../Thumb/Thumb';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import '../../base.css';
import './SideNav.css';

export interface SideNavProps {
  /** The product at the top: its logo, name, product line and where it leads. */
  brand?: { logo?: string; name?: string; product?: string; href?: string };
  /** The current series or workspace. Without `image` the picture's place is kept with Thumb's placeholder and the label's initial. */
  switcher?: {
    label: string;
    /** Without it the switcher keeps the picture's place with Thumb's placeholder and the label's initial. */
    image?: string;
    /** Default "Series". */
    prefix?: string;
    /** Whether its list is open. */
    open?: boolean;
    /** The id of what it opens. */
    controls?: string;
    onClick?: MouseEventHandler;
  };
  /** An item with href is a link; without, a button that runs its onClick. */
  groups: { title?: string; items: { label: string; icon?: IconName; current?: boolean; href?: string; onClick?: MouseEventHandler }[] }[];
  /** Always pass it. */
  account: { name: string; handle?: string; image?: string; onClick?: MouseEventHandler };
  /** Default "Sections". */
  label?: string;
  /** The footer slot, above the account. */
  children?: ReactNode;
  /** The narrow window's sidebar (the page sets it below 1200 px): each item its icon over its name, the brand its logo, the switcher its picture, the account its face. */
  compact?: boolean;
  /** Folded to its icons, a tip naming each; the page keeps the choice. */
  collapsed?: boolean;
  /** Shows the fold button, a row at the foot above the footer slot. */
  onToggle?: MouseEventHandler;
  /** Extra class on the root element. */
  className?: string;
}

/**
 * The creator sidebar: product, a switcher for the current workspace, grouped sections, a footer slot and the signed-in account
 * at the bottom. The account is always shown. The current item reads in ink weight with the small state dot beside its name: no
 * fill, no edge.
 *
 * Not for the main sections a viewer moves between on desktop (`TopNav`); the views and scenes inside a production
 * (`ProductionNav`); navigation on a phone (`TabBar`); the rail inside a production (`ProductionNav` `collapsed`).
 *
 * Accessibility: A complementary region named by `label` (default "Sections"); Tab moves through the brand link (without
 * `brand.href`, the name alone), the series switcher ("Series: Ember Bay. Switch", expanded or collapsed from `switcher.open`,
 * running `switcher.onClick`, controlling `switcher.controls`), the links of a navigation named "Sections navigation" (each
 * group named by its title, the current link "current page"; an item without `href` is a button running its `onClick`), the
 * footer slot (`children`) and the account button ("Your account, Aiko Mori", running `account.onClick`). Icons and pictures
 * are hidden. Compact keeps every name: the switcher and the account are named as above, each item by its name under its icon,
 * and the group titles stay as the groups' names.
 *
 * @version 1.7
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function SideNav({ brand, switcher: sw, groups, account: acct, label, children, compact, collapsed, onToggle, className }: SideNavProps) {
  const tx = useWords(ownWords);
  const b = brand || {}, gid = useUid('sk-sidenav');
  const brandMark = <>
    {b.logo && <img src={b.logo} alt="" />}
    <span className="sk-sidenav__name">{b.name || 'AniCanon'}</span>
    {b.product && <span className="sk-sidenav__product">{b.product}</span>}
  </>;
  /* A brand with no address is only the mark, never a link to # */
  const brandEl = b.href ? <a className="sk-sidenav__brand" href={b.href}>{brandMark}</a> : <span className="sk-sidenav__brand">{brandMark}</span>;
  const foldLabel = collapsed ? tx('expandMenu') : tx('collapseMenu');
  return (
    <aside className={cx('sk-sidenav', (compact || collapsed) && 'sk-sidenav--compact', collapsed && 'sk-sidenav--collapsed', className)} aria-label={label || tx('sections')}>
      {onToggle ? (
        /* The fold button sits at the end of the brand row, so it costs no row of the list; the page keeps the choice */
        <div className="sk-sidenav__head">
          {brandEl}
          <IconButton variant="plain" icon="sidebar" label={foldLabel} className="sk-sidenav__fold" data-label={foldLabel} aria-expanded={collapsed ? 'false' : 'true'}
            onClick={onToggle} iconSize="var(--sidebar-item-icon-size)" />
        </div>
      ) : brandEl}
      {sw && (
        <button type="button" className="sk-sidenav__switch" aria-haspopup="listbox" aria-expanded={sw.open === undefined ? undefined : sw.open ? 'true' : 'false'} aria-controls={sw.controls} aria-label={tx('switchSeries', { prefix: sw.prefix || tx('series'), name: sw.label })} onClick={sw.onClick}>
          {sw.image ? <img src={sw.image} alt="" /> : <Thumb placeholder={String(sw.label || '').charAt(0)} width="var(--sidebar-switch-img-size)" height="var(--sidebar-switch-img-size)" />}
          <span className="sk-sidenav__label">{sw.label}</span>
          <Icon name="chevron-down" size="var(--sidebar-switch-chevron-icon-size)" />
        </button>
      )}
      <nav className="sk-sidenav__nav" aria-label={tx('sectionsNav', { label: label || tx('sections') })}>
        {(groups || []).map((g, gi) => (
          <div key={gi} className="sk-sidenav__group" role={g.title ? 'group' : undefined} aria-labelledby={g.title ? gid + '-' + gi : undefined}>
            {g.title && <p className="sk-sidenav__title" id={gid + '-' + gi}>{g.title}</p>}
            {(g.items || []).map((it) => (
              <GoLink key={it.label} href={it.href} onClick={it.onClick} className="sk-sidenav__item" data-label={it.label} aria-current={it.current ? 'page' : undefined}>
                {it.icon && <Icon name={it.icon} size="var(--sidebar-item-icon-size)" />}
                <span className="sk-sidenav__text">{it.label}</span>
              </GoLink>
            ))}
          </div>
        ))}
      </nav>
      {children}
      {acct && (
        <button type="button" className="sk-sidenav__account" aria-label={acct.name ? tx('accountOf', { name: acct.name }) : tx('account')} onClick={acct.onClick}>
          {acct.image ? <img src={acct.image} alt="" /> : <span className="sk-sidenav__initials">{(acct.name || '?').split(' ').map((w) => w[0]).join('').slice(0, 2)}</span>}
          <span className="sk-sidenav__who"><b>{acct.name}</b>{acct.handle && <span>{acct.handle}</span>}</span>
          <Icon name="chevron-up-down" size="var(--sidebar-who-chevron-icon-size)" />
        </button>
      )}
    </aside>
  );
}
