import type { Story, StoryDefault } from '@ladle/react';
import { useState } from 'react';
import face from '@design/blobs/322a5d0e1f576b54cdd579a1f4bf2a2f.jpg';
import { Button } from '../Button/Button';
import { SideNav, type SideNavProps } from './SideNav';

export default { title: 'Sakuga / Navigation / SideNav' } satisfies StoryDefault;

const groups: SideNavProps['groups'] = [
  { items: [{ label: 'Home', icon: 'home' }] },
  { title: 'Make', items: [{ label: 'Studio', icon: 'image', current: true }, { label: 'Cut', icon: 'film' }] },
  { title: 'World', items: [{ label: 'Characters', icon: 'characters' }, { label: 'Places', icon: 'place' }] },
];

export const Studio: Story = () => (
  <div style={{ height: 520 }}>
    <SideNav brand={{ name: 'AniCanon', product: 'Studio' }} switcher={{ label: 'EBA' }} groups={groups.slice(0, 2)} account={{ name: 'Raul Menezes', handle: '@rmenezes' }} />
  </div>
);

export const Switcher: Story = () => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ height: 560 }}>
      <SideNav brand={{ name: 'AniCanon', product: 'Studio' }} switcher={{ label: 'Ember Bay', image: face, open, onClick: () => setOpen(!open) }} groups={groups} account={{ name: 'Aiko Mori', handle: '@aiko', image: face }} />
    </div>
  );
};

export const Footer: Story = () => (
  <div style={{ height: 560 }}>
    <SideNav brand={{ name: 'AniCanon', product: 'Studio' }} groups={groups} account={{ name: 'Raul Menezes', handle: '@rmenezes' }}>
      <div style={{ padding: '0 12px 12px' }}><Button variant="secondary" size="sm" fullWidth>Invite a writer</Button></div>
    </SideNav>
  </div>
);

export const Compact: Story = () => (
  <div style={{ height: 520 }}>
    <SideNav compact brand={{ name: 'AniCanon', product: 'Studio' }} switcher={{ label: 'Ember Bay', image: face }} groups={groups} account={{ name: 'Aiko Mori', handle: '@aiko', image: face }} />
  </div>
);

export const Playground: Story<SideNavProps> = (args) => <div style={{ height: 560 }}><SideNav {...args} /></div>;
Playground.args = { brand: { name: 'AniCanon', product: 'Studio' }, switcher: { label: 'EBA' }, groups, account: { name: 'Raul Menezes', handle: '@rmenezes' }, label: 'Sections', compact: false };
