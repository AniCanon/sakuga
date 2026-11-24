import { useEffect, useRef, useState, type MouseEventHandler } from 'react';
import { cx } from '../../internal/cx';
import { Glide, useGlide } from '../../internal/glide';
import { GoLink } from '../../internal/link';
import { Icon, type IconName } from '../Icon/Icon';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import '../../base.css';
import './TabBar.css';

export interface TabItem {
  /** The destination's name, under its icon. */
  label: string;
  /** Its icon. */
  icon: IconName;
  /** Where it goes. */
  href?: string;
  /** The destination open now. */
  current?: boolean;
  /** Its press, when it has no `href`. */
  onClick?: MouseEventHandler<HTMLElement>;
}

export interface TabBarProps {
  /** The app's main destinations, in order. */
  items: TabItem[];
  /** The phone browser's solid bar at the page's foot, with Create as a fifth labelled item. The apps' glass capsule stays native
   *  and is not part of the web package (docs/PORTING.md · Not ported), so the port draws only this form. */
  variant: 'web';
  /** Create as an action; `null` hides it. */
  onCreate?: MouseEventHandler<HTMLElement> | null;
  /** Names the Create button (default "Create"). */
  createLabel?: string;
  /** Create's address: on the web, Create is a page. */
  createHref?: string;
  /** Create is the current item (the Studio shell). */
  createCurrent?: boolean;
  /** Leaves the box tree: the player, the reader, a short playing. It also hides itself while a phone's keyboard is up. */
  hidden?: boolean;
  /** Names the bar for screen readers. */
  label?: string;
  /** Extra class on the root element. */
  className?: string;
}

const TYPING = 'input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="button"]):not([type="submit"]),textarea,select,[contenteditable="true"]';

/* A phone's keyboard is up while a text field has focus on a coarse pointer: a fixed bar can stay offset after it closes */
function useTyping(): boolean {
  const [typing, setTyping] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia || !window.matchMedia('(pointer: coarse)').matches) return undefined;
    const check = () => {
      const a = document.activeElement;
      setTyping(!!(a && a.matches && a.matches(TYPING)));
    };
    document.addEventListener('focusin', check);
    document.addEventListener('focusout', check);
    return () => {
      document.removeEventListener('focusin', check);
      document.removeEventListener('focusout', check);
    };
  }, []);
  return typing;
}

/**
 * TabBar is the phone's main navigation: a floating glass capsule with four destinations and a separate round Create button.
 *
 * Not for navigation on desktop (`TopNav`); switching between views of the same thing (`SegmentedControl`); choices that belong
 * to the current screen (`Sheet`).
 *
 * Accessibility: A navigation named by `label` (default "Tabs"): Tab moves through each destination, a link read by its text
 * with the current one marked "current page", then the round Create button, named by `createLabel` (default "Create"). In the
 * web form Create is the fifth link, marked "current page" when `createCurrent`. An item with no address is a button. Icons are
 * hidden.
 *
 * @version 1.1
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function TabBar({ items, variant, onCreate, createLabel, createHref, createCurrent, hidden, label, className }: TabBarProps) {
  const tx = useWords(ownWords);
  const bar = useRef<HTMLElement>(null), typing = useTyping();
  useGlide(bar, '.sk-tab[aria-current="page"]', false, [items, createCurrent]);
  const tab = (t: TabItem) => (
    <GoLink key={t.label} href={t.href} onClick={t.onClick} className="sk-tab" aria-current={t.current ? 'page' : undefined}>
      <Icon name={t.icon} size="var(--tabbar-item-icon-size)" />
      {t.label}
    </GoLink>
  );
  /* The glass capsule is the apps' (native); a page that asks for it here gets nothing rather than the web bar */
  if (variant !== 'web') return null;
  const create = onCreate !== null && (createHref || onCreate)
    && tab({ label: createLabel || tx('create'), icon: 'plus', href: createHref, onClick: onCreate || undefined, current: createCurrent });
  return (
    <div className={cx('sk-tabbar', 'is-web', className)} hidden={hidden || typing || undefined}>
      <nav ref={bar} className="sk-tabbar__bar" aria-label={label || tx('tabsNav')}>
        <Glide />
        {items.map(tab)}
        {create}
      </nav>
    </div>
  );
}
