import type { Story, StoryDefault } from '@ladle/react';
import { Icon } from './Icon';
import { iconNames } from './names';

export default { title: 'Sakuga / Foundations / Icon' } satisfies StoryDefault;

const all = [...new Set(iconNames)];

export const Every: Story = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
    {all.map((n) => (
      <figure key={n} style={{ margin: 0, padding: 12, display: 'grid', justifyItems: 'center', gap: 8, font: 'var(--text-caption)', color: 'var(--text-secondary)' }}>
        <Icon name={n} size={24} />
        <figcaption style={{ textAlign: 'center', wordBreak: 'break-word' }}>{n}</figcaption>
      </figure>
    ))}
  </div>
);

export const Sizes: Story = () => (
  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
    {[14, 16, 20, 24].map((s) => <Icon key={s} name="play" size={s} />)}
  </div>
);

export const Named: Story = () => <Icon name="search" title="Search" />;
