import type { Story, StoryDefault } from '@ladle/react';
import { CharacterStats, type CharacterStat, type CharacterStatsProps } from './CharacterStats';

export default { title: 'AniCanonKit / Characters / CharacterStats' } satisfies StoryDefault;

const stats: CharacterStat[] = [
  { icon: 'gender-male', value: 'Male', label: 'Gender' },
  { icon: 'age-adult', value: 'Adult', label: 'Age' },
  { icon: 'height-tall', value: 'Tall', label: 'Height' },
  { icon: 'body-fit', value: 'Fit', label: 'Build' },
  { icon: 'faction-hero', value: 'Heros', label: 'Faction' },
  { icon: 'trait-leader', value: 'Leader', label: 'Role' },
];
const changed = stats.map((s) => (s.label === 'Build' ? { ...s, changed: true } : s));

export const Tiles: Story = () => <div style={{ width: 300 }}><CharacterStats stats={stats} /></div>;

export const Pills: Story = () => <div style={{ width: 620 }}><CharacterStats layout="pills" stats={stats} /></div>;

export const Changed: Story = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: 620 }}>
    <div style={{ width: 300 }}><CharacterStats stats={changed} /></div>
    <CharacterStats layout="pills" stats={changed} />
  </div>
);

export const Columns: Story = () => <div style={{ width: 400 }}><CharacterStats stats={stats} columns={2} /></div>;

export const Playground: Story<CharacterStatsProps> = (args) => <div style={{ width: 620 }}><CharacterStats {...args} /></div>;
Playground.args = { stats: changed };
Playground.argTypes = { layout: { options: ['tiles', 'pills'], control: { type: 'radio' }, defaultValue: 'tiles' } };
