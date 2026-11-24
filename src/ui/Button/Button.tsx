import { useEffect, useRef, useState, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ElementType, type MouseEvent, type ReactNode } from 'react';
import { cx } from '../../internal/cx';
import { announce } from '../../internal/live';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import { Icon, type IconName } from '../Icon/Icon';
import { useLoader } from '../../internal/loader';
import '../../base.css';
import '../Loader/Loader.css';
import './Button.css';

type Native = Omit<ButtonHTMLAttributes<HTMLButtonElement> & AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'className'>;

/** A value after the label, behind a hairline: what the action costs, in whatever unit the product counts. */
export interface ButtonTrailing {
  /** What sits after the label, behind the hairline ("~100"). */
  value: ReactNode;
  /** Drawn before the value, at buttonIconSize(size). It must hide itself from a screen reader (aria-hidden); the label speaks for it. */
  mark?: ReactNode;
  /** Read after the value, e.g. "fragments", so "~100" is heard as "~100 fragments". */
  label?: string;
}

export interface ButtonProps extends Native {
  /** media and media-secondary sit over video or artwork and never change with the theme.
   *  destructive: the one action that confirms a deletion or takes access away, in the dialog that asks for it. */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'media' | 'media-secondary' | 'destructive';
  /** `lg` for hero actions, `md` by default, `sm` for desktop-only secondary actions. */
  size?: 'sm' | 'md' | 'lg';
  /** pill on phones; rounded (radius-md) on desktop. */
  shape?: 'rounded' | 'pill';
  /** An icon before the label. */
  icon?: IconName;
  /** An icon after the label. */
  iconEnd?: IconName;
  /** Takes its column's width. */
  fullWidth?: boolean;
  /** A value after the label, behind the hairline: what the action costs, in whatever unit the product counts. AniCanon's fragment price is AniCanonKit.SpendButton. */
  trailing?: ButtonTrailing;
  /** Waiting on the server: the fill and the tab stop stay, a second press does nothing, and after --button-busy-delay the loader takes the icon's place. */
  busy?: boolean;
  /** What is happening while busy, the label's verb in -ing with its object: "Plan the shoot" → "Planning the shoot…". Shown and announced once. */
  busyLabel?: string;
  /** Announced when busy ends, when the screen itself says nothing new: "Shoot planned". */
  doneLabel?: string;
  /** Renders as another element, such as a router's link. */
  as?: ElementType;
  /** The label: what happens, in sentence case. */
  children?: ReactNode;
  /** Extra class on the root element. */
  className?: string;
}

/** The icon size a button of this size draws its icons and trailing mark at. */
export function buttonIconSize(size: ButtonProps['size'] = 'md'): string {
  return size === 'lg' ? 'var(--button-icon-size-lg)' : 'var(--button-icon-size)';
}

/* While busy the button keeps its fill and its place in the tab order but takes no press, so a second press can't send the
   action twice. Nothing changes for the first --button-busy-delay, so a quick answer never flickers; after it the loader
   takes the icon's place, busyLabel the words', and the button never narrows. A screen reader hears busyLabel once, and
   doneLabel when it ends; a wait shorter than the delay says nothing. */
function useBusy(busy: boolean, ref: { current: HTMLElement | null }, words: string, done?: string) {
  const [shown, setShown] = useState(false);
  const width = useRef(0), was = useRef(false), said = useRef({ words, done });
  /* the words as they are when the timer fires, not when it was set */
  said.current = { words, done };
  useEffect(() => {
    if (!busy) {
      if (was.current && said.current.done) announce(said.current.done);
      was.current = false;
      setShown(false);
      return undefined;
    }
    const el = ref.current;
    const ms = parseFloat(el ? getComputedStyle(el).getPropertyValue('--button-busy-delay') : '') || 0;
    width.current = el ? el.getBoundingClientRect().width : 0;
    const t = setTimeout(() => {
      was.current = true;
      setShown(true);
      if (said.current.words) announce(said.current.words);
    }, ms);
    return () => clearTimeout(t);
  }, [busy]);
  return { shown: busy && shown, width: width.current };
}

const drop = (e: MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
};

/**
 * Button runs an action with a text label: Play, Follow, Remind me, Done.
 *
 * Not for an action inside a sentence or a row of text (`TextLink`); an action that one glyph says better than a word
 * (`IconButton`); narrowing what a feed shows (`Chip`); switching between views of the same thing (`SegmentedControl`); a
 * choice whose options each need a picture or a line of explanation (`OptionTiles`); signing in with Apple or Google
 * (`ProviderButton`); an action that spends fragments (AniCanonKit's `SpendButton`).
 *
 * Accessibility: A native button (a link with `href`): Tab reaches it, Enter activates it, and Space does too on a button;
 * `disabled` takes a button out of the tab order. A screen reader hears its text (or `aria-label`), with `trailing`'s value and
 * its `label` read after it ("~100 fragments"); icons and the mark are hidden. With `href` and `disabled` it is drawn as a
 * disabled button, out of the tab order, since a link cannot be disabled. With `busy` it keeps focus and its place in the tab
 * order but is `aria-disabled`, so Enter, Space and a click do nothing; after the delay a screen reader hears `busyLabel` once
 * (or "Save, working" without it), and `doneLabel` when it ends; a wait shorter than the delay says nothing. In forced colours
 * it keeps an edge in ButtonText, and a disabled one turns GrayText.
 *
 * @version 1.2
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function Button({ variant = 'primary', size = 'md', shape, icon, iconEnd, fullWidth, trailing, busy: busyProp, busyLabel, doneLabel, as, className, children, ...rest }: ButtonProps) {
  const AppLoader = useLoader();
  const tx = useWords(ownWords);
  const ref = useRef<HTMLElement>(null);
  /* A disabled link is drawn as a disabled button: an anchor cannot be disabled, and would stay focusable and clickable */
  const link = !!rest.href && !rest.disabled;
  if (!link) delete rest.href;
  const Tag: ElementType = as || (link ? 'a' : 'button');
  if (Tag === 'button' && rest.type === undefined) rest.type = 'button';
  const iconSize = buttonIconSize(size);
  const busy = !!busyProp && !rest.disabled;
  const named = rest['aria-label'] || (typeof children === 'string' ? children : '');
  const b = useBusy(busy, ref, busyLabel || (named ? tx('busyItem', { label: named }) : ''), doneLabel);
  const held = busy ? { 'aria-disabled': true as const, onClick: drop, style: b.shown && b.width ? { minWidth: b.width, ...rest.style } : rest.style } : {};
  const lead = b.shown ? (
    <span className="sk-btn__loader" aria-hidden="true">
      <AppLoader size="var(--button-busy-loader-size)" />
    </span>
  ) : (
    icon && <Icon name={icon} size={iconSize} />
  );
  return (
    <Tag
      ref={ref}
      className={cx('sk-btn', 'sk-btn--' + variant, 'sk-btn--' + size, shape === 'pill' && 'sk-btn--pill', fullWidth && 'sk-btn--full', busy && 'is-busy', className)}
      {...rest}
      {...held}
    >
      {lead}
      {b.shown && busyLabel ? busyLabel : children}
      {!b.shown && iconEnd && <Icon name={iconEnd} size={iconSize} />}
      {trailing && (
        <span className="sk-btn__cost">
          {trailing.mark}
          {trailing.value}
          {trailing.label && <span className="sk-sr">{' ' + trailing.label}</span>}
        </span>
      )}
    </Tag>
  );
}
