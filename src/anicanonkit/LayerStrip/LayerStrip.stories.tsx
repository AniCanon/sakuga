import type { Story, StoryDefault } from '@ladle/react';
import { useState } from 'react';
import cover from '@design/blobs/a6c677d20d5362900fb4fc56f7761a27.jpg';
import panel from '@design/blobs/00edb02065ac7732b6c29634034e4111.jpg';
import page3 from '@design/blobs/58712152b2bba652710113a4960adac9.jpg';
import page4 from '@design/blobs/944d9f8fbc4c3282ba308bf4409eae96.jpg';
import { IssueStrip } from '../IssueStrip/IssueStrip';
import { LayerStrip, type LayerStripProps } from './LayerStrip';

export default { title: 'AniCanonKit / Manga / LayerStrip' } satisfies StoryDefault;

const box = { maxWidth: 640 } as const;
const tracks: LayerStripProps['tracks'] = [
  { kind: 'panels', label: 'Panels', items: [{ number: '3.1', image: panel, selected: true }, { number: '3.2' }, { number: '3.3' }, { number: '3.4' }] },
  { kind: 'lettering', label: 'Lettering', items: [{ number: '3.1', label: 'Caption · I’m Bruce' }, { number: '3.2', label: 'Caption · Every snowfall…' }, { number: '3.3', label: 'Sign · Kissaten', muted: true }] },
  { kind: 'sfx', label: 'Sound effects', items: [] },
];
const spreads = [[{ image: cover, label: 'Front cover' }], [{ image: page3, label: 'Page 3', selected: true }, { image: page4, label: 'Page 4' }]];

function Choosing() {
  const [at, setAt] = useState([0, 0]);
  const live = tracks.map((t, i) => ({ ...t, items: t.items.map((it, j) => ({ ...it, selected: at[0] === i && at[1] === j })) }));
  return <LayerStrip tracks={live} onSelect={(t, j) => setAt([t, j])} />;
}

export const Layers: Story = () => <div style={box}><LayerStrip tracks={tracks} /></div>;

export const Choosable: Story = () => <div style={box}><Choosing /></div>;

export const WithIssue: Story = () => (
  <div style={box}>
    <LayerStrip tracks={tracks}><IssueStrip size={18} label="The issue" spreads={spreads} /></LayerStrip>
  </div>
);

export const Playground: Story<LayerStripProps> = (args) => <div style={box}><LayerStrip {...args} /></div>;
Playground.args = { tracks, emptyLabel: 'None yet' };
