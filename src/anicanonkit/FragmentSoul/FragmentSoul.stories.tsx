import type { Story, StoryDefault } from '@ladle/react';
import { FragmentSoul } from './FragmentSoul';

export default { title: 'AniCanonKit / Fragments / FragmentSoul' } satisfies StoryDefault;

export const Sizes: Story = () => (
  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
    {[14, 16, 24, 48].map((s) => <FragmentSoul key={s} size={s} />)}
  </div>
);

export const Dim: Story = () => (
  <div style={{ display: 'flex', gap: 16 }}>
    <FragmentSoul size={48} />
    <FragmentSoul size={48} dim />
  </div>
);
