import { useState } from 'react';
import type { Story, StoryDefault } from '@ladle/react';
import art from '@design/blobs/70a79c6a67f31e4250d80f3e68d60502.jpg';
import { Thumb } from '../../ui/Thumb/Thumb';
import { Monitor, type MonitorProps } from './Monitor';

export default { title: 'AniCanonKit / Productions / Monitor' } satisfies StoryDefault;

const box = { maxWidth: 520 } as const;

export const Picture: Story = () => <div style={box}><Monitor image={art} alt="Kiko on the platform" labels={['2C · take 3', '2:41 + 04f']} height={180} /></div>;

export const Guides: Story = () => (
  <div style={box}>
    <Monitor image={art} labels={['2C · take 3']} labelsEnd={['Title safe']} height={220}
      guides={[{ x: 5, y: 5, w: 90, h: 90 }, { x: 30, y: 20, w: 40, h: 30, accent: true }]} region={{ x: 52, y: 52, w: 36, h: 36, label: 'Glow' }} />
  </div>
);

export const Centered: Story = () => (
  <div style={box}>
    <Monitor centered labels={['Short · 9:16']} height={260}><Thumb image={art} imageStyle="object-position:62% 34%" width={132} height={236} /></Monitor>
  </div>
);

export const Contain: Story = () => <div style={box}><Monitor image={art} fit="contain" labels={['Take 3']} height={200} /></div>;

export const Fill: Story = () => <div style={{ ...box, height: 240, display: 'flex', flexDirection: 'column' }}><Monitor image={art} fill labels={['Page 4']} /></div>;

/* A picture in a column of another shape: the Monitor is the picture's own shape, centred, its labels on it */
export const PictureShape: Story = () => (
  <div style={{ ...box, height: 271, display: 'flex' }}>
    <Monitor image={art} fit="picture" alt="Kiko on the platform" labels={['2C · take 3 · Opening frame', '2:41 + 04f']} labelsEnd={['16:9']} />
  </div>
);

export const Playground: Story<MonitorProps> = (args) => <div style={box}><Monitor image={art} {...args} /></div>;
Playground.args = { labels: ['2C · take 3', '2:41 + 04f'], height: 180, centered: false, fill: false, alt: '' };
Playground.argTypes = { fit: { options: ['cover', 'contain'], control: { type: 'radio' }, defaultValue: 'cover' } };

/* The program's frame whatever the picture: a 9:16 short's, with no picture yet */
export const Ratio: Story = () => <div style={{ ...box, height: 260, display: 'flex', flexDirection: 'column' }}><Monitor ratio="9 / 16" labels={['0:00 + 00f']} /></div>;

/* Clicking the picture selects what is under the playhead: the title on top, then the clip beneath; hover outlines what a click takes */
export const Picks: Story = () => {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div style={box}>
      <Monitor image={art} labels={['2C · take 3']} height={220} selected={selected} onPick={setSelected}
        picks={[{ id: 'title', label: 'Three days later', box: { x: 10, y: 40, w: 50, h: 20 }, editable: true }, { id: 'clip', label: '2C · take 3', box: { x: 0, y: 0, w: 100, h: 100 } }]} />
    </div>
  );
};
