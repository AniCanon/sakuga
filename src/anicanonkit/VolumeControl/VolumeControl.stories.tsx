import type { Story, StoryDefault } from '@ladle/react';
import { useState } from 'react';
import { VolumeControl, type VolumeControlProps } from './VolumeControl';

export default { title: 'AniCanonKit / Productions / VolumeControl' } satisfies StoryDefault;

const box = { width: 268 } as const;

function Live({ muted }: { muted?: boolean }) {
  const [s, set] = useState({ v: 80, m: !!muted });
  return <VolumeControl value={s.v} muted={s.m} what="the video’s own sound" onMute={() => set({ v: s.v, m: !s.m })} onChange={(v) => set({ v, m: false })} />;
}

export const Level: Story = () => <div style={box}><Live /></div>;

export const Muted: Story = () => <div style={box}><Live muted /></div>;

export const ReadOnly: Story = () => <div style={box}><VolumeControl value={40} what="the music" /></div>;

export const Playground: Story<VolumeControlProps> = (args) => <div style={box}><VolumeControl {...args} /></div>;
Playground.args = { value: 80, muted: false, what: 'the sound' };
