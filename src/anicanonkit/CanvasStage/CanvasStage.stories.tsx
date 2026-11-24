import type { Story, StoryDefault } from '@ladle/react';
import { useState } from 'react';
import art from '@design/blobs/70a79c6a67f31e4250d80f3e68d60502.jpg';
import { CanvasStage, type CanvasStageProps } from './CanvasStage';

export default { title: 'AniCanonKit / Productions / CanvasStage' } satisfies StoryDefault;

const wrap = { maxWidth: 520 } as const;

function Movable(props: Omit<CanvasStageProps, 'onBox'>) {
  const [box, setBox] = useState(props.box || { x: 20, y: 15, w: 50, h: 60 });
  return <CanvasStage {...props} box={box} onBox={setBox} />;
}

export const Selected: Story = () => <div style={wrap}><CanvasStage image={art} box={{ x: 20, y: 15, w: 50, h: 60 }} height={200} label="Bruce" /></div>;

export const Movable_: Story = () => <div style={wrap}><Movable image={art} box={{ x: 20, y: 15, w: 50, h: 60 }} height={200} label="Bruce" /></div>;
Movable_.storyName = 'Movable';

export const PastTheFrame: Story = () => <div style={wrap}><Movable image={art} box={{ x: 55, y: -10, w: 60, h: 70 }} height={200} label="Bruce" /></div>;

export const Playground: Story<CanvasStageProps> = (args) => <div style={wrap}><Movable image={art} {...args} /></div>;
Playground.args = { box: { x: 20, y: 15, w: 50, h: 60 }, height: 200, ratio: '16 / 9', label: 'Selected item', alt: '' };

export const Guides: Story = () => (
  <div style={wrap}>
    <CanvasStage image={art} ratio="9 / 16" height={240} guides={[{ x: 5, y: 5, w: 90, h: 90 }]} region={{ x: 15, y: 60, w: 70, h: 25, label: 'Repair' }} />
  </div>
);

/* Fill: the monitor's frame, same size and place, with the selection on it */
export const Fill: Story = () => (
  <div style={{ ...wrap, height: 260, display: 'flex' }}>
    <Movable image={art} fill ratio="16 / 9" box={{ x: 20, y: 15, w: 50, h: 60 }} label="Bruce" />
  </div>
);
