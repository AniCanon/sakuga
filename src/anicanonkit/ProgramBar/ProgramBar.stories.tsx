import type { Story, StoryDefault } from '@ladle/react';
import { useState } from 'react';
import { ProgramBar, type ProgramBarProps } from './ProgramBar';

export default { title: 'AniCanonKit / Productions / ProgramBar' } satisfies StoryDefault;

const box = { width: 720, padding: '16px 0' } as const;
const sections: ProgramBarProps['sections'] = [
  { label: '#1', start: 0, length: 110 },
  { label: '#2 The roof', start: 110, length: 160, state: 'partial' },
  { label: '#3', start: 270, length: 90 },
  { label: '#4', start: 360, length: 120, state: 'partial' },
  { label: '#5 Red Line', start: 480, length: 180, state: 'missing' },
];
const marks: ProgramBarProps['marks'] = [{ at: 96, label: '1', done: true }, { at: 402, label: '2' }];

export const Cut: Story = () => <div style={box}><ProgramBar duration={400} planned={660} total="6:40 of 11:00" window={{ start: 140, length: 40 }} playhead={161} marks={marks} sections={sections} /></div>;

export const AllCut: Story = () => (
  <div style={box}>
    <ProgramBar duration={660} total="11:00" playhead={30} sections={sections!.map((s) => ({ ...s, state: 'cut' as const }))} />
  </div>
);

export const Playground: Story<ProgramBarProps> = (args) => <div style={box}><ProgramBar {...args} /></div>;
Playground.args = { duration: 400, planned: 660, total: '6:40 of 11:00', playhead: 161, window: { start: 140, length: 40 }, sections, marks };

export const Seekable: Story = () => {
  const [at, setAt] = useState(161);
  return <div style={box}><ProgramBar duration={400} planned={660} total="6:40 of 11:00" playhead={at} marks={marks} sections={sections} onSeek={setAt} /></div>;
};
