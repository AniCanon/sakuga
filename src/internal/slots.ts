import { Children, cloneElement, createElement, Fragment, isValidElement, type ReactElement, type ReactNode } from 'react';

export interface Slots {
  main: ReactNode[];
  named: Record<string, ReactNode[]>;
  /** What the children with slot="name" hold, or null. */
  get(name: string): ReactNode;
  /** Everything not in a named slot, or null. */
  body: ReactNode;
}

/* Named slots: a child carrying slot="name" fills that slot; everything else is the default content. Whitespace text is dropped.
   A wrapper (a span or a div) gives its children; a component is kept whole, so a Button in slot="action" stays a button. */
export function slots(children: ReactNode): Slots {
  const main: ReactNode[] = [], named: Record<string, ReactNode[]> = {};
  Children.forEach(children, (ch) => {
    if (typeof ch === 'string' && !ch.trim()) return;
    const slot = isValidElement<{ slot?: string; children?: ReactNode }>(ch) ? ch.props.slot : undefined;
    if (slot) {
      const el = ch as ReactElement<{ slot?: string; children?: ReactNode }>;
      (named[slot] = named[slot] || []).push(typeof el.type === 'string' ? el.props.children : cloneElement(el, { slot: undefined }));
    }
    else if (ch !== null && ch !== undefined && ch !== false) main.push(ch);
  });
  return {
    main,
    named,
    get(name) { const v = named[name]; return v && v.length ? createElement(Fragment, null, ...v) : null; },
    body: main.length ? createElement(Fragment, null, ...main) : null,
  };
}
