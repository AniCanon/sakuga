import type { Story, StoryDefault } from '@ladle/react';
import { StateChange, type StateChangeProps } from './StateChange';

export default { title: 'AniCanonKit / Story / StateChange' } satisfies StoryDefault;

export const Change: Story = () => <StateChange before="Calm" after="Wary" afterVariant="new" />;

export const ForTheWorse: Story = () => <StateChange before="Friends" after="Rivals" afterVariant="alert" afterIcon="bolt" beforeIcon="heart" />;

export const NoBefore: Story = () => <StateChange after="Burning" afterVariant="alert" afterIcon="trait-fierce" />;

export const Playground: Story<StateChangeProps> = (args) => <StateChange {...args} />;
Playground.args = { before: 'Friends', after: 'Rivals', afterVariant: 'alert' };
Playground.argTypes = { afterVariant: { options: ['new', 'alert'], control: { type: 'radio' } } };
