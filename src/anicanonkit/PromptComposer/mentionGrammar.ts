/* The words a prompt is saved as, read and written exactly as the server reads them (AgentPromptSyntax.kt in anime-studio, pinned
   by its agent-prompt-parity corpus). A mention is a token, @[label:category:id], whose id carries the outfit as :outfit:<id>; a
   $alias is plain text the server reads itself. The label is decoration and the id binds, so a label that would break the token
   (a : or a ]) is never written as one. */

export type MentionCategory = 'character' | 'location' | 'backdrop' | 'faction' | 'object';

export interface StoredMention {
  label: string;
  category: MentionCategory;
  id: string;
  /** A character's outfit, chosen with the mention. */
  outfitId?: string;
}

export type PromptSegment = { t: 'text'; text: string } | ({ t: 'mention' } & StoredMention) | { t: 'alias'; alias: string };

const CATEGORIES: MentionCategory[] = ['character', 'location', 'backdrop', 'faction', 'object'];
/* `[` is kept out of the body, so an unterminated @[ stays text and never swallows the token after it */
const TOKEN = /@\[([^[\]\n]+)\]/y;
const ALIAS = /\$([A-Za-z](?:[A-Za-z0-9._:-]*[A-Za-z0-9])?)/y;
const OUTFIT = ':outfit:';

const isWordChar = (c: string | undefined) => !!c && /[A-Za-z0-9_]/.test(c);

export function isSafeLabel(label: string) {
  return !!label && !label.includes(':') && !label.includes(']');
}

function readToken(body: string): StoredMention | null {
  const parts = body.split(':');
  if (parts.length < 2 || !parts[0]) return null;
  const typed = parts.length >= 3;
  let category: MentionCategory, id: string;
  if (typed && CATEGORIES.includes(parts[1] as MentionCategory)) { category = parts[1] as MentionCategory; id = parts.slice(2).join(':'); }
  else if (typed && CATEGORIES.includes(parts[parts.length - 1] as MentionCategory)) { category = parts[parts.length - 1] as MentionCategory; id = parts.slice(1, -1).join(':'); }
  else { category = 'character'; id = parts.slice(1).join(':'); }
  if (!id) return null;
  if (category === 'character') {
    const at = id.indexOf(OUTFIT);
    if (at > 0 && at + OUTFIT.length < id.length) return { label: parts[0], category, id: id.slice(0, at), outfitId: id.slice(at + OUTFIT.length) };
  }
  return { label: parts[0], category, id };
}

/** A saved prompt as text, mentions and $aliases, in order. Text runs are merged, so a run never follows another. */
export function parsePrompt(stored: string): PromptSegment[] {
  const out: PromptSegment[] = [];
  let text = '';
  const flush = () => { if (text) { out.push({ t: 'text', text }); text = ''; } };
  for (let i = 0; i < stored.length;) {
    if (stored[i] === '@' && stored[i + 1] === '[') {
      TOKEN.lastIndex = i;
      const m = TOKEN.exec(stored), token = m && readToken(m[1]);
      if (m && token) { flush(); out.push({ t: 'mention', ...token }); i += m[0].length; continue; }
    }
    if (stored[i] === '$' && !isWordChar(stored[i - 1])) {
      ALIAS.lastIndex = i;
      const m = ALIAS.exec(stored);
      if (m) { flush(); out.push({ t: 'alias', alias: m[1] }); i += m[0].length; continue; }
    }
    text += stored[i++];
  }
  flush();
  return out;
}

/** The saved form of one mention, or its visible text when its label can't be a token. */
export function formatMention(m: StoredMention) {
  if (!isSafeLabel(m.label)) return (m.category === 'character' || m.category === 'faction' ? '@' : m.category === 'object' ? '&' : '#') + m.label;
  const id = m.category === 'character' && m.outfitId ? m.id + OUTFIT + m.outfitId : m.id;
  return '@[' + m.label + ':' + m.category + ':' + id + ']';
}

export function formatPrompt(segments: PromptSegment[]) {
  return segments.map((s) => (s.t === 'text' ? s.text : s.t === 'alias' ? '$' + s.alias : formatMention(s))).join('');
}

/** Who a loose @Name or #Place can be: the cast with their outfits, and the places. */
export interface MentionRoster {
  cast?: { id: string; name: string; outfits?: { id: string; label: string }[] }[];
  places?: { id: string; name: string; category?: 'backdrop' | 'location'; views?: { id: string; name: string }[] }[];
}

interface Candidate { label: string; mention: Omit<StoredMention, 'label'> }

/* A loose @Name or #Place that is exactly a roster name becomes its token, as the server's portal path expects: it reads only tokens.
   The longest name wins ("Smith (School Uniform)" over "Smith", "Ann Marie" over "Ann"), matched without case and written in the
   casing typed; a name glued to a word on either side, or one that can't be a token, stays text. Tokens already there are kept as
   they are. */
export function bindLoose(stored: string, roster: MentionRoster) {
  const cast: Candidate[] = [], places: Candidate[] = [];
  for (const c of roster.cast || []) {
    cast.push({ label: c.name, mention: { category: 'character', id: c.id } });
    for (const o of c.outfits || []) cast.push({ label: c.name + ' (' + o.label + ')', mention: { category: 'character', id: c.id, outfitId: o.id } });
  }
  /* A place with views is never saved itself: its views bind by their names, and a place with one view by its own name too */
  for (const p of roster.places || []) {
    const views = p.views || [];
    if (!views.length) places.push({ label: p.name, mention: { category: p.category || 'backdrop', id: p.id } });
    else if (views.length === 1) places.push({ label: p.name, mention: { category: 'backdrop', id: views[0].id } });
    for (const v of views) places.push({ label: v.name, mention: { category: 'backdrop', id: v.id } });
  }
  /* Longest first; a stable sort keeps roster order between equal lengths, so a duplicated name binds the first */
  [cast, places].forEach((list) => list.sort((a, b) => b.label.length - a.label.length));
  let out = '';
  for (let i = 0; i < stored.length;) {
    if (stored[i] === '@' && stored[i + 1] === '[') {
      TOKEN.lastIndex = i;
      const m = TOKEN.exec(stored);
      if (m && readToken(m[1])) { out += m[0]; i += m[0].length; continue; }
    }
    const c = stored[i];
    if ((c === '@' || c === '#') && !isWordChar(stored[i - 1])) {
      const rest = stored.slice(i + 1).toLowerCase();
      const hit = (c === '@' ? cast : places).find((x) => rest.startsWith(x.label.toLowerCase()) && !isWordChar(stored[i + 1 + x.label.length]));
      if (hit) {
        const typed = stored.slice(i + 1, i + 1 + hit.label.length);
        out += isSafeLabel(typed) ? formatMention({ label: typed, ...hit.mention }) : c + typed;
        i += 1 + hit.label.length;
        continue;
      }
    }
    out += stored[i++];
  }
  return out;
}
