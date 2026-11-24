import type { Story, StoryDefault } from '@ladle/react';
import { Readiness, type ReadinessProps } from './Readiness';

export default { title: 'AniCanonKit / Characters / Readiness' } satisfies StoryDefault;

const items: ReadinessProps['items'] = [
  { label: '6 looks', detail: '1 waiting on you', state: 'attention' },
  { label: 'Voice cast', detail: 'Shounen Hero' },
  { label: 'Face sheet', detail: 'Plus 1 variant' },
  { label: 'No props', detail: 'Optional' },
];

export const Waiting: Story = () => <Readiness items={items} />;

export const Ready: Story = () => <Readiness items={items.map((it) => ({ ...it, state: 'done', detail: it.state === 'attention' ? 'All approved' : it.detail }))} />;

export const Playground: Story<ReadinessProps> = (args) => <Readiness {...args} />;
Playground.args = { items, label: 'Ready' };
