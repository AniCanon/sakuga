import type { Story, StoryDefault } from '@ladle/react';
import kiko from '@design/blobs/49427cdea65a882ce38fbe43e1fc916c.jpg';
import { EntityRow } from '../EntityRow/EntityRow';
import { PanelSection, type PanelSectionProps } from './PanelSection';

export default { title: 'AniCanonKit / Story / PanelSection' } satisfies StoryDefault;

const col = { width: 320 };

export const Rows: Story = () => (
  <div style={col}>
    <PanelSection label="Places" count="2 changed">
      <EntityRow visual={{ kind: 'place' }} name="Sé station" after="Burning" afterVariant="alert" afterIcon="trait-fierce" chip="Ep 3" />
      <EntityRow visual={{ kind: 'avatar', image: kiko }} name="Kiko" before="Calm" after="Wary" chip="Ep 2" />
    </PanelSection>
  </div>
);

export const Footer: Story = () => (
  <div style={col}>
    <PanelSection label="Changes" count={3}>
      <EntityRow visual={{ kind: 'event', type: 'clue' }} name="A ticket stub" chip="Ep 2" />
      <span slot="footer">Two more after this moment</span>
    </PanelSection>
  </div>
);

export const Playground: Story<PanelSectionProps> = (args) => (
  <div style={col}><PanelSection {...args}><EntityRow visual={{ kind: 'place' }} name="Sé station" after="Burning" chip="Ep 3" /></PanelSection></div>
);
Playground.args = { label: 'Places', count: '2 changed' };
