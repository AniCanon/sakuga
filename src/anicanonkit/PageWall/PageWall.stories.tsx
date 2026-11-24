import type { Story, StoryDefault } from '@ladle/react';
import cover from '@design/blobs/a6c677d20d5362900fb4fc56f7761a27.jpg';
import page3 from '@design/blobs/58712152b2bba652710113a4960adac9.jpg';
import page4 from '@design/blobs/944d9f8fbc4c3282ba308bf4409eae96.jpg';
import page5 from '@design/blobs/a924b4bf4b743d882e42a4c72699080d.jpg';
import { PageWall, type PageWallProps } from './PageWall';

export default { title: 'AniCanonKit / Manga / PageWall' } satisfies StoryDefault;

const spreads: PageWallProps['spreads'] = [
  [{ image: cover, label: 'Front cover', title: 'Cover', meta: 'Drawn', stage: 2 }],
  [{ image: page3, label: 'Page 3', title: '3 · Bruce', meta: 'Lettered', stage: 3 }, { image: page4, label: 'Page 4', title: '4 · First snow', meta: 'Proofed', stage: 4 }],
  [{ image: page5, label: 'Page 5', title: '5 · Ten missed calls', meta: 'Lettered', stage: 3 }, { frames: [{ x: 4, y: 4, w: 92, h: 30 }, { x: 4, y: 36, w: 44, h: 28, state: 'drawing' }, { x: 52, y: 36, w: 44, h: 28 }, { x: 4, y: 66, w: 92, h: 30 }], label: 'Page 6, drawing', title: '6', meta: 'Drawing · 1 of 4', stage: 1 }],
  [{ frames: [{ x: 4, y: 4, w: 56, h: 44 }, { x: 62, y: 4, w: 34, h: 44 }, { x: 4, y: 50, w: 92, h: 46 }], label: 'Page 7, laid out', title: '7', meta: 'Laid out', stage: 1 }, { frames: [{ x: 4, y: 4, w: 92, h: 58 }, { x: 4, y: 64, w: 92, h: 32 }], label: 'Page 8, laid out', title: '8', meta: 'Laid out', stage: 1 }],
  [{ blank: true, label: 'Back cover, not made', title: 'Back', meta: 'Not made', stage: 0 }],
];

export const Proof: Story = () => <PageWall spreads={spreads} size={64} columns={3} />;

export const Large: Story = () => <PageWall spreads={spreads.slice(0, 3)} columns={2} />;

export const Playground: Story<PageWallProps> = (args) => <PageWall {...args} />;
Playground.args = { spreads, size: 64, columns: 3, label: 'The whole issue' };
