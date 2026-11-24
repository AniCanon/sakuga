import { useLayoutEffect, useMemo, useRef, useState, type MutableRefObject, type ReactNode, type RefObject } from 'react';
import { IconButton, Popover, Text, type IconName } from '@anicanon/sakuga/ui';
import { createPortal } from 'react-dom';
import {
  $createLineBreakNode, $createParagraphNode, $createTextNode, $getNodeByKey, $getRoot, $getSelection, $isElementNode, $isRangeSelection, $isTextNode, $setSelection, COMMAND_PRIORITY_HIGH,
  createEditor, KEY_ARROW_DOWN_COMMAND, KEY_ARROW_LEFT_COMMAND, KEY_ARROW_RIGHT_COMMAND, KEY_ARROW_UP_COMMAND, KEY_BACKSPACE_COMMAND, KEY_ENTER_COMMAND, KEY_ESCAPE_COMMAND, KEY_TAB_COMMAND, type LexicalEditor, type LexicalNode, TextNode,
} from 'lexical';
import { registerPlainText } from '@lexical/plain-text';
import { createEmptyHistoryState, registerHistory } from '@lexical/history';
import { mergeRegister } from '@lexical/utils';
import { cx } from '../../internal/cx';
import { useUid } from '../../internal/uid';
import { pickerOption, type PickerOption } from '../../ui/Picker/option';
import { soundChose } from '../../ui/sound/sound';
import { $createMentionNode, $isMentionNode, MentionNode, type MentionPayload } from './MentionNode';
import { bindLoose, parsePrompt } from './mentionGrammar';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';

/** A cast member the prompt can tag with @, and the outfits it can wear. */
export interface PromptCastMember {
  /** Its id, written into the saved prompt's mention. */
  id: string;
  /** The name @ tags and writes. */
  name: string;
  /** Their face in the @ list. */
  image?: string;
  /** Their labels in the @ list ("E.R.A. · lead"), in place of the outfit count. */
  hint?: string;
  /** Their outfits; with any, choosing them asks which one they wear. */
  outfits?: { id: string; label: string }[];
  /** With no `image`: their age figure in the @ list. Default age-adult. */
  figure?: IconName;
}
/** A place the prompt can tag with #. */
export interface PromptPlace {
  /** Its id, written into the saved prompt's mention. */
  id: string;
  /** The name # tags and writes. */
  name: string;
  /** Its picture in the # list. */
  image?: string;
  /** Whether it is a backdrop (a view) or a location (the place itself). */
  category?: 'backdrop' | 'location';
  /** Its views, each a backdrop # saves: two or more open as a level of their own, one is chosen at once. With views the place itself is never saved. */
  views?: PromptPlaceView[];
}
/** A view of a place: its backdrop, which a # mention saves. */
export interface PromptPlaceView {
  /** The view's backdrop id, written into the saved prompt's mention. */
  id: string;
  /** The name # writes. */
  name: string;
  /** Its picture in the # list. */
  image?: string;
}
/** A picture the prompt can point at with $; the alias is what is written. */
export interface PromptReference {
  /** What $ writes: the reference's name in the prompt. */
  alias: string;
  /** Its title in the $ list, when it differs from the alias. */
  name?: string;
  /** Its picture in the $ list. */
  image?: string;
  /** What it is for, under its name in the $ list ("Style lock"). */
  hint?: string;
  /** The $ list's heading it is listed under ("Frames"); groups follow the order their first reference comes. Without it: References. */
  group?: string;
}
/** An object the prompt can tag with &. */
export interface PromptObject {
  /** Its id, written into the saved prompt's mention. */
  id: string;
  /** The name & tags and writes. */
  name: string;
  /** Its picture in the & list; the thing glyph until it has one. */
  image?: string;
  /** A quiet line under its name in the & list. */
  hint?: string;
}
export interface PromptMentions {
  /** Who @ can tag. */
  cast?: PromptCastMember[];
  /** What # can tag. */
  places?: PromptPlace[];
  /** What $ can point at. */
  references?: PromptReference[];
  /** What & can tag. */
  objects?: PromptObject[];
}

const LOAD = 'sk-prompt-load';

