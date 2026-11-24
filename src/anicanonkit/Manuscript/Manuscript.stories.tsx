import type { Story, StoryDefault } from '@ladle/react';
import { StatusBar } from '../../ui/StatusBar/StatusBar';
import { Text } from '../../ui/Text/Text';
import { ManuscriptSection } from '../ManuscriptSection/ManuscriptSection';
import { Manuscript, type ManuscriptProps } from './Manuscript';

export default { title: 'AniCanonKit / Writing / Manuscript' } satisfies StoryDefault;

const page = { height: 290, display: 'flex', flexDirection: 'column' as const, width: 720 };

export const Script: Story = () => (
  <div style={page}>
    <Manuscript label="The Winter script">
      <span slot="toolbar"><Text variant="caption">Writing section 4 · @ cast · # places</Text></span>
      <ManuscriptSection number={3} title="Bruce at home">Bruce sits on the sofa, the TV on, the snow outside.</ManuscriptSection>
      <ManuscriptSection number={4} title="Ten missed calls" current>His phone lights up again. Jen. He lets it ring.</ManuscriptSection>
      <span slot="footer"><StatusBar><span>Saved</span><span>9 sections</span></StatusBar></span>
    </Manuscript>
  </div>
);

export const Bare: Story = () => (
  <div style={page}>
    <Manuscript><ManuscriptSection number={1} title="The roof">After the fire, Toddy wires a second watch for Lisa.</ManuscriptSection></Manuscript>
  </div>
);

export const Playground: Story<ManuscriptProps> = (args) => (
  <div style={page}><Manuscript {...args}><ManuscriptSection number={1} title="The roof" current>After the fire, Toddy wires a second watch.</ManuscriptSection></Manuscript></div>
);
Playground.args = { label: 'Script' };
