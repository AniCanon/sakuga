import type { Story, StoryDefault } from '@ladle/react';
import cover from '@design/blobs/a6c677d20d5362900fb4fc56f7761a27.jpg';
import page3 from '@design/blobs/58712152b2bba652710113a4960adac9.jpg';
import page4 from '@design/blobs/944d9f8fbc4c3282ba308bf4409eae96.jpg';
import page5 from '@design/blobs/a924b4bf4b743d882e42a4c72699080d.jpg';
import { IssueStrip, type IssueStripProps } from './IssueStrip';

export default { title: 'AniCanonKit / Manga / IssueStrip' } satisfies StoryDefault;

const spreads: IssueStripProps['spreads'] = [
  [{ image: cover, label: 'Front cover' }],
  [{ image: page3, label: 'Page 3' }, { image: page4, label: 'Page 4' }],
  [{ image: page5, label: 'Page 5', selected: true }, { frames: [{ x: 4, y: 4, w: 92, h: 30 }, { x: 4, y: 36, w: 44, h: 28, state: 'drawing' }, { x: 52, y: 36, w: 44, h: 28 }, { x: 4, y: 66, w: 92, h: 30 }], label: 'Page 6, drawing' }],
  [{ frames: [{ x: 4, y: 4, w: 56, h: 44 }, { x: 62, y: 4, w: 34, h: 44 }, { x: 4, y: 50, w: 92, h: 46 }], label: 'Page 7, laid out' }, { frames: [{ x: 4, y: 4, w: 92, h: 58 }, { x: 4, y: 64, w: 92, h: 32 }], label: 'Page 8, laid out' }],
  [{ blank: true, label: 'Back cover, not made' }],
];

export const Editor: Story = () => <IssueStrip spreads={spreads} />;

export const Layout: Story = () => <IssueStrip spreads={spreads} size={56} />;

export const SpreadMode: Story = () => <IssueStrip spreads={spreads} size={56} selectSpread />;

export const NoHeader: Story = () => <IssueStrip spreads={spreads} size={18} label={false} />;

export const Playground: Story<IssueStripProps> = (args) => <IssueStrip {...args} />;
Playground.args = { spreads, size: 30, selectSpread: false, label: 'The issue, spread by spread', turnLabel: 'Page turn' };
