import type { Story, StoryDefault } from '@ladle/react';
import { Shorthand, type ShorthandProps } from './Shorthand';

export default { title: 'AniCanonKit / Productions / Shorthand' } satisfies StoryDefault;

export const Notation: Story = () => <Shorthand spoken="close-up, low angle, track up from 0 to 5 seconds">C.U · low · T.U 0+00 → 5+00</Shorthand>;

export const Accent: Story = () => <Shorthand tone="accent">To review</Shorthand>;

export const Secondary: Story = () => <Shorthand tone="secondary">Approved · 3 takes</Shorthand>;

export const Playground: Story<ShorthandProps> = (args) => <Shorthand {...args} />;
Playground.args = { children: 'C.U · low · T.U 0+00 → 5+00', spoken: '' };
Playground.argTypes = { tone: { options: [undefined, 'accent', 'secondary'], control: { type: 'radio' } } };
