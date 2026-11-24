import { useState } from 'react';
import type { Story, StoryDefault } from '@ladle/react';
import art from '@design/blobs/dc889fdc8d3ca88f17aa579da03ad184.jpg';
import { Button } from '../Button/Button';
import { AudioPlayer, type AudioPlayerProps } from './AudioPlayer';

export default { title: 'Sakuga / Media / AudioPlayer' } satisfies StoryDefault;

const col = { maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 24 } as const;

function useSeek(start: number) {
  const [value, onSeek] = useState(start);
  return { value, onSeek };
}

export const Titled: Story = () => {
  const a = useSeek(1.6);
  return (
    <div style={col}>
      <AudioPlayer title="His voice" subtitle="Cast as Shounen Hero · warm, a little husky" duration={4} {...a}>
        <Button variant="ghost" size="sm" icon="mic">Recast</Button>
      </AudioPlayer>
    </div>
  );
};

export const Small: Story = () => {
  const a = useSeek(0.8);
  return <div style={col}><AudioPlayer size="sm" duration={4} seed={3} label="Take 2" {...a} /></div>;
};

export const Playing: Story = () => <div style={col}><AudioPlayer title="Rain on glass" duration={40} value={12} playing /></div>;

/* media is for a player on dark art: over the key art, under the scrim a page puts there for legibility */
export const Media: Story = () => (
  <div style={{ ...col, position: 'relative', padding: 20, borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
    <img src={art} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent, rgb(0 0 0 / .7))' }} />
    <div style={{ position: 'relative' }}>
      <AudioPlayer variant="media" title="His voice" subtitle="Cast as Shounen Hero" duration={4} value={2} />
    </div>
  </div>
);

export const Playground: Story<AudioPlayerProps> = (args) => <div style={col}><AudioPlayer {...args} /></div>;
Playground.args = { title: 'His voice', subtitle: 'Cast as Shounen Hero', duration: 4, value: 1.6 };
Playground.argTypes = {
  size: { options: ['md', 'sm'], control: { type: 'radio' }, defaultValue: 'md' },
  variant: { options: ['default', 'media'], control: { type: 'radio' }, defaultValue: 'default' },
};
