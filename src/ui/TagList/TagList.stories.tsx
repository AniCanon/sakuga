import type { Story, StoryDefault } from '@ladle/react';
import { useState } from 'react';
import { TagList, type TagListProps } from './TagList';

export default { title: 'Sakuga / Content / TagList' } satisfies StoryDefault;

export const Tags: Story = () => {
  const [items, set] = useState(['fire', 'red and black', 'street hero']);
  return <div style={{ width: 460 }}><TagList label="Visual vibe" items={items} onRemove={(_, i) => set(items.filter((__, k) => k !== i))} /></div>;
};

export const WithInput: Story = () => {
  const [items, set] = useState(['fire', 'red and black', 'street hero']);
  return <div style={{ width: 460 }}><TagList label="Visual vibe" items={items} placeholder="Add a vibe…" onRemove={(_, i) => set(items.filter((__, k) => k !== i))} onAdd={(w) => set([...items, w])} /></div>;
};

export const Off: Story = () => {
  const [items, set] = useState([{ label: 'Grey plaid overshirt' }, { label: 'Black crew-neck tee' }, { label: 'Canvas tote bag', off: true }]);
  const flip = (_: string, i: number) => set(items.map((t, k) => (k === i ? { ...t, off: !t.off } : t)));
  return <div style={{ width: 460 }}><TagList label="Garments" removeLabel="Leave out" restoreLabel="Add back" items={items} onRemove={flip} onRestore={flip} /></div>;
};

export const Playground: Story<TagListProps> = (args) => <div style={{ width: 460 }}><TagList {...args} /></div>;
Playground.args = { label: 'Visual vibe', items: ['fire', 'red and black', { label: 'street hero', off: true }], placeholder: 'Add a vibe…', removeLabel: 'Remove', restoreLabel: 'Add back' };
