import { Icon, type IconName } from '@anicanon/sakuga/ui';
import { cx } from '../../internal/cx';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import { EventGlyph, type EventType } from '../EventGlyph/EventGlyph';
import '../../base.css';
import './Mention.css';

/** Each kind's mark before the name; an event has none, its title is quoted. */
export const MENTION_MARK: Record<string, string> = { character: '@', place: '#', reference: '$', object: '&' };

export interface MentionProps {
  /** The mark: `character` writes @Name, `place` #Place, `reference` $alias, `object` &Thing; `event` quotes its title. */
  kind?: 'character' | 'place' | 'reference' | 'object' | 'event';
  /** Rings the mention: the one whose chip or card is open. */
  active?: boolean;
  /** Its picture before the name, at the size of the words, so the line keeps its height. */
  image?: string;
  /** A character with no portrait: its age figure (`age-adult`), never a bare name. */
  figure?: IconName;
  /** kind `event`: its type's glyph, as EventGlyph draws it. */
  type?: EventType;
  /** kind `event`: where it was told, quiet after the title ("Ep 3", "Manga"). */
  told?: string;
  /** Its reference left the take: drawn and read as missing. */
  missing?: boolean;
  /** The name as written, without its mark. */
  children: string;
}

/**
 * Mention is a reference inside prose: `@` a character (filled), `#` a place (underlined), `&` an object (a hairline box, never
 * broken across lines), an event as its glyph and quoted title. `image` puts its picture before the name at the size of the
 * words; `figure` stands for a character with no portrait. `active` rings the one whose card is open. `$` a reference the
 * creator added; its name is one word, so it never breaks at a hyphen. `missing` marks one whose reference left the take, in
 * the danger text with a wavy rule.
 *
 * Not for who or what a panel or a prompt binds, with its picture and note (`MentionChip`); a quiet action inside a line of
 * text (`TextLink`); words a check flagged inside a sentence (`Text`).
 *
 * Accessibility: Not focusable; read as text, its mark first ("@Aiko", "#Harbour", "&The red watch"), an event as its quoted
 * title and where it was told, the picture and glyph hidden, with "missing" after a `missing` one and "card open" after the
 * `active` one.
 *
 * @version 1.3
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function Mention({ kind = 'character', active, image, figure, type, told, missing, children }: MentionProps) {
  const tx = useWords(ownWords);
  const pic = image && kind !== 'event' ? <img className="sk-mention__img" src={image} alt="" />
    : figure && kind === 'character' ? <span className="sk-mention__img sk-mention__figure" aria-hidden="true"><Icon name={figure} size="var(--mention-img-size)" /></span> : null;
  return (
    <span className={cx('sk-mention', 'sk-mention--' + kind, pic && 'has-img', active && 'is-active', missing && 'is-missing')}>
      {kind === 'event' && <EventGlyph type={type || 'event'} size={12} className="sk-mention__glyph" />}
      {pic}
      {kind === 'event' ? '“' + children + '”' : (MENTION_MARK[kind] || '') + children}
      {kind === 'event' && told && <small className="sk-mention__told">{' · ' + told}</small>}
      {missing && <span className="sk-sr">{', ' + tx('missing')}</span>}
      {active && <span className="sk-sr">{', ' + tx('cardOpen')}</span>}
    </span>
  );
}
