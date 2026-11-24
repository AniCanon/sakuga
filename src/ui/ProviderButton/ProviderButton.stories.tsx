import type { Story, StoryDefault } from '@ladle/react';
import { ProviderButton } from './ProviderButton';

export default { title: 'Sakuga / Actions / ProviderButton' } satisfies StoryDefault;

const col = { display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 360 } as const;

export const SignIn: Story = () => (
  <div style={col}>
    <ProviderButton provider="apple" fullWidth />
    <ProviderButton provider="google" fullWidth />
  </div>
);

export const Phone: Story = () => (
  <div style={col}>
    <ProviderButton provider="apple" shape="pill" fullWidth />
    <ProviderButton provider="google" shape="pill" fullWidth />
  </div>
);

export const InSettings: Story = () => (
  <div style={{ display: 'flex', gap: 12 }}>
    <ProviderButton provider="apple" size="md">Connect Apple</ProviderButton>
    <ProviderButton provider="google" size="md" disabled>Connect Google</ProviderButton>
  </div>
);
