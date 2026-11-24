import type { Story, StoryDefault } from '@ladle/react';
import { useState, type CSSProperties } from 'react';
import { TabBar, type TabBarProps, type TabItem } from './TabBar';

export default { title: 'Sakuga / Navigation / TabBar' } satisfies StoryDefault;

const DESTINATIONS: [string, TabItem['icon']][] = [['Home', 'home'], ['Shorts', 'shorts'], ['Manga', 'manga'], ['You', 'you']];
/* A phone's page with the bar at its foot, as the web form sits in the phone shell */
const phone: CSSProperties = { display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', width: 390, height: 160, boxShadow: 'inset 0 0 0 1px var(--border-divider)' };

function Live(props: { start: string }) {
  const [at, go] = useState(props.start);
  const items = DESTINATIONS.map(([label, icon]) => ({ label, icon, current: at === label, onClick: () => go(label) }));
  return <div style={phone}><TabBar variant="web" label="Main" items={items} createCurrent={at === 'Create'} onCreate={() => go('Create')} /></div>;
}

export const Web: Story = () => <Live start="Home" />;

export const StudioCreateCurrent: Story = () => <Live start="Create" />;

export const Links: Story = () => (
  <div style={phone}>
    <TabBar variant="web" label="Main" createHref="/new" items={DESTINATIONS.map(([label, icon], i) => ({ label, icon, href: '/' + label.toLowerCase(), current: i === 1 }))} />
  </div>
);

export const Playground: Story<TabBarProps> = (args) => <div style={phone}><TabBar {...args} /></div>;
Playground.args = { variant: 'web', label: 'Main', createHref: '/new', createCurrent: false, hidden: false, items: DESTINATIONS.map(([label, icon], i) => ({ label, icon, href: '/' + label.toLowerCase(), current: i === 0 })) };
