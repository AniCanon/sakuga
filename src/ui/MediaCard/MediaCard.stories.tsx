import type { Story, StoryDefault } from '@ladle/react';
import episode from '@design/blobs/d8ef67e68060bc99325a2ea0307216d2.jpg';
import episodeLight from '@design/blobs/b2a33726525f243260755b7864904934.webp';
import logo from '@design/blobs/fe1ad0448c6172481992ffed4833b463.png';
import short from '@design/blobs/70a79c6a67f31e4250d80f3e68d60502.jpg';
import shortLight from '@design/blobs/a50c2f5f4cf861f2a608ea7e6b427222.webp';
import manga from '@design/blobs/a6c677d20d5362900fb4fc56f7761a27.jpg';
import mangaLight from '@design/blobs/f04a3edceeb03061fcfb10146b95402a.webp';
import { Badge } from '../Badge/Badge';
import { MediaCard, type MediaCardProps } from './MediaCard';

export default { title: 'Sakuga / Content / MediaCard' } satisfies StoryDefault;

const row = { display: 'flex', gap: 18, alignItems: 'flex-start', flexWrap: 'wrap' } as const;

export const Episode: Story = () => <div style={row}><MediaCard kind="episode" width={280} image={episode} lightMap={episodeLight} title="The Legacy of Blood" meta="EBA · Season 1 · Episode 1" duration="24:10" href="#" /></div>;

export const ContinueWatching: Story = () => (
  <div style={row}><MediaCard kind="episode" width={280} image={episode} lightMap={episodeLight} logo={logo} logoAlt="EBA" progress={0.28} title="The Legacy of Blood" meta="EBA · Season 1 · Episode 1" href="#" /></div>
);

export const Short: Story = () => (
  <div style={row}><MediaCard kind="short" width={140} image={short} lightMap={shortLight} imagePosition="62% center" duration="0:24" count="1.2M views" title="The popcorn incident" href="#" /></div>
);

export const Manga: Story = () => (
  <div style={row}><MediaCard kind="manga" width={150} image={manga} lightMap={mangaLight} alt="The Winter cover" badge={<Badge variant="new">New</Badge>} title="The Winter" meta="Bad Memories · 15 pages" href="#" /></div>
);

export const Attention: Story = () => (
  <div style={row}>
    <MediaCard kind="episode" width={240} image={episode} title="The Legacy of Blood" meta="Cut · 3 takes" attention href="#" />
    <MediaCard kind="episode" width={240} image={episode} title="The Winter Ball" meta="14 Oct · 3.4K views" href="#" />
  </div>
);

export const Small: Story = () => (
  <div style={row}>
    <MediaCard kind="episode" width={160} image={episode} title="Episode 1" />
    <MediaCard kind="episode" width={64} image={episode} />
    <MediaCard kind="short" width={56} image={short} imagePosition="62% center" />
  </div>
);

export const Playground: Story<MediaCardProps> = (args) => <MediaCard {...args} />;
Playground.args = { kind: 'episode', image: episode, lightMap: episodeLight, width: 280, title: 'The Legacy of Blood', meta: 'EBA · Season 1 · Episode 1', duration: '24:10', attention: false, light: true, href: '#' };
Playground.argTypes = { kind: { options: ['episode', 'short', 'manga'], control: { type: 'radio' } } };

export const NoCover: Story = () => <div style={row}><MediaCard kind="episode" width={280} image="" title="The Burning" meta="Episode 3 · Write scene 1" href="#" /></div>;

/* In a creator's list each card has its own ⋯ on the art's top corner; a short's time moves to the foot */
const cardMenu = (title: string) => ({ items: [{ label: 'Rename', icon: 'edit' as const }, { label: 'Delete ' + title, icon: 'close' as const, tone: 'danger' as const, separated: true }] });
export const WithMenu: Story = () => (
  <div style={row}>
    <MediaCard kind="episode" width={240} image={episode} title="The Legacy of Blood" meta="Cut · 3 takes" href="#" menu={cardMenu('The Legacy of Blood')} />
    <MediaCard kind="short" width={150} image={short} imagePosition="62% center" duration="0:42" title="Red Line" meta="Script" href="#" menu={cardMenu('Red Line')} />
  </div>
);
