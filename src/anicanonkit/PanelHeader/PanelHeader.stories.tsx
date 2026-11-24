import type { Story, StoryDefault } from '@ladle/react';
import { IconButton } from '../../ui/IconButton/IconButton';
import station from '@design/blobs/28395b51c4b11a6da6b67d8ff9d1b3e2.jpg';
import { PanelHeader, type PanelHeaderProps } from './PanelHeader';

export default { title: 'AniCanonKit / Story / PanelHeader' } satisfies StoryDefault;

const col = { width: 320 };

export const Panel: Story = () => (
  <div style={col}>
    <PanelHeader eyebrow="Event · Arc 2" title="Fire at Sé" subtitle="Ep 3 · p.14">
      <span slot="actions"><IconButton variant="plain" icon="edit" label="Edit" /></span>
    </PanelHeader>
  </div>
);

export const World: Story = () => <div style={col}><PanelHeader eyebrow="World" title="EBA" subtitle="After Ep 3" close={false} /></div>;

export const Media: Story = () => (
  <div style={col}>
    <PanelHeader eyebrow="Place" title="Sé station" subtitle="Burning since Ep 3" closeLabel="Close place">
      <span slot="media"><img src={station} alt="" style={{ width: 56, height: 36, objectFit: 'cover', borderRadius: 4 }} /></span>
    </PanelHeader>
  </div>
);

export const Inspector: Story = () => (
  <div style={col}>
    <PanelHeader title="Kiko" subtitle="Approved" close={false}>
      <span slot="actions"><IconButton variant="plain" icon="trash" label="Delete Kiko" /></span>
    </PanelHeader>
  </div>
);

export const Playground: Story<PanelHeaderProps> = (args) => <div style={col}><PanelHeader {...args} /></div>;
Playground.args = { eyebrow: 'Event · Arc 2', title: 'Fire at Sé', subtitle: 'Ep 3 · p.14', close: true, closeLabel: 'Close', level: 2 };