type Trigger = '@' | '#' | '$' | '&';
interface Query { trigger: Trigger; text: string; key: string; start: number; end: number }
type Choice =
  | { option: PickerOption; kind: 'character'; member: PromptCastMember }
  | { option: PickerOption; kind: 'outfit'; member: PromptCastMember; outfit: { id: string; label: string } }
  | { option: PickerOption; kind: 'place'; place: PromptPlace }
  | { option: PickerOption; kind: 'level'; place: PromptPlace }
  | { option: PickerOption; kind: 'view'; view: PromptPlaceView }
  | { option: PickerOption; kind: 'reference'; ref: PromptReference; group: string }
  | { option: PickerOption; kind: 'object'; obj: PromptObject };

/* A trigger at a word's start (@ cast, # places, $ references, & objects) and the run after it up to the caret; a run may hold spaces ("Red Line"), never a new line or another trigger */
const QUERY = /(?:^|[^A-Za-z0-9_])([@#$&])([^@#$&\n]{0,40})$/;
const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function $readQuery(): Query | null {
  const sel = $getSelection();
  if (!$isRangeSelection(sel) || !sel.isCollapsed()) return null;
  /* A caret at an element's edge (after a load, or after a mention) reads the text run before it */
  let node: LexicalNode | null = sel.anchor.getNode(), offset = sel.anchor.offset;
  if ($isElementNode(node)) { node = offset > 0 ? node.getChildAtIndex(offset - 1) : null; offset = $isTextNode(node) ? node.getTextContentSize() : 0; }
  if (!$isTextNode(node)) return null;
  const before = node.getTextContent().slice(0, offset), m = QUERY.exec(before);
  if (!m) return null;
  return { trigger: m[1] as Trigger, text: m[2], key: node.getKey(), start: before.length - m[2].length - 1, end: offset };
}

function payloadOf(seg: ReturnType<typeof parsePrompt>[number], mentions: PromptMentions): MentionPayload | null {
  if (seg.t === 'text') return null;
  if (seg.t === 'alias') return { kind: 'reference', alias: seg.alias, missing: !(mentions.references || []).some((r) => r.alias === seg.alias) };
  if (seg.category === 'object') { const thing = (mentions.objects || []).find((o) => o.id === seg.id); return { kind: 'object', ...seg, label: thing ? thing.name : seg.label, missing: !thing }; }
  if (seg.category === 'character' || seg.category === 'faction') {
    const member = seg.category === 'character' ? (mentions.cast || []).find((c) => c.id === seg.id) : undefined;
    const outfit = member && seg.outfitId ? (member.outfits || []).find((o) => o.id === seg.outfitId) : undefined;
    return { kind: 'character', ...seg, label: member ? member.name : seg.label, outfitLabel: outfit && outfit.label };
  }
  /* A place with views is saved as one of its views, so the name shown is that view's */
  let named: string | undefined;
  for (const p of mentions.places || []) {
    if (!(p.views || []).length) { if (p.id === seg.id) named = p.name; continue; }
    for (const v of p.views!) if (v.id === seg.id) named = v.name;
  }
  return { kind: 'place', ...seg, label: named || seg.label };
}

/* The saved prompt becomes the editor's lines: text, line breaks and solid mentions. A $alias with no reference behind it is a missing
   mention, since the server refuses it; a loose @Name stays text, as the server reads it. */
function $load(value: string, mentions: PromptMentions, focused: boolean) {
  const root = $getRoot(), p = $createParagraphNode();
  root.clear();
  root.append(p);
  const segs = parsePrompt(value);
  segs.forEach((seg, n) => {
    /* A $ run at the caret of a field being written in is still being typed: it stays words until it is chosen */
    const typing = focused && n === segs.length - 1 && seg.t === 'alias' && !(mentions.references || []).some((r) => r.alias === seg.alias);
    const payload = typing ? null : payloadOf(seg, mentions);
    if (payload) { p.append($createMentionNode(payload)); return; }
    const text = seg.t === 'text' ? seg.text : seg.t === 'alias' ? '$' + seg.alias : '';
    text.split('\n').forEach((line, i) => { if (i) p.append($createLineBreakNode()); if (line) p.append($createTextNode(line)); });
  });
  /* Loading never takes the caret: only a field already being written in keeps it, at the end */
  if (focused) p.selectEnd(); else $setSelection(null);
}

function useDecorators(editor: LexicalEditor) {
  const [decorators, setDecorators] = useState<Record<string, ReactNode>>(() => editor.getDecorators<ReactNode>());
  useLayoutEffect(() => editor.registerDecoratorListener<ReactNode>((d) => setDecorators(d)), [editor]);
  return Object.keys(decorators).map((key) => {
    const el = editor.getElementByKey(key);
    return el ? createPortal(decorators[key], el, key) : null;
  });
}

export interface MentionFieldProps {
  value: string;
  onChange: (value: string) => void;
  mentions: PromptMentions;
  label: string;
  placeholder?: string;
  describedBy?: string;
  /** The composer, which the list is placed in. */
  frame: RefObject<HTMLElement>;
  /** Filled with a way to type into the field from outside it (a composer's @ button): at the caret, or at the end. */
  insertRef?: MutableRefObject<((text: string) => void) | null>;
  /** `false` where outfits mean nothing (asking Maki): the @ list says no outfit line, and choosing someone never asks which they wear. */
  outfits?: boolean;
}

/* The prompt's words as a field: plain text with mentions as solid pieces. Typing @, # or $ at a word's start opens the cast,
   places or references matching what follows; a character with outfits asks for one next, so the same character can wear a
   different outfit each time it is tagged. Focus never leaves the words: the list is the field's active descendant (a multi-line textbox, since a combobox can't be multi-line). */
export function MentionField({ value, onChange, mentions, label, placeholder, describedBy, frame, insertRef, outfits = true }: MentionFieldProps) {
  const tx = useWords(ownWords);
  const lid = useUid('sk-mention-list'), root = useRef<HTMLDivElement>(null), emitted = useRef<string | null>(null);
  const live = useRef({ mentions, onChange });
  live.current = { mentions, onChange };
  const editor = useMemo(() => createEditor({
    namespace: 'sk-prompt', nodes: [MentionNode], theme: { paragraph: 'sk-composer__line' },
    onError: (e) => { throw e; },
  }), []);
  const [query, setQuery] = useState<Query | null>(null), [member, setMember] = useState<PromptCastMember | null>(null);
  const [at, setAt] = useState(0), [empty, setEmpty] = useState(!value), [level, setLevel] = useState<PromptPlace | null>(null);
  const decorators = useDecorators(editor);

  const choices: Choice[] = useMemo(() => {
    if (member) return (member.outfits || []).map((o, i) => ({ kind: 'outfit', member, outfit: o, option: { label: o.label, hint: i === 0 ? tx('outfitDefault') : undefined } }));
    if (!query) return [];
    const q = fold(query.text.trim()), hit = (s: string) => !q || fold(s).includes(q);
    if (query.trigger === '@') return (mentions.cast || []).filter((c) => hit(c.name)).map((c) => ({ kind: 'character', member: c, option: { label: c.name, image: c.image, figure: c.image ? undefined : c.figure || 'age-adult', shape: 'round', hint: c.hint || (!outfits ? undefined : (c.outfits || []).length ? tx('outfitCount', { count: (c.outfits || []).length }) : tx('noOutfitYet')) } }));
    if (query.trigger === '&') return (mentions.objects || []).filter((o) => hit(o.name)).map((o) => ({ kind: 'object', obj: o, option: { label: o.name, image: o.image, icon: o.image ? undefined : 'thing', hint: o.hint } }));
    if (query.trigger === '#' && level) return (level.views || []).map((v) => ({ kind: 'view', view: v, option: { label: v.name, image: v.image } }));
    if (query.trigger === '#') {
      /* A place lists its views as a level of its own from two; with one it is that view. Typed words find views in every place too */
      const shown = (mentions.places || []).filter((p) => hit(p.name));
      const out: Choice[] = shown.map((p): Choice => {
        const views = p.views || [], cover = p.image || (views[0] && views[0].image);
        if (views.length > 1) return { kind: 'level', place: p, option: { label: p.name, image: cover, hint: tx('placeViews', { count: views.length }), opens: true } };
        if (views.length === 1) return { kind: 'view', view: views[0], option: { label: p.name, image: cover, hint: tx('placeOneView', { name: views[0].name }) } };
        return { kind: 'place', place: p, option: { label: p.name, image: p.image } };
      });
      if (q) for (const p of mentions.places || []) {
        if ((p.views || []).length === 1 && shown.includes(p)) continue;
        for (const v of p.views || []) if (hit(v.name)) out.push({ kind: 'view', view: v, option: { label: v.name, image: v.image, hint: p.name } });
      }
      return out;
    }
    /* Each group in the order its first reference comes, its references in theirs; one with no group is under References */
    const order: string[] = [], groupOf = (r: PromptReference) => r.group || tx('mentionReferences');
    for (const r of mentions.references || []) if (!order.includes(groupOf(r))) order.push(groupOf(r));
    return (mentions.references || []).filter((r) => hit(r.alias) || hit(r.name || ''))
      .map((r): Choice => ({ kind: 'reference', ref: r, group: groupOf(r), option: { label: '$' + r.alias, image: r.image, hint: r.hint || r.name } }))
      .sort((a, b) => order.indexOf((a as { group: string }).group) - order.indexOf((b as { group: string }).group));
  }, [query, member, level, mentions]);
  const open = choices.length > 0;
  const live2 = useRef({ choices, at, open, query, level });
  live2.current = { choices, at, open, query, level };

  function close() { setQuery(null); setMember(null); setLevel(null); setAt(0); }

  /* Back from a place's views to the places, on the place that opened them */
  function back() {
    const s = live2.current, q = fold((s.query ? s.query.text : '').trim());
    const shown = (mentions.places || []).filter((p) => !q || fold(p.name).includes(q));
    setAt(Math.max(0, shown.indexOf(s.level!)));
    setLevel(null);
  }
  const backRef = useRef(back);
  backRef.current = back;

  /* The query's text becomes the mention, followed by a space so the next word starts clear of it */
  function insert(payload: MentionPayload) {
    const q = live2.current.query;
    if (!q) return;
    editor.update(() => {
      const node = $getNodeByKey(q.key);
      if (!$isTextNode(node)) return;
      let tagged: TextNode = node;
      if (q.start > 0) tagged = tagged.splitText(q.start)[1];
      if (q.end - q.start < tagged.getTextContentSize()) tagged = tagged.splitText(q.end - q.start)[0];
      const mention = $createMentionNode(payload), space = $createTextNode(' ');
      tagged.replace(mention);
      mention.insertAfter(space);
      space.select(1, 1);
    });
    soundChose();
    close();
  }

  function choose(c: Choice) {
    if (c.kind === 'character') {
      if (outfits && (c.member.outfits || []).length > 1) { setMember(c.member); setAt(0); return; }
      const only = outfits ? (c.member.outfits || [])[0] : undefined;
      insert({ kind: 'character', label: c.member.name, category: 'character', id: c.member.id, outfitId: only && only.id, outfitLabel: only && only.label });
    } else if (c.kind === 'outfit') insert({ kind: 'character', label: c.member.name, category: 'character', id: c.member.id, outfitId: c.outfit.id, outfitLabel: c.outfit.label });
    else if (c.kind === 'place') insert({ kind: 'place', label: c.place.name, category: c.place.category || 'backdrop', id: c.place.id });
    else if (c.kind === 'level') { setLevel(c.place); setAt(0); }
    else if (c.kind === 'view') insert({ kind: 'place', label: c.view.name, category: 'backdrop', id: c.view.id });
    else if (c.kind === 'object') insert({ kind: 'object', label: c.obj.name, category: 'object', id: c.obj.id });
    else insert({ kind: 'reference', alias: c.ref.alias });
  }
  const chooseRef = useRef(choose);
  chooseRef.current = choose;

  /* Typed in through the editor, never the page's text input: an @ from outside opens the list as typing it does, a space first after a word */
  if (insertRef) insertRef.current = (text: string) => {
    editor.focus(() => {
      editor.update(() => {
        let sel = $getSelection();
        if (!$isRangeSelection(sel)) { $getRoot().selectEnd(); sel = $getSelection(); }
        if (!$isRangeSelection(sel)) return;
        const node = sel.anchor.getNode(), before = $isTextNode(node) ? node.getTextContent().slice(0, sel.anchor.offset) : '';
        sel.insertText(/\S$/.test(before) ? ' ' + text : text);
      });
    });
  };
  useLayoutEffect(() => {
    editor.setRootElement(root.current);
    return () => editor.setRootElement(null);
  }, [editor]);

  /* Listening starts before the first load, so that load is read as one and saves nothing */
  useLayoutEffect(() => {
    const nav = (d: number) => (e: KeyboardEvent | null) => {
      const s = live2.current;
      if (!s.open) return false;
      if (e) e.preventDefault();
      setAt((s.at + d + s.choices.length) % s.choices.length);
      return true;
    };
    const pick = (e: KeyboardEvent | null) => {
      const s = live2.current;
      if (!s.open || !s.choices[s.at]) return false;
      if (e) e.preventDefault();
      chooseRef.current(s.choices[s.at]);
      return true;
    };
    return mergeRegister(
      registerPlainText(editor),
      registerHistory(editor, createEmptyHistoryState(), 300),
      /* A token pasted in (a mention copied from the field, or a saved prompt) becomes the solid mention it names */
      editor.registerNodeTransform(TextNode, (node) => {
        if (!node.getTextContent().includes('@[')) return;
        const segs = parsePrompt(node.getTextContent()), m = live.current.mentions;
        if (!segs.some((x) => x.t === 'mention')) return;
        const caret = node.isSelected();
        let last: LexicalNode = node;
        segs.forEach((seg, n) => {
          const payload = seg.t === 'mention' ? payloadOf(seg, m) : null;
          const next = payload ? $createMentionNode(payload) : $createTextNode(seg.t === 'text' ? seg.text : seg.t === 'alias' ? '$' + seg.alias : '');
          if (n === 0) node.replace(next); else last.insertAfter(next);
          last = next;
        });
        if (caret) last.selectNext(0, 0);
      }),
      editor.registerCommand(KEY_ARROW_DOWN_COMMAND, nav(1), COMMAND_PRIORITY_HIGH),
      editor.registerCommand(KEY_ARROW_UP_COMMAND, nav(-1), COMMAND_PRIORITY_HIGH),
      editor.registerCommand(KEY_ENTER_COMMAND, pick, COMMAND_PRIORITY_HIGH),
      editor.registerCommand(KEY_TAB_COMMAND, pick, COMMAND_PRIORITY_HIGH),
      /* Right opens a place's views; in them, Left or Backspace right after the # goes back to the places */
      editor.registerCommand(KEY_ARROW_RIGHT_COMMAND, (e) => {
        const s = live2.current, c = s.open && s.choices[s.at];
        if (!c || c.kind !== 'level') return false;
        if (e) e.preventDefault();
        chooseRef.current(c);
        return true;
      }, COMMAND_PRIORITY_HIGH),
      editor.registerCommand(KEY_ARROW_LEFT_COMMAND, (e) => {
        if (!live2.current.level) return false;
        if (e) e.preventDefault();
        backRef.current();
        return true;
      }, COMMAND_PRIORITY_HIGH),
      editor.registerCommand(KEY_BACKSPACE_COMMAND, (e) => {
        const s = live2.current;
        if (!s.level || !s.query || s.query.text.trim()) return false;
        if (e) e.preventDefault();
        backRef.current();
        return true;
      }, COMMAND_PRIORITY_HIGH),
      editor.registerCommand(KEY_ESCAPE_COMMAND, () => { if (!live2.current.open) return false; close(); return true; }, COMMAND_PRIORITY_HIGH),
      editor.registerUpdateListener(({ editorState, tags }) => {
        const state = editorState.read(() => ({ text: $getRoot().getTextContent(), query: $readQuery() }));
        setEmpty(!state.text);
        /* Saved with each loose @Name the roster knows bound to its token, since the server reads only tokens. A load is not an edit: it
           may refresh a renamed mention's label, which is saved with the next edit, not on its own */
        const saved = bindLoose(state.text, live.current.mentions);
        if (tags.has(LOAD)) emitted.current = saved;
        else if (saved !== emitted.current) { emitted.current = saved; live.current.onChange(saved); }
        const prev = live2.current.query, next = state.query;
        const same = !!prev && !!next && prev.key === next.key && prev.start === next.start;
        /* Typing more closes a place's views, back to what the words find */
        if (!same) { setMember(null); setLevel(null); setAt(0); } else if (prev!.text !== next!.text) { setLevel(null); setAt(0); }
        setQuery(next);
      }),
    );
  }, [editor, frame]);

  /* A value from outside the field (a template, a reset) replaces what it holds; its own edits come back unchanged and are left alone */
  useLayoutEffect(() => {
    if (value === emitted.current) return;
    emitted.current = value;
    const focused = !!root.current && root.current === document.activeElement;
    editor.update(() => $load(value, live.current.mentions, focused), { tag: ['history-merge', LOAD], discrete: true });
  }, [editor, value]);

  /* A reference leaving the take (a frame removed) turns its mentions missing, and coming back turns them back, in place: the words and
     the caret stay as they are */
  const aliases = (mentions.references || []).map((r) => r.alias).join('\n');
  useLayoutEffect(() => {
    const have = new Set(aliases ? aliases.split('\n') : []);
    editor.update(() => {
      const walk = (node: LexicalNode) => {
        if ($isMentionNode(node)) { const p = node.__payload; if (p.kind === 'reference') node.setMissing(!have.has(p.alias)); return; }
        if ($isElementNode(node)) node.getChildren().forEach(walk);
      };
      walk($getRoot());
    }, { tag: ['history-merge', LOAD], discrete: true });
  }, [editor, aliases]);

  /* The list opens at the trigger: its left edge on the @, just above the line holding it, or below that line when the page has no
     room above. Placed before paint, so it never shows where it was */
  useLayoutEffect(() => {
    const box = frame.current, menu = box && box.querySelector<HTMLElement>('.sk-composer__menu'), q = query;
    const text = q && editor.getElementByKey(q.key)?.firstChild;
    if (!open || !box || !menu || !q || !text) return;
    const range = document.createRange();
    range.setStart(text, Math.min(q.start, text.textContent!.length));
    range.setEnd(text, Math.min(q.start + 1, text.textContent!.length));
    const r = range.getBoundingClientRect(), f = box.getBoundingClientRect(), gap = parseFloat(getComputedStyle(menu).marginBottom) || 0;
    const above = r.top - menu.offsetHeight - gap >= 0;
    menu.classList.toggle('is-below', !above);
    menu.style.left = 'min(' + Math.max(0, r.left - f.left) + 'px, 100% - var(--composer-menu-width))';
    menu.style.bottom = above ? f.bottom - r.top + 'px' : '';
    menu.style.top = above ? '' : r.bottom - f.top + 'px';
  });

  const name = member ? member.name : '';
  const group = query && tx(query.trigger === '@' ? 'mentionCast' : query.trigger === '#' ? 'mentionPlaces' : query.trigger === '&' ? 'mentionObjects' : 'mentionReferences'), typed = query ? query.text.trim() : '';
  const title = level ? level.name : member ? tx('outfitFor', { name }) : query ? (typed ? tx('mentionMatching', { group: group!, query: typed }) : group!) : '';
  const rows = { id: lid, active: at, search: true, choose: (o: PickerOption) => { const c = choices.find((x) => x.option === o); if (c) choose(c); } };
  /* $ with references in two or more groups: a heading per group, a typed query said in each ("Frames · matching “plat”") */
  const groupOf = (c: Choice) => (c.kind === 'reference' ? c.group : '');
  const sections: { group: string; title: string; items: number[] }[] | null =
    query && query.trigger === '$' && choices.some((c) => groupOf(c) !== groupOf(choices[0])) ? [] : null;
  if (sections) choices.forEach((c, n) => {
    let last = sections[sections.length - 1];
    if (!last || last.group !== groupOf(c)) sections.push(last = { group: groupOf(c), title: typed ? tx('mentionMatching', { group: groupOf(c), query: typed }) : groupOf(c), items: [] });
    last.items.push(n);
  });
  return (
    <>
      <div ref={root} className={cx('sk-composer__prompt', empty && 'is-empty')} contentEditable suppressContentEditableWarning role="textbox" aria-multiline="true"
        aria-label={label} aria-placeholder={placeholder} data-placeholder={placeholder} aria-describedby={describedBy} aria-autocomplete="list"
        aria-controls={open ? lid : undefined} aria-activedescendant={open ? lid + '-o' + at : undefined} onBlur={close} />
      {decorators}
      {open && (
        <Popover anchored={false} role="presentation" className="sk-composer__menu">
          {level && (
            <div className="sk-picker__head">
              {/* A press on Back leaves focus in the words */}
              <IconButton icon="chevron-left" variant="plain" label={tx('backTo', { name: tx('mentionPlaces') })} onMouseDown={(e) => e.preventDefault()} onClick={back} />
              <span className="sk-picker__title" aria-hidden="true">{level.name}</span>
            </div>
          )}
          <div id={lid} className="sk-picker__list" role="listbox" aria-label={title}>
            {sections
              ? sections.map((g, gi) => (
                <div key={gi} role="group" aria-labelledby={lid + '-g' + gi}>
                  <span id={lid + '-g' + gi} className="sk-picker__group">{g.title}</span>
                  {g.items.map((n) => pickerOption(choices[n].option, n, rows, tx))}
                </div>
              ))
              : <>{!level && <span className="sk-picker__group" aria-hidden="true">{title}</span>}{choices.map((c, n) => pickerOption(c.option, n, rows, tx))}</>}
          </div>
          {member && (member.outfits || []).length > 1 && <div className="sk-composer__menu-note"><Text variant="small">{tx('outfitNote', { name })}</Text></div>}
        </Popover>
      )}
    </>
  );
}
