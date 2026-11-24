import type { Story, StoryDefault } from '@ladle/react';
import { Stages, type StagesProps } from './Stages';

export default { title: 'AniCanonKit / AniCanon / Stages' } satisfies StoryDefault;

const box = { width: 520 } as const;

const items: StagesProps['items'] = [
  { title: 'Face locked in', text: 'Studied the reference and drew the face sheet', state: 'done', time: '0:52' },
  { title: 'Designing the first look', text: 'Putting together the gray pinstripe dress', state: 'running', time: '0:31' },
  { title: 'Composing the identity sheet', text: 'The card every scene draws Kiko from', state: 'todo' },
];

export const Running: Story = () => <div style={box}><Stages items={items} /></div>;

export const Failed: Story = () => (
  <div style={box}>
    <Stages items={[items[0], { title: 'Designing the first look', text: 'The picture could not be drawn. Nothing was charged.', state: 'failed', time: '0:12' }, items[2]]} />
  </div>
);

export const Done: Story = () => <div style={box}><Stages items={items.map((s, i) => ({ ...s, state: 'done', time: ['0:52', '1:10', '0:40'][i] }))} /></div>;

export const Small: Story = () => <div style={box}><Stages size="sm" items={items} /></div>;

export const Playground: Story<StagesProps> = (args) => <div style={box}><Stages {...args} /></div>;
Playground.args = { items, label: 'Stages' };
Playground.argTypes = { size: { options: ['md', 'sm'], control: { type: 'radio' }, defaultValue: 'md' } };
