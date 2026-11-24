import type { Story, StoryDefault } from '@ladle/react';
import { FragmentBalance, type FragmentBalanceProps } from './FragmentBalance';

export default { title: 'AniCanonKit / AniCanon / FragmentBalance' } satisfies StoryDefault;

const col = { display: 'grid', gap: 12, maxWidth: 360 } as const;

export const Pill: Story = () => <div style={col}><div><FragmentBalance amount="9,427" /></div><div><FragmentBalance amount="9,427" caption="left" /></div></div>;

export const Block: Story = () => <div style={col}><FragmentBalance variant="block" amount="9,427" /></div>;

export const Held: Story = () => <div style={col}><FragmentBalance variant="held" amount="20" text="Charged when you approve it." /></div>;

export const Inline: Story = () => <p style={{ margin: 0, font: 'var(--text-body)', color: 'var(--text-primary)' }}><FragmentBalance variant="inline" amount="~520" /> is held when you start.</p>;

export const Card: Story = () => (
  <div style={col}>
    <FragmentBalance variant="card" amount="9,427" title="Creator" caption="available · Fragments never expire" held="520" text="for 2 jobs in progress" />
  </div>
);

export const Playground: Story<FragmentBalanceProps> = (args) => <div style={col}><FragmentBalance {...args} /></div>;
Playground.args = { amount: '9,427', caption: '', title: 'Creator', text: 'for 2 jobs in progress', held: '520' };
Playground.argTypes = { variant: { options: ['pill', 'block', 'held', 'inline', 'card'], control: { type: 'select' }, defaultValue: 'pill' } };
