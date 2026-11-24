import type { Story, StoryDefault } from '@ladle/react';
import { useState } from 'react';
import { SliderRow, type SliderRowProps } from './SliderRow';

export default { title: 'Sakuga / Forms / SliderRow' } satisfies StoryDefault;

const exposure = (v: number) => { const x = (v - 50) / 25; return (x < 0 ? '−' : '+') + Math.abs(x).toFixed(1); };
const volume = (v: number) => { const d = Math.round((v - 100) / 10); return v === 0 ? 'Off' : (d < 0 ? '−' : '') + Math.abs(d) + ' dB'; };
const col = { display: 'grid', gap: 12, width: 280 } as const;

function Live({ label, start, read }: { label: string; start: number; read: (v: number) => string }) {
  const [v, set] = useState(start);
  return <SliderRow label={label} value={v} onChange={set} readout={read(v)} />;
}

export const Interactive: Story = () => (
  <div style={col}><Live label="Exposure" start={55} read={exposure} /><Live label="Volume" start={70} read={volume} /></div>
);

export const ReadOnly: Story = () => <div style={col}><SliderRow label="Opacity" value={80} readout="80%" /></div>;

export const Disabled: Story = () => <div style={col}><SliderRow label="Glow" value={0} readout="Off" disabled /></div>;

export const Playground: Story<SliderRowProps> = (args) => <div style={col}><SliderRow {...args} /></div>;
Playground.args = { label: 'Opacity', value: 80, readout: '80%', disabled: false };
