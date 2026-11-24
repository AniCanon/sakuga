import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { core } from '../internal/words';
import { messages } from './messages';

/* The words are split by owner (a ruling of the design system for Version 242): the core keeps the words more than one part says, and each
   component brings its own in its words.ts, so a page carries only the words of the parts it uses. These checks keep a word
   from being said where its owner's words are not. */
const src = join(dirname(fileURLToPath(import.meta.url)), '..');
const walk = (d: string): string[] => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const sources = walk(src).filter((f) => /\.tsx?$/.test(f) && !/\.(test|stories)\.tsx?$/.test(f) && !/(^|\/)words\.ts$/.test(f) && !f.endsWith('allWords.ts'));
const folderOf = (f: string) => relative(src, f).split('/').slice(0, 2).join('/');
const owners = walk(src).filter((f) => f.endsWith('/words.ts') && !f.endsWith('internal/words.ts')).map((f) => {
  const t = readFileSync(f, 'utf8'), at = t.indexOf('Object.freeze(') + 'Object.freeze('.length;
  return { folder: folderOf(f), keys: Object.keys(JSON.parse(t.slice(at, t.indexOf(' satisfies SakugaMessages')))) };
});
const declared = [...readFileSync(join(src, 'internal/words.ts'), 'utf8').matchAll(/\*\/ (\w+)\?: SakugaMessage;/g)].map((m) => m[1]);

describe('the words, split by owner', () => {
  it('says every declared word once: in the core or in exactly one component', () => {
    const all = [...Object.keys(core), ...owners.flatMap((o) => o.keys)];
    expect(new Set(all).size).toBe(all.length);
    expect([...all].sort()).toEqual([...declared].sort());
    expect(Object.keys(messages).sort()).toEqual([...declared].sort());
  });

  it("keeps a component's word inside its folder, and out of any table another folder imports", () => {
    const strays: string[] = [];
    for (const o of owners) {
      for (const key of o.keys) {
        const quoted = new RegExp(`['"]${key}['"]`);
        for (const f of sources.filter((s) => quoted.test(readFileSync(s, 'utf8')))) {
          if (folderOf(f) !== o.folder) { strays.push(`${key} (${o.folder}) is named in ${relative(src, f)}`); continue; }
          // In a table the file exports, another folder can say it with its own words, as StoryMap said EventGlyph's EVENT_WORD
          const chunks = readFileSync(f, 'utf8').split(/\n(?=\S)/);
          for (const c of chunks.filter((x) => quoted.test(x))) {
            const name = c.match(/^export const (\w+)/)?.[1];
            const by = name && sources.find((s) => folderOf(s) !== o.folder && new RegExp(`import[^;]*\\b${name}\\b`).test(readFileSync(s, 'utf8')));
            if (by) strays.push(`${key} (${o.folder}) sits in ${name}, which ${relative(src, by)} imports`);
          }
        }
      }
    }
    expect(strays).toEqual([]);
  });
});
