import { useState } from 'react';
import type { Story, StoryDefault } from '@ladle/react';
import { Waveform, type WaveformProps } from './Waveform';

export default { title: 'Sakuga / Media / Waveform' } satisfies StoryDefault;

const col = { display: 'grid', gap: 20, maxWidth: 440 } as const;

export const Seekable: Story = () => {
  const [v, set] = useState(1.4);
  return <div style={col}><Waveform duration={4} value={v} onSeek={set} seed={5} label="Position in Rain on glass" /></div>;
};

export const Picture: Story = () => <div style={col}><Waveform seed={8} /><Waveform seed={12} duration={4} value={2.5} /></div>;

export const Selected: Story = () => (
  <div style={{ ...col, maxWidth: 180 }}>
    <Waveform seed={4} size="sm" />
    <Waveform seed={8} size="sm" selected />
    <Waveform seed={12} size="sm" />
  </div>
);

export const Sizes: Story = () => <div style={col}><Waveform seed={3} /><Waveform seed={3} size="sm" /></div>;

export const Peaks: Story = () => (
  <div style={col}><Waveform peaks={[0.1, 0.3, 0.8, 1, 0.6, 0.2, 0.15, 0.5, 0.9, 0.7, 0.3, 0.1, 0.05, 0.4, 0.8, 0.6]} duration={4} value={1} /></div>
);

export const Media: Story = () => (
  <div style={{ ...col, padding: 20, background: 'var(--bg-media)' }}><Waveform seed={6} variant="media" duration={4} value={2} /></div>
);

export const Playground: Story<WaveformProps> = (args) => <div style={col}><Waveform {...args} /></div>;
Playground.args = { seed: 5, duration: 4, value: 1.4, selected: false };
Playground.argTypes = {
  size: { options: ['md', 'sm'], control: { type: 'radio' }, defaultValue: 'md' },
  variant: { options: ['default', 'media'], control: { type: 'radio' }, defaultValue: 'default' },
};
