import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { designFile } from './design.mjs';

export function readIconSource() {
  const src = readFileSync(designFile('bundle.js'), 'utf8');
  function literal(name) {
    const start = src.indexOf(`var ${name} = {`);
    if (start < 0) throw new Error(`${name} not found in the reference bundle`);
    let depth = 0, i = src.indexOf('{', start), quote = null;
    for (; i < src.length; i++) {
      const c = src[i];
      if (quote) { if (c === '\\') i++; else if (c === quote) quote = null; continue; }
      if (c === '"' || c === "'") quote = c;
      else if (c === '{') depth++;
      else if (c === '}' && --depth === 0) break;
    }
    return vm.runInNewContext('(' + src.slice(src.indexOf('{', start), i + 1) + ')');
  }

  const own = { ...literal('SVG_ICONS'), ...literal('PICKER_ICONS'), ...literal('OCCASION_ICONS') };
  const paths = literal('PATHS');
  const round = 'stroke-linecap="round" stroke-linejoin="round"';
  const symbols = [];
  for (const [name, icon] of Object.entries(own)) {
    /* The bundle's Icon sets round caps and joins on every drawn icon's <svg>, filled or not: an icon's own stroked path (the hanger)
       inherits them */
    const paint = icon.fill ? `fill="currentColor" stroke="none" ${round}` : `fill="none" stroke="currentColor" stroke-width="2" ${round}`;
    symbols.push(`<symbol id="${name}" viewBox="${icon.vb || '0 0 24 24'}" ${paint}>${icon.svg}</symbol>`);
  }
  for (const [name, p] of Object.entries(paths)) {
    if (own[name]) continue;
    symbols.push(typeof p === 'object'
      ? `<symbol id="${name}" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="${p.fill}"/></symbol>`
      : `<symbol id="${name}" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="${p}" style="stroke-width:var(--icon-stroke-width,2)" ${round}/></symbol>`);
  }


  return { symbols, names: [...new Set([...Object.keys(own), ...Object.keys(paths)])].sort(), listed: [...Object.keys(paths), ...Object.keys(own).filter(n => !(n in paths))] };
}
