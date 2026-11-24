import type { Story, StoryDefault } from '@ladle/react';
import { Slip, type SlipProps } from './Slip';

export default { title: 'AniCanonKit / Productions / Slip' } satisfies StoryDefault;

const box = { width: 240 } as const;

export const Note: Story = () => (
  <div style={box}>
    <Slip label="Check">Nobody on screen for 6 seconds.<span slot="action"><a href="#">Ask Maki</a></span></Slip>
  </div>
);

export const Done: Story = () => <div style={box}><Slip label="Why this cut" done>Push in on the line that turns the scene.</Slip></div>;

export const Playground: Story<SlipProps> = (args) => <div style={box}><Slip {...args}>Nobody on screen for 6 seconds.</Slip></div>;
Playground.args = { label: 'Check', done: false };
