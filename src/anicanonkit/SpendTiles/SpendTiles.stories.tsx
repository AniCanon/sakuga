import type { Story, StoryDefault } from '@ladle/react';
import { useState } from 'react';
import { SpendTiles, type SpendTilesProps } from './SpendTiles';

export default { title: 'AniCanonKit / Fragments / SpendTiles' } satisfies StoryDefault;

const packs: SpendTilesProps['options'] = [
  { value: 'spark', label: 'Spark', amount: '9,990', description: '$9.99 · never expires' },
  { value: 'bloom', label: 'Bloom', amount: '24,990', description: '$24.99 · never expires', badge: 'Best value' },
  { value: 'cascade', label: 'Cascade', amount: '99,990', description: '$99.99 · never expires' },
];
const ways: SpendTilesProps['options'] = [
  { value: 'words', label: 'From words', icon: 'document', description: 'Describe the look and we draw it.', cost: '~10 a second' },
  { value: 'photo', label: 'From a photo', icon: 'image', description: 'Start from a picture you have.', cost: '~12 a second', footnote: 'Best for a likeness' },
  { value: 'sheet', label: 'From a sheet', icon: 'collection', description: 'A character sheet you drew.', disabled: true, badge: 'Coming soon' },
];

function Live(props: Omit<SpendTilesProps, 'value' | 'onChange'> & { start: string }) {
  const [v, set] = useState(props.start);
  return <SpendTiles {...props} value={v} onChange={set} />;
}

export const Packs: Story = () => <div style={{ maxWidth: 640 }}><Live size="lg" columns={3} label="Fragments packs" start="bloom" options={packs} /></div>;

export const Costs: Story = () => <div style={{ maxWidth: 720 }}><Live size="lg" label="How to make it" start="words" options={ways} /></div>;

export const Rows: Story = () => <div style={{ maxWidth: 360 }}><Live size="lg" columns={1} label="Fragments packs" start="spark" options={packs} /></div>;

export const Playground: Story<SpendTilesProps> = (args) => <div style={{ maxWidth: 640 }}><SpendTiles {...args} options={packs} /></div>;
Playground.args = { size: 'lg', columns: 3, label: 'Fragments packs', value: 'bloom' };
