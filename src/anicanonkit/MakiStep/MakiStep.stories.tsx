import type { Story, StoryDefault } from '@ladle/react';
import { MakiStep, type MakiStepProps } from './MakiStep';

export default { title: 'AniCanonKit / Maki / MakiStep' } satisfies StoryDefault;

const col = { width: 340 };

export const Running: Story = () => <div style={col}><MakiStep label="Reading the story" detail="26 events" /></div>;

export const Done: Story = () => <div style={col}><MakiStep done label="Read the story" detail="26 events" /></div>;

export const Opens: Story = () => <div style={col}><MakiStep done open label="Read the story" detail="26 events"><p>From “Mio meets Sen” to “Mio swears to find Kaito”.</p></MakiStep></div>;

export const Playground: Story<MakiStepProps> = (args) => <div style={col}><MakiStep {...args} /></div>;
Playground.args = { label: 'Read the story', detail: '26 events', done: true };
