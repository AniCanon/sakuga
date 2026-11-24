import { useEffect, useRef, type MouseEventHandler, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { Glide, useGlide } from '../../internal/glide';
import { GoLink } from '../../internal/link';
import { slots } from '../../internal/slots';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';
import { SearchField, type SearchFieldProps } from '../SearchField/SearchField';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import '../../base.css';
import '../TextField/TextField.css';
import '../IconButton/IconButton.css';
import '../Popover/Popover.css';
import '../Picker/Picker.css';
import '../SearchField/SearchField.css';
import './TopNav.css';

export interface NavLink {
  /** The section's name. */
  label: string;
  /** Where it goes. */
  href?: string;
  /** The section open now. */
  current?: boolean;
  /** Its press, when it has no `href`. */
  onClick?: MouseEventHandler;
}

export interface TopNavProps {
  /** The product at the start: its logo, name and where it leads. */
  brand?: { logo?: string; name?: string; href?: string };
  /** The main sections, in order. */
  links: NavLink[];
  /** Or children with slot="actions": they sit before search and the account. */
  actions?: ReactNode;
  /** Default "Main". */
  label?: string;
  /** Extra class on the root element. */
  className?: string;
  /** The account button; onClick runs when it is pressed. */
  account?: { name: string; image?: string; onClick?: MouseEventHandler };
  /** With href the Create button is a link; without, a button that runs onClick. */
  create?: { label?: string; href?: string; onClick?: MouseEventHandler };
  /** false drops the Search button, which shows with an account or create. An object holds the bar's SearchField: Search calls
      onOpen, and while open the field takes the links' place with Close search (onClose) after it. */
  search?: boolean | (SearchFieldProps & { open?: boolean; onOpen?: () => void });
  /** Runs when Search is pressed. */
  onSearch?: MouseEventHandler;
  /** Only slot="actions" is read. */
  children?: ReactNode;
}

/**
 * TopNav is the desktop header: the AniCanon mark and wordmark, the main sections as text links, and search and account on the
 * right.
 *
 * Not for navigation on a phone (`TabBar`); the creator's workspace sections (`SideNav`); the views inside a production
 * (`ProductionNav`); the top bar of a full-screen flow (`FlowHeader`).
 *
 * Accessibility: A header whose brand link reads the name (the logo is hidden; without `brand.href` the brand is the name
 * alone, not a link), then a navigation named by `label` (default "Main") whose links mark the current page (a link without
 * `href` is a button running its `onClick`, never a link to #); Tab moves through them, then the `actions`, then, when there
 * is an account or Create, "Search" (running `onSearch`, or `search.onOpen`; while searching, the search landmark and "Close
 * search" take the links' place and Search is gone), then Create and the account button ("Your account, Aiko Mori", running
 * `account.onClick`).
 *
 * @version 1.1
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function TopNav(props: TopNavProps) {
  const tx = useWords(ownWords);
  const brand = props.brand || {};
  const acct = props.account, actions = props.actions || slots(props.children).get('actions');
  const links = useRef<HTMLElement>(null);
  const sf = props.search && typeof props.search === 'object' ? props.search : null, finding = !!(sf && sf.open), was = useRef(finding), acts = useRef<HTMLDivElement>(null);
  /* Closing the search unmounts the button that held focus: focus goes back to Search, unless it already moved elsewhere */
  useEffect(() => {
    const gone = !document.activeElement || document.activeElement === document.body, btn = acts.current && acts.current.querySelector<HTMLElement>('.sk-nav__find');
    if (was.current && !finding && gone && btn) btn.focus();
    was.current = finding;
  }, [finding]);
  useGlide(links, '[aria-current="page"]', true, [props.links, finding, props.className]);
  return (
    <header className={cx('sk-nav', finding && 'is-searching', props.className)}>
      {/* A brand with no address is only the mark, never a link to # */}
      {brand.href
        ? <a className="sk-nav__brand" href={brand.href}>{brand.logo && <img src={brand.logo} alt="" />}{brand.name || 'AniCanon'}</a>
        : <span className="sk-nav__brand">{brand.logo && <img src={brand.logo} alt="" />}{brand.name || 'AniCanon'}</span>}
      {finding && (() => {
        const { open: _open, onOpen: _onOpen, ...field } = sf!;
        return (
          <div className="sk-nav__search">
            <SearchField autoFocus {...field} />
            <IconButton variant="plain" icon="close" label={tx('closeSearch')} onClick={sf!.onClose} />
          </div>
        );
      })()}
      <nav ref={links} className="sk-nav__links" aria-label={props.label || tx('mainNav')} hidden={finding || undefined}>
        <Glide />
        {(props.links || []).map((l) => <GoLink key={l.label} href={l.href} onClick={l.onClick} aria-current={l.current ? 'page' : undefined}>{l.label}</GoLink>)}
      </nav>
      <div ref={acts} className="sk-nav__actions">
        {actions}
        {props.search !== false && !finding && (acct || props.create) && <IconButton className="sk-nav__find" variant="plain" icon="search" label={tx('search')} onClick={(sf && sf.onOpen) || props.onSearch} />}
        {props.create && <Button variant="ghost" href={props.create.href} onClick={props.create.onClick}>{props.create.label || tx('create')}</Button>}
        {acct && (
          <button type="button" className="sk-nav__account" aria-label={acct.name ? tx('accountOf', { name: acct.name }) : tx('account')} onClick={acct.onClick}>
            {acct.image ? <img src={acct.image} alt="" /> : <span>{(acct.name || '?').split(' ').map((w) => w[0]).join('').slice(0, 2)}</span>}
          </button>
        )}
      </div>
    </header>
  );
}
