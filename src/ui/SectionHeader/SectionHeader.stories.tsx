import type { Story, StoryDefault } from '@ladle/react';
import { Button } from '../Button/Button';
import { SectionHeader, type SectionHeaderProps } from './SectionHeader';

export default { title: 'Sakuga / Navigation / SectionHeader' } satisfies StoryDefault;

const column = { display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 720 } as const;

export const Shelf: Story = () => (
  <div style={column}>
    <SectionHeader title="Shorts" subtitle="Vertical videos under a minute from EBA · moments, trailers, behind the scenes" action={{ label: 'See all', ariaLabel: 'See all EBA shorts', href: '#shorts' }} />
  </div>
);

export const Sizes: Story = () => (
  <div style={column}>
    <SectionHeader title="Episodes" subtitle="Season 1 · 12 episodes" />
    <SectionHeader size="md" title="Cast" subtitle="23 characters in the story" />
    <SectionHeader size="sm" title="Wardrobe" subtitle="Looks for every occasion" />
    <SectionHeader size="xs" title="The issue, spread by spread" />
  </div>
);

export const Group: Story = () => (
  <div style={column}>
    <SectionHeader as="h3" size="sm" icon="characters" count={4} title="The Guild">
      <Button size="sm" variant="secondary">Add</Button>
    </SectionHeader>
  </div>
);

export const Playground: Story<SectionHeaderProps> = (args) => <div style={column}><SectionHeader {...args} /></div>;
Playground.args = { title: 'Shorts', subtitle: 'Videos under a minute' };
Playground.argTypes = { size: { options: ['lg', 'md', 'sm', 'xs'], control: { type: 'radio' }, defaultValue: 'lg' } };
