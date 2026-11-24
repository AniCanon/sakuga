import type { Story, StoryDefault } from '@ladle/react';
import { useState } from 'react';
import { Button } from '../Button/Button';
import { PropertyList, type PropertyListProps } from './PropertyList';

export default { title: 'Sakuga / Content / PropertyList' } satisfies StoryDefault;

const direction: PropertyListProps['items'] = [
  { icon: 'camera', label: 'Shot type', value: 'Over the shoulder' },
  { icon: 'angle-eye-level', label: 'Camera angle', value: 'Eye level' },
  { icon: 'bolt', label: 'Lighting', value: 'The phone’s glow' },
  { icon: 'aspect', label: 'Lens', value: 'Normal' },
];

export const Direction: Story = () => (
  <div style={{ width: 300 }}>
    <PropertyList label="Direction" items={direction}><span slot="action"><Button variant="ghost" size="sm">All options</Button></span></PropertyList>
  </div>
);

export const Expanded: Story = () => {
  const [open, setOpen] = useState(0);
  const items = direction.map((it, i) => ({ ...it, expanded: open === i, onClick: () => setOpen(open === i ? -1 : i) }));
  return <div style={{ width: 300 }}><PropertyList label="Direction" items={items} /></div>;
};

export const NoLabel: Story = () => <div style={{ width: 300 }}><PropertyList items={direction.slice(0, 2)} /></div>;

export const Links: Story = () => <div style={{ width: 300 }}><PropertyList label="Direction" items={direction.map((it) => ({ ...it, href: '#' + it.label }))} /></div>;

export const Playground: Story<PropertyListProps> = (args) => <div style={{ width: 300 }}><PropertyList {...args} /></div>;
Playground.args = { label: 'Direction', items: direction };
