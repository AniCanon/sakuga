import type { Story, StoryDefault } from '@ladle/react';
import art from '@design/blobs/70a79c6a67f31e4250d80f3e68d60502.jpg';
import { TrimFrames, type TrimFramesProps } from './TrimFrames';

export default { title: 'AniCanonKit / Productions / TrimFrames' } satisfies StoryDefault;

const box = { width: 268 } as const;
const inFrame = { image: art, timecode: '0+00' };
const outFrame = { image: art, imageStyle: 'object-position:62% 34%', timecode: '6+12' };

export const Trimming: Story = () => <div style={box}><TrimFrames in={inFrame} out={outFrame} active="out" onNudge={() => {}} /></div>;

export const Links: Story = () => <div style={box}><TrimFrames in={{ ...inFrame, href: '#in' }} out={{ ...outFrame, href: '#out' }} active="in" /></div>;

export const Vertical: Story = () => <div style={{ width: 160 }}><TrimFrames in={inFrame} out={outFrame} frameWidth={60} frameHeight={107} onNudge={() => {}} /></div>;

export const Playground: Story<TrimFramesProps> = (args) => <div style={box}><TrimFrames {...args} /></div>;
Playground.args = { in: inFrame, out: outFrame, label: 'Trim', frameWidth: 128, frameHeight: 72 };
Playground.argTypes = { active: { options: [undefined, 'in', 'out'], control: { type: 'radio' } } };
