import type { Story, StoryDefault } from '@ladle/react';
import { Button } from '../../ui/Button/Button';
import { MakiCard, type MakiCardProps } from './MakiCard';

export default { title: 'AniCanonKit / Maki / MakiCard' } satisfies StoryDefault;

const col = { width: 340 };
const actions = <span slot="actions"><Button variant="ghost" size="sm">Reject</Button><Button variant="primary" size="sm">Accept</Button></span>;

export const StoryEdit: Story = () => <div style={col}><MakiCard eyebrow="Maki · Story edit" title="Move it earlier in the story" check="The story stays consistent with this edit">{actions}</MakiCard></div>;

export const Issue: Story = () => (
  <div style={col}>
    <MakiCard eyebrow="Maki · Issue" badge={{ label: 'Breaks the story', variant: 'alert', icon: 'warning' }} title="Lisa is in two places">
      <p>She is at Sé in section 3 and at home in section 4.</p>
      <span slot="actions"><Button variant="secondary" size="sm">Explain</Button></span>
    </MakiCard>
  </div>
);

/* Muted: one already decided; its pictures and icons fade, its words go quiet and keep AA, and it has nothing left to press */
export const Muted: Story = () => <div style={col}><MakiCard eyebrow="Maki · Story edit · accepted" title="Move it earlier in the story" check="The story stays consistent with this edit" muted /></div>;

/* Maki asking which: rich rows, one press answers, the answer ringed and the others faded */
export const Choices: Story = () => (
  <div style={col}>
    <MakiCard eyebrow="Maki · Which one?" title="Who hid the logbook?" chosen="genzo" choices={[
      { name: 'Genzo Arata', value: 'genzo', visual: { kind: 'avatar', initial: 'G' }, labels: [{ label: 'Harbor Watch' }, { label: 'Dead', variant: 'alert' }], source: 'In all 3' },
      { name: 'Mio Arata', value: 'mio', visual: { kind: 'avatar', initial: 'M' }, labels: [{ label: 'Lead' }], source: 'In 2' },
    ]} />
  </div>
);

export const Playground: Story<MakiCardProps> = (args) => <div style={col}><MakiCard {...args}>{actions}</MakiCard></div>;
Playground.args = { eyebrow: 'Maki · Story edit', title: 'Move it earlier in the story', check: 'The story stays consistent with this edit', muted: false };
