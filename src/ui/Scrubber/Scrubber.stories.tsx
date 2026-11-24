import { useState } from 'react';
import type { Story, StoryDefault } from '@ladle/react';
import { Scrubber, type ScrubberProps } from './Scrubber';

export default { title: 'Sakuga / Media / Scrubber' } satisfies StoryDefault;

/* Always over video or the player bar */
const bar = { padding: 20, background: 'var(--bg-media)', maxWidth: 640 } as const;

function Live(props: Partial<ScrubberProps>) {
  const [v, set] = useState(props.value ?? 192);
  return <Scrubber max={696} buffered={320} {...props} value={v} onChange={set} />;
}

export const Default: Story = () => <div style={bar}><Live /></div>;

export const Chapters: Story = () => <div style={bar}><Live markers={[84, 312, 540]} /></div>;

export const WithoutTimes: Story = () => <div style={bar}><Live max={42} value={9} buffered={30} showTimes={false} /></div>;

export const ReadOnly: Story = () => <div style={bar}><Scrubber value={192} max={696} buffered={320} label="Played" /></div>;

export const Playground: Story<ScrubberProps> = (args) => <div style={bar}><Scrubber {...args} /></div>;
Playground.args = { value: 192, max: 696, buffered: 320, step: 10, showTimes: true, label: 'Seek' };
