import type { Story, StoryDefault } from '@ladle/react';
import { Button } from '../Button/Button';
import { StatusBar, type StatusBarProps } from './StatusBar';

export default { title: 'Sakuga / Containers / StatusBar' } satisfies StoryDefault;

export const Writing: Story = () => (
  <StatusBar>
    <Button variant="ghost" size="sm" icon="bookmark" iconEnd="chevron-down">Starts after Fire at Sé</Button>
    <span>106 words · 3 sections</span>
    <span slot="status">Saved</span>
    <span slot="end">Refunded if finding events fails</span>
  </StatusBar>
);

export const Facts: Story = () => <StatusBar items={['Scene 4', '12 cuts', '2:41']} />;

export const Saving: Story = () => <StatusBar items={['106 words · 3 sections']} status="Saving…" />;

export const Playground: Story<StatusBarProps> = (args) => <StatusBar {...args} />;
Playground.args = { items: ['106 words · 3 sections'], status: 'Saved', end: 'Refunded if finding events fails' };
