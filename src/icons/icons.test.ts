// @vitest-environment jsdom
import { execFileSync } from 'node:child_process';
import { gzipSync } from 'node:zlib';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const sprite = readFileSync(join(process.cwd(), 'src/icons/icons.svg'), 'utf8');
const names = readFileSync(join(process.cwd(), 'src/ui/Icon/names.ts'), 'utf8');

describe('icon sprite', () => {
  it('has a symbol for every IconName and no other', () => {
    const ids = [...sprite.matchAll(/<symbol id="([^"]+)"/g)].map((m) => m[1]).sort();
    const typed = [...names.split('export const')[0].matchAll(/\| '([^']+)'/g)].map((m) => m[1]).sort();
    expect(ids).toEqual(typed);
  });

  it('iconNames lists every IconName once, as Version 215\'s Sakuga.iconNames does', () => {
    const listed = [...names.split('export const')[1].matchAll(/'([^']+)',/g)].map((m) => m[1]);
    const typed = [...names.split('export const')[0].matchAll(/\| '([^']+)'/g)].map((m) => m[1]);
    expect(listed).toHaveLength(new Set(listed).size);
    expect([...listed].sort()).toEqual([...typed].sort());
  });

  it('draws every attribute in SVG spelling, never React\'s (strokeLinecap)', () => {
    /* viewBox is SVG's own camel case */
    expect(sprite.replace(/ viewBox="/g, '')).not.toMatch(/\s[a-z]+[A-Z][a-zA-Z]*="/);
  });
});

describe('icon sprite file', () => {
  it('is well-formed XML, which an external <use> needs: one fault and the browser draws no icon at all', () => {
    const doc = new DOMParser().parseFromString(sprite, 'image/svg+xml');
    expect(doc.getElementsByTagName('parsererror')).toHaveLength(0);
  });
});

/* Needs the reference files, which are not distributed with this repository */
it.skipIf(!existsSync(join(process.cwd(), '.design/bundle.js')))('rebuilds deterministically and preserves every public SVG symbol contract', () => {
  const result = JSON.parse(execFileSync(process.execPath, ['--input-type=module', '-e', `
    import { readIconSource } from './scripts/icon-source.mjs';
    import { optimizeIconSprite } from './scripts/optimize-icons.mjs';
    const { symbols } = readIconSource();
    console.log(JSON.stringify({ source: '<svg xmlns="http://www.w3.org/2000/svg">'+symbols.join('')+'</svg>', optimized: optimizeIconSprite(symbols) }));
  `], { encoding: 'utf8', maxBuffer: 2 * 1024 * 1024 }));
  expect(result.optimized).toBe(sprite);
  // Pixels come first: the detailed outlines that keep their own commands (scripts/optimize-icons.mjs) cost some of the saving
  expect(gzipSync(sprite, {level:9}).length).toBeLessThan(gzipSync(result.source, {level:9}).length * 0.925);
  const parser = new DOMParser();
  const before = parser.parseFromString(result.source, 'image/svg+xml');
  const after = parser.parseFromString(sprite, 'image/svg+xml');
  expect(after.querySelector('parsererror')).toBeNull();
  const attributes = (el: Element) => Object.fromEntries([...el.attributes].map(a => [a.name, a.value]));
  const originals = [...before.querySelectorAll('symbol')];
  const optimized = [...after.querySelectorAll('symbol')];
  expect(optimized).toHaveLength(originals.length);
  originals.forEach((symbol, i) => expect(attributes(optimized[i])).toEqual(attributes(symbol)));
  expect(sprite.match(/var\(--icon-stroke-width,2\)/g)?.length).toBe(result.source.match(/var\(--icon-stroke-width,2\)/g)?.length);
});
