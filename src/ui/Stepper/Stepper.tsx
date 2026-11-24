import { Fragment } from 'react';
import { cx } from '../../internal/cx';
import { Icon } from '../Icon/Icon';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import '../../base.css';
import './Stepper.css';

export interface StepperProps {
  /** Step names, short nouns. */
  steps: string[];
  /** Index of the current step. */
  current: number;
  /** Accessible name, default "Steps". */
  label?: string;
  /** bar: the phone's form, a segment per step under the title. */
  variant?: 'steps' | 'bar';
  /** media: the bar drawn over a camera. */
  tone?: 'media';
  /** Extra class on the root element. */
  className?: string;
}

/**
 * Where a person is in a short multi-step flow: done steps get a check, the current one fills. Use it in the top bar of a
 * full-screen flow, three to five steps. Never for navigation between pages.
 *
 * Not for moving between the pages of a list (`Pagination`); a job's stages while it runs, with the time each took (`Stages`);
 * how far something being made has come (`Progress`); what a character is ready with (`Readiness`).
 *
 * Accessibility: Not focusable; an ordered list named by `label` (default "Steps"), each step read as its number and name, a
 * done one as "Done:" and its name, and the current one marked "current step". With `variant` "bar" it is a progress bar named
 * like "Step 2 of 4: Cast".
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function Stepper({ steps: given, current, label, variant, tone, className }: StepperProps) {
  const tx = useWords(ownWords);
  const steps = given || [], cur = Number(current || 0);
  if (variant === 'bar') {
    return (
      <div className={cx('sk-stepbar', tone === 'media' && 'is-media', className)} role="progressbar" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={cur + 1} aria-label={tx('stepOf', { n: cur + 1, total: steps.length, name: steps[cur] })}>
        <span className="sk-stepbar__track">{steps.map((_, i) => <i key={i} className={i <= cur ? 'is-done' : undefined} />)}</span>
        <span className="sk-stepbar__label">{tx('stepShown', { n: cur + 1, total: steps.length, name: steps[cur] })}</span>
      </div>
    );
  }
  return (
    <ol className={cx('sk-stepper', className)} aria-label={label || tx('steps')}>
      {steps.map((s, i) => {
        const state = i < cur ? 'done' : i === cur ? 'current' : 'todo';
        return (
          <Fragment key={s}>
            {i > 0 && <li className={cx('sk-stepper__sep', i <= cur && 'is-done')} aria-hidden="true" />}
            <li className={'sk-stepper__step sk-stepper__step--' + state} aria-current={state === 'current' ? 'step' : undefined}>
              <span className="sk-stepper__n">{state === 'done' ? [<Icon key="c" name="check" size="var(--stepper-check-icon-size)" />, <span key="d" className="sk-sr">{tx('stepDone') + ' '}</span>] : tx.num(i + 1)}</span>
              {s}
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
}
