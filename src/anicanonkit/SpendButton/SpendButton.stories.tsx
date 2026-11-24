import type { Story, StoryDefault } from '@ladle/react';
import { SpendButton } from './SpendButton';

export default { title: 'AniCanonKit / Fragments / SpendButton' } satisfies StoryDefault;

const row = { display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' } as const;

export const Sizes: Story = () => (
  <div style={row}>
    <SpendButton size="lg" cost="~240">Generate episode</SpendButton>
    <SpendButton cost="~100">Generate</SpendButton>
    <SpendButton size="sm" variant="secondary" cost="~10">Retake</SpendButton>
  </div>
);

export const Variants: Story = () => (
  <div style={row}>
    <SpendButton cost="~100">Start</SpendButton>
    <SpendButton variant="secondary" cost="~100">Start</SpendButton>
    <SpendButton variant="outline" cost="~100">Start</SpendButton>
  </div>
);

export const Disabled: Story = () => <SpendButton cost="~100" disabled>Generate</SpendButton>;
