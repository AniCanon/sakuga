import type { Story, StoryDefault } from '@ladle/react';
import { Badge } from '../Badge/Badge';
import { FlowHeader, type FlowHeaderProps } from './FlowHeader';

export default { title: 'Sakuga / Navigation / FlowHeader' } satisfies StoryDefault;

export const Steps: Story = () => <FlowHeader title="New character" context="EBA" closeLabel="Close. Nothing is created" steps={['Basics', 'How to make', 'Approve']} current={1} />;

export const OneStep: Story = () => <FlowHeader title="New issue" context="Bad Memories" closeLabel="Close. Nothing is created" />;

export const End: Story = () => (
  <FlowHeader title="New issue" context="Bad Memories" closeLabel="Close. Nothing is created" steps={['Story', 'Covers']} current={0}>
    <span slot="end"><Badge>Draft</Badge></span>
  </FlowHeader>
);

export const Playground: Story<FlowHeaderProps> = (args) => <FlowHeader {...args} />;
Playground.args = { title: 'New character', context: 'EBA', closeLabel: 'Close. Nothing is created', steps: ['Basics', 'How to make', 'Approve'], current: 1, stepsLabel: 'Steps' };
