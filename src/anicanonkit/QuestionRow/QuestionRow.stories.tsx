import type { Story, StoryDefault } from '@ladle/react';
import station from '@design/blobs/28395b51c4b11a6da6b67d8ff9d1b3e2.jpg';
import platform from '@design/blobs/70a79c6a67f31e4250d80f3e68d60502.jpg';
import { QuestionRow, type QuestionRowProps } from './QuestionRow';

export default { title: 'AniCanonKit / Story / QuestionRow' } satisfies StoryDefault;

const col = { width: 820 };
const planted = { label: 'Arthur taken', image: station, told: 'Episode 1' };

export const Waiting: Story = () => <div style={col}><QuestionRow question="Where is Arthur?" note="Raised in Cell four" planted={planted} raised={[{ label: 'Cell four', image: platform, told: 'Episode 2' }]} /></div>;

export const NotRaised: Story = () => <div style={col}><QuestionRow question="Who lit the fire?" planted={planted} /></div>;

export const Quiet: Story = () => <div style={col}><QuestionRow question="Who lit the fire?" state="quiet" note="Untouched for 6 episodes" planted={planted} /></div>;

export const Answered: Story = () => <div style={col}><QuestionRow question="Where is Arthur?" state="answered" note="Answered in Episode 4" planted={planted} raised={[{ label: 'Cell four', image: platform, told: 'Episode 2' }]} answered={{ label: 'Arthur found', told: 'Episode 4' }} /></div>;

export const Selected: Story = () => <div style={col}><QuestionRow question="Where is Arthur?" note="Raised in Cell four" selected planted={{ label: 'Arthur taken' }} raised={[{ label: 'Cell four' }]} /></div>;

export const Playground: Story<QuestionRowProps> = (args) => <div style={col}><QuestionRow {...args} /></div>;
Playground.args = { question: 'Where is Arthur?', note: 'Raised in Cell four', selected: false, state: 'waiting', planted: { label: 'Arthur taken' }, raised: [{ label: 'Cell four' }] };
Playground.argTypes = { state: { options: ['waiting', 'quiet', 'answered'], control: { type: 'radio' } } };
