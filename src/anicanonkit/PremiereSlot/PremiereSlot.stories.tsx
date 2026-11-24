import type { Story, StoryDefault } from '@ladle/react';
import still from '@design/blobs/28395b51c4b11a6da6b67d8ff9d1b3e2.jpg';
import { PremiereSlot, type PremiereSlotProps } from './PremiereSlot';

export default { title: 'AniCanonKit / AniCanon / PremiereSlot' } satisfies StoryDefault;

const col = { display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 640 } as const;

export const Default: Story = () => <div style={col}><PremiereSlot when="Premieres Friday · 21:00" title="Episode 2" subtitle="Title revealed at premiere" /></div>;

export const Compact: Story = () => <div style={col}><PremiereSlot compact when="Fri · 21:00" title="EBA · Episode 2" /></div>;

export const Artwork: Story = () => (
  <div style={col}>
    <PremiereSlot image={still} when="Premieres Friday · 21:00" title="Episode 2" subtitle="The river crossing" />
    <PremiereSlot image={still} compact when="Fri · 21:00" title="EBA · Episode 2" />
  </div>
);

export const NoReminder: Story = () => <div style={col}><PremiereSlot when="Premieres Friday · 21:00" title="Issue 3" onRemind={null} /></div>;

export const Playground: Story<PremiereSlotProps> = (args) => <div style={col}><PremiereSlot {...args} /></div>;
Playground.args = { when: 'Premieres Friday · 21:00', title: 'Episode 2', subtitle: 'Title revealed at premiere', compact: false };
