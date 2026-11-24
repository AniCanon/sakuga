import type { Story, StoryDefault } from '@ladle/react';
import { ActivityRow, type ActivityRowProps } from './ActivityRow';

export default { title: 'AniCanonKit / AniCanon / ActivityRow' } satisfies StoryDefault;

const box = { maxWidth: 520 } as const;

export const Collapsed: Story = () => <div style={box}><ActivityRow count={2} line="Tattoo · designing the look" /></div>;

export const Expanded: Story = () => <div style={box}><ActivityRow count={2} line="Tattoo · designing the look" expanded /></div>;

export const NoLine: Story = () => <div style={box}><ActivityRow count={1} /></div>;

/* What waits on you is said after what runs; with nothing running, a state dot stands where the loader turns */
export const Waiting: Story = () => (
  <div style={{ ...box, display: 'grid', gap: 8 }}>
    <ActivityRow count={4} waiting={2} line="Last train · rendering" />
    <ActivityRow count={0} waiting={2} line="Smith · new look ready" />
  </div>
);

export const Playground: Story<ActivityRowProps> = (args) => <div style={box}><ActivityRow {...args} /></div>;
Playground.args = { count: 2, line: 'Tattoo · designing the look', expanded: false };
