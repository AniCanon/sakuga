/* A scene's Markdown read as screenplay blocks and written back: `## SLUG`, then blocks parted by a blank line (action; a cue, its
   (parenthetical) and its dialogue; a transition), cast mentions as @[Name:id]. */

export type BlockKind = 'slug' | 'action' | 'cue' | 'paren' | 'dialogue' | 'transition';

export interface ScreenplayBlock {
  id: number;
  type: BlockKind;
  text: string;
}

/** Someone or somewhere @ or # can name. */
export interface ScreenplayMention {
  /** What its token carries (@[Name:id]). */
  id: string;
  /** Its name, as typed after @ or #. */
  name: string;
  /** Its picture in the list. */
  image?: string;
}

/** The kind Enter starts after a block of each kind. */
export const NEXT_KIND: Record<BlockKind, BlockKind> = { slug: 'action', action: 'action', cue: 'dialogue', paren: 'dialogue', dialogue: 'action', transition: 'slug' };
/** The order Tab moves a block's kind through. */
export const KIND_CYCLE: BlockKind[] = ['action', 'cue', 'paren', 'dialogue', 'transition', 'slug'];

let lastId = 0;
/** A new block id, unique for the page's life. */
export const nextId = () => ++lastId;

/** The scene's Markdown as blocks; an empty scene is one empty heading. */
export function parseScreenplay(md: string | null | undefined): ScreenplayBlock[] {
  let text = String(md || '').replace(/\r/g, '').replace(/@\[([^\]:\n]+):[^\]\n]*\]/g, '@$1');
  const out: Omit<ScreenplayBlock, 'id'>[] = [];
  const head = text.match(/^##[ \t]+(.*)(\n|$)/);
  if (head) { out.push({ type: 'slug', text: head[1].trim() }); text = text.slice(head[0].length); }
  text.split(/\n[\t ]*\n+/).forEach((raw) => {
    const block = raw.replace(/^\n+|\n+$/g, '');
    if (!block.trim()) return;
    const ls = block.split('\n'), first = ls[0].trim();
    if (ls.length === 1 && /^(INT\.|EXT\.|INT\.?\s*\/\s*EXT\.?|EXT\.?\s*\/\s*INT\.?|I\/E\.)\s+/i.test(first)) { out.push({ type: 'slug', text: first }); return; }
    if (/^(CUT TO:|DISSOLVE TO:|SMASH CUT TO:|FADE IN:|FADE OUT\.?|FADE TO BLACK\.?)$/i.test(first)) { out.push({ type: 'transition', text: first }); return; }
    const explicit = first.charAt(0) === '@' && first.slice(-1) === ':', traditional = /^[\p{Lu}\d][\p{Lu}\d .’'()-]+$/u.test(first);
    if (ls.length > 1 && (explicit || traditional)) {
      out.push({ type: 'cue', text: first.replace(/:$/, '') });
      const rest = ls.slice(1);
      if (/^\(.*\)$/.test((rest[0] || '').trim())) out.push({ type: 'paren', text: rest.shift()!.trim().replace(/^\(|\)$/g, '') });
      out.push({ type: 'dialogue', text: rest.join('\n') });
      return;
    }
    out.push({ type: 'action', text: block });
  });
  if (!out.length) out.push({ type: 'slug', text: '' });
  return out.map((l) => ({ id: nextId(), ...l }));
}

/** A typed @Name that is a cast member, saved as its token, the longest name first. */
function tokens(text: string, cast: ScreenplayMention[]): string {
  const byLength = cast.slice().sort((a, b) => b.name.length - a.name.length);
  byLength.forEach((c) => { text = text.split('@' + c.name).join('\u0000' + c.id + '\u0001'); });
  byLength.forEach((c) => { text = text.split('\u0000' + c.id + '\u0001').join('@[' + c.name + ':' + c.id + ']'); });
  return text;
}

/** The blocks as the scene's Markdown. */
export function serializeScreenplay(lines: ScreenplayBlock[], cast: ScreenplayMention[] = []): string {
  const out: string[] = [];
  let i = 0;
  if (lines[0] && lines[0].type === 'slug') { out.push('## ' + lines[0].text.trim()); i = 1; }
  for (; i < lines.length; i++) {
    const l = lines[i];
    if (l.type === 'cue') {
      const b = [l.text.trim().charAt(0) === '@' ? l.text.trim() + ':' : l.text.trim().toUpperCase()];
      if (lines[i + 1] && lines[i + 1].type === 'paren') b.push('(' + lines[++i].text.trim() + ')');
      b.push(lines[i + 1] && lines[i + 1].type === 'dialogue' ? lines[++i].text : '');
      out.push(b.join('\n'));
    } else if (l.type === 'paren') out.push('(' + l.text.trim() + ')');
    else if (l.type === 'transition') out.push(l.text.trim().toUpperCase());
    else if (l.text.trim() || l.type === 'action') out.push(l.text);
  }
  return tokens(out.filter((s) => s !== '').join('\n\n'), cast);
}

/** Where the caret is in [el]'s text, or 0 when it is elsewhere. */
export function caretOf(el: HTMLElement): number {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount || !el.contains(sel.anchorNode)) return 0;
  const r = sel.getRangeAt(0).cloneRange();
  r.selectNodeContents(el);
  r.setEnd(sel.anchorNode!, sel.anchorOffset);
  return r.toString().length;
}

/** Focuses [el] with the caret [at] characters in (its end when past it). */
export function placeCaret(el: HTMLElement, at: number) {
  el.focus();
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), sel = window.getSelection(), r = document.createRange();
  let left = at;
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    const len = (n.nodeValue || '').length;
    if (left <= len) { r.setStart(n, left); r.collapse(true); sel?.removeAllRanges(); sel?.addRange(r); return; }
    left -= len;
  }
  r.selectNodeContents(el);
  r.collapse(false);
  sel?.removeAllRanges();
  sel?.addRange(r);
}
