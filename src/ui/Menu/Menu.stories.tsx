import type { Story, StoryDefault } from '@ladle/react';
import { useState } from 'react';
import { IconButton } from '../IconButton/IconButton';
import { Menu, type MenuProps } from './Menu';

export default { title: 'Sakuga / Containers / Menu' } satisfies StoryDefault;

const items: MenuProps['items'] = [
  { label: 'Face sheet and variants', icon: 'frame-portrait', href: '/smith/face' },
  { label: 'Delete Smith', icon: 'trash', tone: 'danger', separated: true, onClick: () => {} },
];

/* The ⋯ behind a character's page actions: the menu drops under it, lined up with its end */
export const More: Story = () => {
  const [open, set] = useState(true);
  return (
    <div style={{ minHeight: 200, width: 320, display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start' }}>
      <div style={{ position: 'relative' }}>
        <IconButton variant="solid" icon="more" label="More for Smith" aria-haspopup="menu" aria-expanded={open} onClick={() => set(!open)} />
        <Menu open={open} label="More for Smith" align="end" onClose={() => set(false)} items={items} />
      </div>
    </div>
  );
};
