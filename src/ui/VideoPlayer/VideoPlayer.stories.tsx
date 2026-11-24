import type { Story, StoryDefault } from '@ladle/react';
import still from '@design/blobs/70a79c6a67f31e4250d80f3e68d60502.jpg';
import { VideoPlayer, type VideoPlayerProps } from './VideoPlayer';

export default { title: 'Sakuga / Media / VideoPlayer' } satisfies StoryDefault;

const page = { padding: 20, maxWidth: 640 } as const;
const clip = { name: 'Red Line fight', alt: 'Two fighters trade blows on a platform', poster: still, duration: 8 };

export const Paused: Story = () => <div style={page}><VideoPlayer {...clip} time={3} /></div>;

export const Playing: Story = () => <div style={page}><VideoPlayer {...clip} time={5} playing /></div>;

export const Loading: Story = () => <div style={page}><VideoPlayer {...clip} time={5} playing loading /></div>;

export const Ended: Story = () => <div style={page}><VideoPlayer {...clip} time={8} ended /></div>;

/* Studio's stage: the column's height, as large as the shape allows */
export const Fill: Story = () => <div style={{ ...page, maxWidth: 'none', height: 360, display: 'flex', flexDirection: 'column' }}><VideoPlayer {...clip} time={3} fill /></div>;

export const Square: Story = () => <div style={{ ...page, maxWidth: 360 }}><VideoPlayer {...clip} time={3} ratio={1} /></div>;

export const Playground: Story<VideoPlayerProps> = (args) => <div style={page}><VideoPlayer {...clip} {...args} /></div>;
Playground.args = { time: 3, duration: 8, playing: false, loading: false, ended: false, muted: false };
