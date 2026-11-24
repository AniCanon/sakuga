import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { cx } from '../../internal/cx';
import { useUid } from '../../internal/uid';
import { useWords, type SakugaMessages } from '../../internal/words';
import { words as ownWords } from './words';
import { Icon } from '@anicanon/sakuga/ui';
import { KIND_CYCLE, NEXT_KIND, caretOf, nextId, parseScreenplay, placeCaret, serializeScreenplay, type BlockKind, type ScreenplayBlock, type ScreenplayMention } from './screenplay';
import '../../base.css';
import '../ScreenplayLine/ScreenplayLine.css';
import './ScreenplayEditor.css';

export type { BlockKind, ScreenplayMention } from './screenplay';

export interface ScreenplayEditorProps {
  /** The scene's Markdown: `## SLUG`, then blocks parted by a blank line; cast mentions as @[Name:id]. */
  value: string;
  /** Called with the scene's Markdown at every change. */
  onChange?: (value: string) => void;
  /** Who @ and # can name; a typed @Name of the cast is saved as its token. */
  mentions?: { cast?: ScreenplayMention[]; places?: ScreenplayMention[] };
  /** Words shown in an empty line, by kind ("INT. or EXT. · the place · the time"). */
  placeholders?: Partial<Record<BlockKind, string>>;
  /** Called with the kind of the line being written as it changes (focus, Enter, Tab): a toolbar can show it. */
  onKind?: (kind: BlockKind) => void;
  /** A kind asked for from outside (a toolbar): the line last written in takes it, the caret where it was. */
  kind?: BlockKind;
  /** Names the group (default "Script"). */
  label?: string;
  /** Extra class on the root element. */
  className?: string;
}

const KIND_WORD: Record<BlockKind, keyof SakugaMessages> = {
  slug: 'blockSlug', action: 'blockAction', cue: 'blockCue', paren: 'blockParen', dialogue: 'blockDialogue', transition: 'blockTransition',
};

/** The mention list open under a line: which line, the trigger, the run it replaces and the matches. */
interface Lookup {
  i: number;
  trigger: '@' | '#';
  start: number;
  end: number;
  items: ScreenplayMention[];
  active: number;
}

/* The page's mentions, in Mention's colours: one highlight each for the cast and the places, shared by every editor on the page */
let castMarks: Highlight | null = null, placeMarks: Highlight | null = null;

/**
 * ScreenplayEditor is a scene written on the page: each block is a `ScreenplayLine` of its kind, typed in place, with no box around
 * the words. It reads and writes the scene's Markdown.
 *
 * Not for a scene that only reads (`ScreenplayLine`s); the prompt that makes a take (`PromptComposer`); a plain multi-line field
 * (`TextField`).
 *
 * Accessibility: A group named by `label` (default "Script") and described by its keys ("Enter starts the next block, … Escape,
 * then Tab, leaves the script"). Each block is a textbox named by its kind ("Scene heading", "Action", "Character",
 * "Parenthetical", "Dialogue", "Transition"), multi-line for action and dialogue, one Tab stop for the whole script (the block last
 * written in). A change of kind is said in a polite live region. The mention list is a listbox the line controls, its active
 * option the line's active descendant.
 *
 * @version 1.0
 * @see README.md for when to use it, its states and its accessibility in full.
 */
