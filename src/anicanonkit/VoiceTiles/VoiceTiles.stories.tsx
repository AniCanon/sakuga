import type { Story, StoryDefault } from '@ladle/react';
import { useState } from 'react';
import { VoiceTiles, type VoiceTilesProps } from './VoiceTiles';

export default { title: 'AniCanonKit / Characters / VoiceTiles' } satisfies StoryDefault;

const options: VoiceTilesProps['options'] = [
  { label: 'Shounen Hero', description: 'Bright, determined' },
  { label: 'Cool', description: 'Low, unhurried' },
  { label: 'Gruff Mentor', description: 'Weathered, warm' },
  { label: 'Stoic Warrior', description: 'Flat, steady' },
  { label: 'Genki', description: 'Fast, sunny' },
];

export const Chosen: Story = () => {
  const [v, set] = useState('Shounen Hero');
  return <div style={{ width: 760 }}><VoiceTiles label="Archetype" value={v} onChange={set} options={options} /></div>;
};

export const NoneChosen: Story = () => <div style={{ width: 760 }}><VoiceTiles label="Archetype" options={options} /></div>;

export const Columns: Story = () => <div style={{ width: 480 }}><VoiceTiles label="Archetype" value="Cool" columns={3} options={options} /></div>;

export const Playground: Story<VoiceTilesProps> = (args) => <div style={{ width: 760 }}><VoiceTiles {...args} /></div>;
Playground.args = { label: 'Archetype', value: 'Cool', columns: 5, options };
