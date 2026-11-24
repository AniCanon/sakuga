import type { Story, StoryDefault } from '@ladle/react';
import { ProposalCard } from '../ProposalCard/ProposalCard';
import { ManuscriptSection, type ManuscriptSectionProps } from './ManuscriptSection';

export default { title: 'AniCanonKit / Writing / ManuscriptSection' } satisfies StoryDefault;

const col = { width: 640 };
const wide = { width: 900, padding: 24 };

export const Section: Story = () => <div style={col}><ManuscriptSection number={1} title="The roof" words={34}>After the fire, Toddy wires a second watch for Lisa.</ManuscriptSection></div>;

export const Slugline: Story = () => <div style={col}><ManuscriptSection number={2} title="INT. TODDY’S BEDROOM — NIGHT" slug words={18}>Toddy at the desk, the second watch open in his hands.</ManuscriptSection></div>;

export const Current: Story = () => <div style={wide}><ManuscriptSection number={4} title="Ten missed calls" current>His phone lights up again. Jen. He lets it ring.</ManuscriptSection></div>;

export const Margin: Story = () => (
  <div style={wide}>
    <ManuscriptSection number={1} title="The roof" words={34}>
      After the fire, Toddy wires a second watch for Lisa.
      <span slot="margin"><ProposalCard title="Toddy wires a second watch" note="New event · stated" accepted visual={{ kind: 'event', type: 'clue' }} /></span>
    </ManuscriptSection>
  </div>
);

export const AtTheSameTime: Story = () => (
  <div style={col}>
    <ManuscriptSection number={4} title="Toddy’s bedroom" words={22}>His phone lights up. Kiko’s name.</ManuscriptSection>
    <ManuscriptSection number={5} title="Sé station" words={18} with={{ number: 4, title: 'Toddy’s bedroom', told: 'Cut between them' }}>Kiko steps out of the smoke, the phone at her ear.</ManuscriptSection>
  </div>
);

export const Playground: Story<ManuscriptSectionProps> = (args) => <div style={wide}><ManuscriptSection {...args} /></div>;
Playground.args = { number: 1, title: 'The roof', words: 34, slug: false, current: false, children: 'After the fire, Toddy wires a second watch for Lisa.' };
