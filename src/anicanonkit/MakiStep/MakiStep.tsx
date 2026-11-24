import { useState, type ReactNode } from 'react';
import { Icon } from '@anicanon/sakuga/ui';
import { cx } from '../../internal/cx';
import { AniCanonLoader } from '../AniCanonLoader/AniCanonLoader';
import '../../base.css';
import './MakiStep.css';

export interface MakiStepProps {
  /** What Maki is doing or did ("Read the story"). */
  label: string;
  /** Quiet, after a middle dot ("26 events"). */
  detail?: string;
  /** Done: a check; else Maki's loader. */
  done?: boolean;
  /** Opens showing its children. */
  open?: boolean;
  /** What the step shows when opened (which events she read). */
  children?: ReactNode;
}

/* One line of what Maki is doing or did: "Reading the story · 26 events". While it runs, Maki's loader; done, a check. With
   children it opens to show them. */
/**
 * MakiStep is one line of what Maki is doing or did, at the top of her reply: "Read the story · 26 events". While it runs, Maki's
 * loader; done, a check. `detail` follows quietly after a middle dot. With children it opens on a press to show them.
 *
 * Not for Maki's answer itself (`MakiTurn`); a job running elsewhere (`ActivityRow`).
 *
 * Accessibility: Read as text; a step that opens is a button, expanded or collapsed. A running step's loader says its label once.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function MakiStep(props: MakiStepProps) {
  const [open, setOpen] = useState(!!props.open);
  const mark = props.done ? <Icon name="check" size="var(--mk-step-icon-size)" /> : <AniCanonLoader size="var(--mk-step-icon-size)" label={props.label} />;
  const words = [
    <span key="m" className="sk-mk-step__mark" aria-hidden={props.done ? 'true' : undefined}>{mark}</span>,
    <span key="l">{props.label}</span>,
    props.detail && <span key="d" className="sk-mk-step__detail">{props.detail}</span>,
    props.children && <Icon key="c" name={open ? 'chevron-up' : 'chevron-down'} size="var(--mk-step-icon-size)" />,
  ];
  return (
    <div className={cx('sk-mk-step', props.done && 'is-done')}>
      {props.children
        ? <button type="button" className="sk-mk-step__line" aria-expanded={open ? 'true' : 'false'} onClick={() => setOpen(!open)}>{words}</button>
        : <span className="sk-mk-step__line">{words}</span>}
      {open && props.children && <div className="sk-mk-step__more">{props.children}</div>}
    </div>
  );
}
