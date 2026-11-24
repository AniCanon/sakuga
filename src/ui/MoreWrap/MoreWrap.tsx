import { useState, type CSSProperties, type ReactNode } from 'react';
import { IconButton } from '../IconButton/IconButton';
import { Menu, type MenuProps } from '../Menu/Menu';
import { cx } from '../../internal/cx';
import { useWords } from '../../internal/words';
import { words as ownWords } from './words';
import '../../base.css';
import './MoreWrap.css';

/** A card's own ⋯: its menu's rows, and a name for it in place of "More for {name}". */
export interface CardMenu {
  label?: string;
  items: MenuProps['items'];
  open?: boolean;
}

/* A card's own ⋯ (CastCard, LookPlate, MediaCard, ProductionNav's production): in its corner, beside the card's link and never inside it,
   opening a Menu under it. A core part, not for apps: MediaCard draws it, and AniCanonKit takes it as one of check-layers' named parts */
export function MoreWrap({ menu, name, className, variant, align, style, children }: {
  menu: CardMenu; name: string; className: string; variant?: 'solid' | 'plain' | 'media'; align?: 'start' | 'end'; style?: CSSProperties; children: ReactNode;
}) {
  const tx = useWords(ownWords);
  const [open, setOpen] = useState(!!menu.open);
  const label = menu.label || tx('moreFor', { name });
  return (
    <div className={cx('sk-more-wrap', open && 'is-open', className)} style={style}>
      {children}
      <span className="sk-more-wrap__button">
        <IconButton variant={variant || 'plain'} icon="more" label={label} aria-haspopup="menu" aria-expanded={open ? 'true' : 'false'} onClick={() => setOpen(!open)} />
        {open && <Menu label={label} items={menu.items} onClose={() => setOpen(false)} align={align || 'start'} />}
      </span>
    </div>
  );
}
