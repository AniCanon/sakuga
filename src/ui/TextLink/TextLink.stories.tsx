import type { Story, StoryDefault } from '@ladle/react';
import { TextLink, type TextLinkProps } from './TextLink';

export default { title: 'Sakuga / Actions / TextLink' } satisfies StoryDefault;

const row = { display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' } as const;

export const Variants: Story = () => (
  <div style={row}>
    <TextLink variant="strong">Accept</TextLink>
    <TextLink>Decline</TextLink>
    <TextLink>Why</TextLink>
  </div>
);

export const Link: Story = () => <TextLink href="#maki" icon="comment">Ask Maki</TextLink>;

export const Destructive: Story = () => <TextLink variant="destructive">Delete my account</TextLink>;

export const Playground: Story<TextLinkProps> = (args) => <TextLink {...args} />;
Playground.args = { children: 'Use it' };
Playground.argTypes = {
  variant: { options: ['quiet', 'strong', 'destructive'], control: { type: 'radio' }, defaultValue: 'quiet' },
};
