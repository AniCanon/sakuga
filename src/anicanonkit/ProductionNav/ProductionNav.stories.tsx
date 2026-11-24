import type { Story, StoryDefault } from '@ladle/react';
import cover from '@design/blobs/70a79c6a67f31e4250d80f3e68d60502.jpg';
import scene from '@design/blobs/58712152b2bba652710113a4960adac9.jpg';
import { ProductionNav, type ProductionNavProps } from './ProductionNav';

export default { title: 'AniCanonKit / Productions / ProductionNav' } satisfies StoryDefault;

const frame = { display: 'flex', height: 900, background: 'var(--bg-canvas)' } as const;
const views: ProductionNavProps['views'] = [
  { icon: 'document', label: 'Script', note: '5 scenes' },
  { icon: 'frame-cinematic', label: 'Plan', note: '22 cuts' },
  { icon: 'video', label: 'Make', note: '3 to review', state: 'attention' },
  { icon: 'film', label: 'Cut', note: '6:40' },
  { icon: 'eye', label: 'Screen' },
  { icon: 'share', label: 'Publish' },
];
const sections: ProductionNavProps['sections'] = {
  title: 'Scenes', selected: 2,
  items: [{ number: 1, title: 'Toddy’s bedroom', note: 'In the cut', image: scene }, { number: 2, title: 'Smith’s apartment', note: '2 to review', state: 'attention', image: cover }, { number: 3, title: 'The stairs', note: 'In the cut' }],
};
const facts: ProductionNavProps['facts'] = [{ label: 'Cut', value: '6:40 of 11:00', percent: 60 }, { label: 'Story', value: 'After Kiko’s offer' }];
const tools: ProductionNavProps['tools'] = [{ icon: 'collection', label: 'Media' }, { icon: 'effect-sparks', label: 'Effects' }, { icon: 'volume', label: 'Audio' }, { icon: 'captions', label: 'Captions' }];

export const Expanded: Story = () => (
  <div style={frame}>
    <ProductionNav back={{ label: 'Episodes' }} production={{ title: 'The First Watch', meta: 'Episode 2 · Directed · 16:9', image: cover }} views={views} current="Make" sections={sections} facts={facts} balance="9,427" />
  </div>
);

export const Collapsed: Story = () => (
  <div style={frame}>
    <ProductionNav collapsed production={{ title: 'The First Watch', image: cover }} views={views} current="Cut" tools={tools} currentTool="Effects" balance="9,427" />
  </div>
);

export const Playground: Story<ProductionNavProps> = (args) => <div style={frame}><ProductionNav {...args} /></div>;
Playground.args = { back: { label: 'Episodes' }, production: { title: 'The First Watch', meta: 'Episode 2 · Directed · 16:9' }, views, current: 'Make', sections, facts, balance: '9,427', collapsed: false, tools, currentTool: 'Effects' };

/* A new episode: its Plan opens once the script is written, Screen and Publish once there is a cut */
const waiting: ProductionNavProps['views'] = [
  { icon: 'document', label: 'Script', note: 'Not started', href: '#script' },
  { icon: 'director', label: 'Plan', note: 'After the script', disabled: true },
  { icon: 'film', label: 'Cut', note: 'Empty', href: '#cut' },
  { icon: 'eye', label: 'Screen', note: 'After the cut', disabled: true },
  { icon: 'share', label: 'Publish', note: 'After the cut', disabled: true },
];

export const Waiting: Story = () => (
  <div style={frame}>
    <ProductionNav back={{ label: 'Episodes', href: '#episodes' }} production={{ title: 'The Burning', meta: 'Episode 3 · Directed' }} views={waiting} current="Cut" />
    <ProductionNav views={waiting} current="Cut" collapsed />
  </div>
);

/* The production's own ⋯ on its cover, on every view */
export const WithMenu: Story = () => (
  <div style={frame}>
    <ProductionNav back={{ label: 'Episodes' }} views={views} current="Make" sections={sections} facts={facts} balance="9,427"
      production={{ title: 'The First Watch', meta: 'Episode 2 · Directed · 16:9', image: cover, menu: { items: [{ label: 'Rename', icon: 'edit' }, { label: 'Delete The First Watch', icon: 'close', tone: 'danger', separated: true }] } }} />
  </div>
);
