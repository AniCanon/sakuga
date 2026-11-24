import type { Story, StoryDefault } from '@ladle/react';
import page3 from '@design/blobs/58712152b2bba652710113a4960adac9.jpg';
import page4 from '@design/blobs/944d9f8fbc4c3282ba308bf4409eae96.jpg';
import { IconButton } from '../../ui/IconButton/IconButton';
import { MangaPage, type MangaFrame, type MangaPageProps } from './MangaPage';

export default { title: 'AniCanonKit / Manga / MangaPage' } satisfies StoryDefault;

const row = { display: 'flex', gap: 20, alignItems: 'flex-start' } as const;
const frames: MangaFrame[] = [
  { x: 4, y: 4, w: 92, h: 30, number: '6.1' },
  { x: 4, y: 36, w: 44, h: 28, number: '6.2', state: 'drawing' },
  { x: 52, y: 36, w: 44, h: 28, number: '6.3', state: 'waiting' },
  { x: 4, y: 66, w: 92, h: 30, number: '6.4' },
];

export const Drawn: Story = () => <MangaPage image={page3} label="Page 3" title="3 · Bruce" meta="Lettered" />;

export const Selected: Story = () => <MangaPage image={page3} label="Page 3" title="3 · Bruce" meta="Lettered" selected />;

export const LaidOut: Story = () => <MangaPage frames={frames} numbers label="Page 6, drawing" title="6" meta="Drawing · 1 of 4" />;

export const Selection: Story = () => <MangaPage image={page4} label="Page 4" width={160} selection={{ x: 4, y: 36, w: 44, h: 28 }} selectionLabel="Panel 4.2 selected" />;

export const Mask: Story = () => <MangaPage image={page4} label="Page 4" width={160} mask={{ x: 52, y: 36, w: 44, h: 28 }} maskLabel="Panel 4.3, to redraw" />;

export const Blank: Story = () => <MangaPage blank label="Back cover, not made" title="Back" meta="Not made" />;

export const Spread: Story = () => (
  <div style={row}>
    <MangaPage image={page3} label="Page 3" title="3 · Bruce" meta="Lettered" />
    <MangaPage image={page4} label="Page 4" title="4 · First snow" meta="Drawn" align="end">
      <span slot="action"><IconButton variant="plain" icon="more" label="Page 4 menu" /></span>
    </MangaPage>
  </div>
);

export const Playground: Story<MangaPageProps> = (args) => <MangaPage {...args} />;
Playground.args = { width: 120, frames, numbers: true, label: 'Page 6', title: '6', meta: 'Drawing · 1 of 4', selected: false, blank: false };
