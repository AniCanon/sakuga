import type { ElementType, ReactNode } from 'react';
import { cx } from '../../internal/cx';
import '../../base.css';
import './Text.css';

export type TextVariant = 'display' | 'title-1' | 'title-2' | 'title-3' | 'title-4' | 'lead' | 'body' | 'label' | 'caption' | 'small' | 'micro' | 'eyebrow';

/** A type style from the scale; tone changes only the colour. With no variant it only sets a tone, inside other text. */
export interface TextProps {
  /** display: a name that is the page (64 px); lead: the paragraph that introduces it (18/28). */
  variant?: TextVariant;
  /** Its colour: primary, secondary, muted, accent, or on-media and on-media-muted over art. */
  tone?: 'primary' | 'secondary' | 'muted' | 'accent' | 'on-media' | 'on-media-muted';
  /** Tabular figures. */
  numeric?: boolean;
  /** Highlights the words: what a check flagged or a selection (true); what writing states or implies ('stated', 'inferred'). */
  mark?: boolean | 'stated' | 'inferred';
  /** The element it renders as (default by variant: p, span, a heading). */
  as?: ElementType;
  /** The root element's id. */
  id?: string;
  /** The words. */
  children?: ReactNode;
  /** Extra class on the root element. */
  className?: string;
}

/* Type from the scale: a variant names a type style; tone overrides its colour. With no variant it only sets the tone, inside other text. */
const TEXT_TAGS: Record<TextVariant, ElementType> = { display: 'h1', lead: 'p', 'title-1': 'h1', 'title-2': 'h2', 'title-3': 'h3', 'title-4': 'h3', body: 'p', label: 'span', caption: 'p', small: 'span', micro: 'span', eyebrow: 'span' };

/**
 * Text sets words in Sakuga's type scale: a `variant` names the style, `tone` changes only its colour.
 *
 * Not for a subtitle line over video (`Caption`); an action inside a line of text (`TextLink`); a character or a place named
 * inside prose (`Mention`); a proposed change in the words, the old struck and the new underlined (`Revision`); the heading
 * that opens a shelf (`SectionHeader`).
 *
 * Accessibility: Not focusable; read as text, with display and title variants rendered as headings (h1 to h3), lead, body and
 * caption as paragraphs, and `mark` as highlighted text, unless `as` sets the element. `tone` changes only the colour.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function Text({ variant: v, tone, numeric, mark, as, id, children, className }: TextProps) {
  const Tag: ElementType = as || (mark ? 'mark' : v ? TEXT_TAGS[v] || 'span' : 'span');
  return (
    <Tag
      id={id}
      className={cx('sk-text', v && 'sk-text--' + v, tone && 'is-' + tone, numeric && 'is-numeric', mark && 'is-mark', typeof mark === 'string' && 'is-mark--' + mark, className)}
    >
      {children}
    </Tag>
  );
}
