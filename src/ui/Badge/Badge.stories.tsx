import type { Story, StoryDefault } from '@ladle/react';
import { Badge, type BadgeProps } from './Badge';

export default { title: 'Sakuga / Content / Badge' } satisfies StoryDefault;

const row = { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' } as const;
const art = { ...row, padding: '16px 12px', borderRadius: 12, background: '#2a2140', maxWidth: 520 } as const;

export const OnArtwork: Story = () => (
  <div style={art}>
    <Badge>11:36</Badge>
    <Badge>1.2M views</Badge>
  </div>
);

export const New: Story = () => <div style={art}><Badge variant="new">New</Badge></div>;

export const Alert: Story = () => (
  <div style={art}>
    <Badge variant="alert" icon="trait-fierce">Burning</Badge>
    <Badge icon="mood-chaotic">Ransacked</Badge>
  </div>
);

export const OnSurface: Story = () => (
  <div style={row}>
    <Badge variant="neutral" dot>Rendering</Badge>
    <Badge variant="neutral">Setup not finished</Badge>
    <Badge variant="attention" dot>To review</Badge>
    <Badge variant="outline">Ep 1</Badge>
    <Badge variant="outline">Short</Badge>
  </div>
);

export const Warning: Story = () => (
  <div style={row}>
    <Badge variant="warning" icon="warning">“Cell four” happens after it</Badge>
    <Badge variant="neutral" icon="lock">Held</Badge>
  </div>
);

export const Playground: Story<BadgeProps> = (args) => <Badge {...args} />;
Playground.args = { children: 'Rendering', dot: false };
Playground.argTypes = {
  variant: { options: ['default', 'new', 'alert', 'neutral', 'attention', 'outline', 'warning'], control: { type: 'select' }, defaultValue: 'neutral' },
};
