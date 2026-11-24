import type { Story, StoryDefault } from '@ladle/react';
import { useState, type MouseEvent } from 'react';
import mark from '@design/blobs/b68127d990571674533bf0d47d927435.png';
import face from '@design/blobs/322a5d0e1f576b54cdd579a1f4bf2a2f.jpg';
import { IconButton } from '../IconButton/IconButton';
import { TopNav, type TopNavProps } from './TopNav';

export default { title: 'Sakuga / Navigation / TopNav' } satisfies StoryDefault;

const names = ['Home', 'Series', 'Shorts', 'Manga', 'Creators'];

export const Sections: Story = () => {
  const [at, setAt] = useState('Series');
  const links = names.map((label) => ({ label, current: at === label, onClick: (e: MouseEvent) => { e.preventDefault(); setAt(label); } }));
  return <TopNav brand={{ logo: mark, name: 'AniCanon' }} links={links} account={{ name: 'Aiko Mori', image: face }} />;
};

export const Create: Story = () => (
  <TopNav brand={{ logo: mark, name: 'AniCanon' }} links={names.map((label) => ({ label, current: label === 'Home' }))} create={{ label: 'Create' }} account={{ name: 'Aiko Mori' }} />
);

export const Actions: Story = () => (
  <TopNav brand={{ logo: mark, name: 'AniCanon' }} links={names.map((label) => ({ label, current: label === 'Shorts' }))} account={{ name: 'Aiko Mori', image: face }}
    actions={<IconButton variant="plain" icon="bell" label="Notifications, 3 unread" attention />} />
);

export const SignedOut: Story = () => <TopNav brand={{ logo: mark, name: 'AniCanon' }} links={names.map((label) => ({ label, current: label === 'Manga' }))} />;

export const Searching: Story = () => {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ paddingBottom: 40 }}>
      <TopNav brand={{ logo: mark, name: 'AniCanon' }} links={names.map((label) => ({ label, current: label === 'Series', onClick: () => undefined }))} create={{ onClick: () => undefined }} account={{ name: 'Aiko Mori', image: face }}
        search={{ open, onOpen: () => setOpen(true), onClose: () => setOpen(false), label: 'Search AniCanon', placeholder: 'Series, creators, characters' }} />
    </div>
  );
};

export const Playground: Story<TopNavProps> = (args) => <TopNav {...args} />;
Playground.args = { brand: { name: 'AniCanon' }, links: names.map((label) => ({ label, current: label === 'Series' })), account: { name: 'Aiko Mori' }, search: true, label: 'Main' };