export function ScreenplayEditor(props: ScreenplayEditorProps) {
  const tx = useWords(ownWords), help = useUid('sk-sped') + '-help';
  const [lines, setLines] = useState<ScreenplayBlock[]>(() => parseScreenplay(props.value));
  const last = useRef(props.value), box = useRef<HTMLDivElement>(null);
  const focusAt = useRef<{ i: number; at: number } | null>(null), current = useRef(0), leaving = useRef(false);
  const [said, setSaid] = useState('');
  const [list, setList] = useState<Lookup | null>(null);
  const lastCaret = useRef(0), told = useRef<BlockKind | null>(null);
  const cast = props.mentions?.cast || [];
  const tell = (kind: BlockKind | undefined) => { if (kind && props.onKind && kind !== told.current) { told.current = kind; props.onKind(kind); } };
  const say = (kind: BlockKind) => setSaid(tx('blockNow', { kind: tx(KIND_WORD[kind]) }));

  /* The lines as written: each block's text read from the page, where typing put it */
  const read = () => lines.map((l, i) => {
    const el = box.current?.querySelector<HTMLElement>(`[data-i="${i}"]`);
    return { ...l, text: el ? el.textContent || '' : l.text };
  });
  const emit = (ls: ScreenplayBlock[]) => { const md = serializeScreenplay(ls, cast); last.current = md; props.onChange?.(md); };
  const commit = (ls: ScreenplayBlock[], at: { i: number; at: number }) => { focusAt.current = at; setLines(ls); emit(ls); };

  /* A kind asked for from a toolbar: the line last written in takes it, the caret where it was */
  useEffect(() => {
    if (!props.kind) return;
    const i = current.current, l = lines[i];
    if (!l || l.type === props.kind || props.kind === told.current) return;
    const ls = read();
    ls[i] = { ...ls[i], type: props.kind, id: nextId() };
    told.current = props.kind;
    say(props.kind);
    commit(ls, { i, at: lastCaret.current });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.kind]);
  /* A value from outside (a load, an undo) replaces the lines; the value this editor wrote does not */
  useEffect(() => { if (props.value !== last.current) { last.current = props.value; setLines(parseScreenplay(props.value)); } }, [props.value]);
  useLayoutEffect(() => {
    const f = focusAt.current;
    focusAt.current = null;
    if (!f || !box.current) return;
    const el = box.current.querySelector<HTMLElement>(`[data-i="${f.i}"]`);
    if (el) { current.current = f.i; placeCaret(el, f.at); }
  });
  /* Mentions drawn over the live words, in Mention's colours */
  useEffect(() => {
    const root = box.current;
    const css = (globalThis as { CSS?: { highlights?: Map<string, Highlight> } }).CSS;
    if (!root || typeof Highlight === 'undefined' || !css?.highlights) return;
    castMarks = castMarks || new Highlight();
    placeMarks = placeMarks || new Highlight();
    css.highlights.set('sk-sp-cast', castMarks);
    css.highlights.set('sk-sp-place', placeMarks);
    const names = (k: 'cast' | 'places', mark: string) => (props.mentions?.[k] || []).map((m) => mark + m.name).sort((a, b) => b.length - a.length);
    let mine: [Highlight, Range][] = [];
    const paint = () => {
      mine.forEach(([hl, r]) => hl.delete(r));
      mine = [];
      root.querySelectorAll('.sk-sped__line').forEach((el) => {
        const t = el.firstChild;
        if (!t || t.nodeType !== 3) return;
        ([[names('cast', '@'), castMarks!], [names('places', '#'), placeMarks!]] as [string[], Highlight][]).forEach(([all, hl]) => {
          all.forEach((nm) => {
            let at = 0, k: number;
            while ((k = (t.nodeValue || '').indexOf(nm, at)) >= 0) {
              const r = document.createRange();
              r.setStart(t, k);
              r.setEnd(t, k + nm.length);
              hl.add(r);
              mine.push([hl, r]);
              at = k + nm.length;
            }
          });
        });
      });
    };
    paint();
    root.addEventListener('input', paint);
    return () => { root.removeEventListener('input', paint); mine.forEach(([hl, r]) => hl.delete(r)); };
  });

  /* @ or # at the start of a word opens the cast or the places under the line */
  function lookUp(el: HTMLElement, i: number) {
    const at = caretOf(el), before = (el.textContent || '').slice(0, at), m = before.match(/([@#])([\p{L}\p{N}’' -]{0,30})$/u);
    if (!m || (m.index! > 0 && !/\s|\(/.test(before.charAt(m.index! - 1)))) { if (list) setList(null); return; }
    const pool = props.mentions?.[m[1] === '@' ? 'cast' : 'places'] || [], q = m[2].toLowerCase();
    const items = pool.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 8);
    setList(items.length ? { i, trigger: m[1] as '@' | '#', start: m.index!, end: at, items, active: 0 } : null);
  }
  function choose(item: ScreenplayMention) {
    if (!list) return;
    const ls = read(), l = ls[list.i], text = l.text.slice(0, list.start) + list.trigger + item.name + ' ' + l.text.slice(list.end);
    ls[list.i] = { ...l, text, id: nextId() };
    setList(null);
    commit(ls, { i: list.i, at: list.start + item.name.length + 2 });
  }
  function keys(e: KeyboardEvent<HTMLDivElement>, i: number) {
    const el = e.currentTarget;
    if (list && list.i === i) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const n = list.items.length;
        setList({ ...list, active: (list.active + (e.key === 'ArrowDown' ? 1 : n - 1)) % n });
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); choose(list.items[list.active]); return; }
      if (e.key === 'Escape') { e.preventDefault(); setList(null); return; }
    }
    /* Escape, then Tab, leaves the script: inside it Tab changes a block's kind */
    if (e.key === 'Escape') { leaving.current = true; setSaid(''); return; }
    if (e.key === 'Tab' && !leaving.current) {
      e.preventDefault();
      const ls = read(), l = ls[i];
      const k = KIND_CYCLE.indexOf(l.type), next = KIND_CYCLE[(k + (e.shiftKey ? KIND_CYCLE.length - 1 : 1)) % KIND_CYCLE.length];
      ls[i] = { ...l, type: next, id: nextId() };
      say(next);
      tell(next);
      commit(ls, { i, at: caretOf(el) });
      return;
    }
    if (e.key === 'Enter' && e.shiftKey) { e.preventDefault(); document.execCommand('insertText', false, '\n'); return; }
    if (e.key === 'Enter') {
      e.preventDefault();
      const ls = read(), l = ls[i], at = caretOf(el);
      const head = l.text.slice(0, at), tail = l.text.slice(at);
      let type = NEXT_KIND[l.type];
      /* An action that begins INT. or EXT. becomes a heading on Enter */
      if (l.type === 'action' && /^(INT\.|EXT\.|I\/E\.)\s+/i.test(head.trim()) && !head.includes('\n')) { ls[i] = { ...l, type: 'slug', text: head, id: nextId() }; type = 'action'; }
      else ls[i] = { ...l, text: head, id: nextId() };
      ls.splice(i + 1, 0, { id: nextId(), type, text: tail });
      tell(type);
      say(type);
      commit(ls, { i: i + 1, at: 0 });
      return;
    }
    if (e.key === 'Backspace' && i > 0 && caretOf(el) === 0 && window.getSelection()?.isCollapsed) {
      e.preventDefault();
      const ls = read(), prev = ls[i - 1], join = prev.text.length;
      ls[i - 1] = { ...prev, text: prev.text + ls[i].text, id: nextId() };
      ls.splice(i, 1);
      commit(ls, { i: i - 1, at: join });
      return;
    }
    if (e.key === 'ArrowUp' && i > 0 && caretOf(el) === 0) {
      e.preventDefault();
      const pe = box.current?.querySelector<HTMLElement>(`[data-i="${i - 1}"]`);
      if (pe) placeCaret(pe, (pe.textContent || '').length);
      return;
    }
    if (e.key === 'ArrowDown' && i < lines.length - 1 && caretOf(el) === (el.textContent || '').length) {
      e.preventDefault();
      const ne = box.current?.querySelector<HTMLElement>(`[data-i="${i + 1}"]`);
      if (ne) placeCaret(ne, 0);
    }
  }

  const listId = help + '-list';
  const listTop = () => {
    const el = list && box.current?.querySelector<HTMLElement>(`[data-i="${list.i}"]`);
    return el ? el.offsetTop + el.offsetHeight + 'px' : 0;
  };
  return (
    <div ref={box} className={cx('sk-sped', props.className)} role="group" aria-label={props.label || tx('screenplayScript')} aria-describedby={help}>
      {lines.map((l, i) => (
        <div key={l.id} data-i={i} className={cx('sk-spl', 'sk-spl--' + l.type, 'sk-sped__line', !l.text && 'is-empty')}
          contentEditable suppressContentEditableWarning role="textbox" aria-multiline={l.type === 'action' || l.type === 'dialogue' ? 'true' : 'false'}
          aria-label={tx(KIND_WORD[l.type])} tabIndex={i === current.current ? 0 : -1} spellCheck
          data-placeholder={props.placeholders?.[l.type] || undefined}
          aria-controls={list && list.i === i ? listId : undefined} aria-activedescendant={list && list.i === i ? listId + '-' + list.active : undefined}
          onFocus={() => { current.current = i; leaving.current = false; tell(lines[i]?.type); }}
          onKeyUp={(e) => { lastCaret.current = caretOf(e.currentTarget); }}
          onMouseUp={(e) => { lastCaret.current = caretOf(e.currentTarget); }}
          onBlur={() => { if (list && list.i === i) setTimeout(() => setList(null), 120); }}
          onKeyDown={(e) => keys(e, i)}
          onInput={(e) => { const el = e.currentTarget; el.classList.toggle('is-empty', !el.textContent); emit(read()); lookUp(el, i); }}>{l.text}</div>
      ))}
      {list && (
        <div id={listId} role="listbox" className="sk-sped__list" style={{ top: listTop() }}>
          {list.items.map((it, k) => (
            <div key={it.id || it.name} id={listId + '-' + k} role="option" aria-selected={k === list.active ? 'true' : 'false'} className={cx('sk-sped__opt', k === list.active && 'is-active')}
              onMouseDown={(e) => { e.preventDefault(); choose(it); }}>
              {it.image ? <img src={it.image} alt="" /> : <Icon name={list.trigger === '@' ? 'characters' : 'backdrops'} size={16} />}
              <span>{list.trigger + it.name}</span>
            </div>
          ))}
        </div>
      )}
      <span id={help} className="sk-sr">{tx('screenplayHelp')}</span>
      <span className="sk-sr" aria-live="polite">{said}</span>
    </div>
  );
}
