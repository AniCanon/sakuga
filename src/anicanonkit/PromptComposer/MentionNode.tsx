import type { ReactNode } from 'react';
import { Text } from '@anicanon/sakuga/ui';
import { $applyNodeReplacement, DecoratorNode, type LexicalNode, type NodeKey, type SerializedLexicalNode, type Spread } from 'lexical';
import { Mention } from '../Mention/Mention';
import { formatMention, type StoredMention } from './mentionGrammar';

/** One mention in the prompt as the editor holds it: what is saved, and what is shown. */
export type MentionPayload =
  | ({ kind: 'character' | 'place' | 'object' } & StoredMention & { outfitLabel?: string; missing?: boolean })
  | { kind: 'reference'; alias: string; missing?: boolean };

type SerializedMention = Spread<{ payload: MentionPayload }, SerializedLexicalNode>;

/* A mention is one solid piece of the prompt: the caret steps over it and Backspace takes it whole. Its text content is its saved
   form, so the editor's text is the saved prompt. */
export class MentionNode extends DecoratorNode<ReactNode> {
  __payload: MentionPayload;

  static getType() { return 'sk-mention'; }
  static clone(node: MentionNode) { return new MentionNode(node.__payload, node.__key); }
  static importJSON(json: SerializedMention) { return $createMentionNode(json.payload); }

  constructor(payload: MentionPayload, key?: NodeKey) {
    super(key);
    this.__payload = payload;
  }

  exportJSON(): SerializedMention { return { ...super.exportJSON(), type: 'sk-mention', version: 1, payload: this.__payload }; }
  createDOM() {
    const el = document.createElement('span');
    el.className = 'sk-composer__mention';
    el.setAttribute('contenteditable', 'false');
    return el;
  }
  updateDOM() { return false; }
  /** A reference's mention turning missing as it leaves the take, or back as it returns: same saved form, new look. */
  setMissing(missing: boolean) {
    const p = this.__payload;
    if (p.kind === 'reference' && !!p.missing !== missing) this.getWritable().__payload = { ...p, missing };
  }
  isInline() { return true; }
  isKeyboardSelectable() { return false; }
  getTextContent() {
    const p = this.__payload;
    return p.kind === 'reference' ? '$' + p.alias : formatMention(p);
  }
  decorate() {
    const p = this.__payload;
    if (p.kind === 'reference') return <Mention kind="reference" missing={p.missing}>{p.alias}</Mention>;
    return <>{<Mention kind={p.kind} missing={p.kind === 'object' ? p.missing : undefined}>{p.label}</Mention>}{p.outfitLabel && <> <Text tone="muted" as="span">({p.outfitLabel})</Text></>}</>;
  }
}

export function $createMentionNode(payload: MentionPayload) {
  return $applyNodeReplacement(new MentionNode(payload));
}

export function $isMentionNode(node: LexicalNode | null | undefined): node is MentionNode {
  return node instanceof MentionNode;
}
