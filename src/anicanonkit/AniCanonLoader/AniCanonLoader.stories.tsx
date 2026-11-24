import type { Story, StoryDefault } from '@ladle/react';
import { AniCanonLoader, type AniCanonLoaderProps } from './AniCanonLoader';

export default { title: 'AniCanonKit / Feedback / AniCanonLoader' } satisfies StoryDefault;

const row = { display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap' } as const;

export const Sizes: Story = () => (
  <div style={row}>
    <AniCanonLoader size={14} />
    <AniCanonLoader size={16} />
    <AniCanonLoader size={24} />
    <AniCanonLoader size={40} label="Drawing the portrait" />
  </div>
);

export const WithWords: Story = () => (
  <span style={{ display: 'flex', alignItems: 'center', gap: 10, font: 'var(--text-body)', color: 'var(--text-muted)' }}>
    <AniCanonLoader size={16} label="Drawing the portrait" />Drawing the portrait
  </span>
);

export const OverArt: Story = () => (
  <div style={{ ...row, padding: 24, borderRadius: 12, background: '#2a2140', color: 'var(--text-on-media)' }}>
    <AniCanonLoader size={40} label="Drawing the look" />
  </div>
);

export const Playground: Story<AniCanonLoaderProps> = (args) => <AniCanonLoader {...args} />;
Playground.args = { size: 40, label: 'Loading' };
