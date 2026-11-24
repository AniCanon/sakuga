import type { Story, StoryDefault } from '@ladle/react';
import { useState } from 'react';
import kiko from '@design/blobs/49427cdea65a882ce38fbe43e1fc916c.jpg';
import { Button } from '../../ui/Button/Button';
import { ProposalCard, type ProposalCardProps } from './ProposalCard';

export default { title: 'AniCanonKit / Writing / ProposalCard' } satisfies StoryDefault;

const col = { width: 250, display: 'grid', gap: 8 };

export const Stated: Story = () => <div style={col}><ProposalCard title="Toddy wires a second watch" note="New event · stated" accepted visual={{ kind: 'event', type: 'clue' }} /></div>;

export const Inferred: Story = () => <div style={col}><ProposalCard kind="inferred" title="Lisa · + Flaw" note="From “the wind answers too hard”" accepted={false} visual={{ kind: 'avatar', image: kiko }} /></div>;

export const Conflict: Story = () => (
  <div style={col}>
    <ProposalCard kind="conflict" title="Lisa is at Sé and at home" note="Sections 3 and 4">
      <span slot="action"><Button variant="secondary" size="sm">Ask Maki</Button></span>
    </ProposalCard>
  </div>
);

export const Toggle: Story = () => {
  const [on, set] = useState(true);
  return <div style={col}><ProposalCard title="Toddy wires a second watch" note="New event · stated" accepted={on} onAccept={set} visual={{ kind: 'event', type: 'clue' }} /></div>;
};

export const Playground: Story<ProposalCardProps> = (args) => <div style={col}><ProposalCard {...args} /></div>;
Playground.args = { title: 'Toddy wires a second watch', note: 'New event · stated', kind: 'stated', accepted: true, visual: { kind: 'event', type: 'clue' } };
Playground.argTypes = { kind: { options: ['stated', 'inferred', 'conflict'], control: { type: 'radio' } } };
