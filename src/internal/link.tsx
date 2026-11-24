import type { AnchorHTMLAttributes, MouseEventHandler, ReactNode } from 'react';

/* A place to go is a link; an action with no address is a button, never a link to # */
export function GoLink({ href, onClick, children, ...attrs }: {
  href?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  children?: ReactNode;
} & Omit<AnchorHTMLAttributes<HTMLElement>, 'href' | 'onClick' | 'type'>) {
  return href
    ? <a href={href} onClick={onClick} {...attrs}>{children}</a>
    : <button type="button" onClick={onClick} {...attrs}>{children}</button>;
}
