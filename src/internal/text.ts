import type { ReactNode } from 'react';

/* The words a piece of markup says, for a name built from it ("Select Smith", "Remove Smith") */
export function textOf(n: ReactNode): string {
  if (n === null || n === undefined || typeof n === 'boolean') return '';
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(textOf).join('');
  const p = (n as { props?: { children?: ReactNode } }).props;
  return p ? textOf(p.children) : '';
}
