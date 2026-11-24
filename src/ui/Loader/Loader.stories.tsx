import type { Story, StoryDefault } from '@ladle/react';
import { Loader, type LoaderProps } from './Loader';

export default { title: 'Sakuga / Feedback / Loader' } satisfies StoryDefault;

const row = { display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap' } as const;

export const Sizes: Story = () => (
  <div style={row}>
    <Loader size={16} />
    <Loader size={24} />
    <Loader size={48} label="Drawing the portrait" />
    <Loader size={72} label="Drawing the portrait" />
  </div>
);

export const WithWords: Story = () => (
  <span style={{ display: 'flex', alignItems: 'center', gap: 10, font: 'var(--text-body)', color: 'var(--text-muted)' }}>
    <Loader size={16} label="Loading the pages" />Loading the pages
  </span>
);

export const OverArt: Story = () => (
  <div style={{ ...row, padding: 24, borderRadius: 12, background: '#2a2140', color: 'var(--text-on-media)' }}>
    <Loader size={48} label="Drawing the frame" />
  </div>
);

export const Playground: Story<LoaderProps> = (args) => <Loader {...args} />;
Playground.args = { size: 48, label: 'Loading' };
