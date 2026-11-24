import type { Story, StoryDefault } from '@ladle/react';
import { useState } from 'react';
import { NumberField, type NumberFieldProps } from './NumberField';

export default { title: 'Sakuga / Forms / NumberField' } satisfies StoryDefault;

const col = { width: 260, display: 'flex', flexDirection: 'column', gap: 10 } as const;

function Live(props: Omit<NumberFieldProps, 'value' | 'onStep'> & { start: number }) {
  const [v, set] = useState(props.start);
  return <NumberField {...props} value={v} onStep={(d) => set(v + d)} />;
}

export const Units: Story = () => (
  <div style={col}>
    <Live label="Border" start={1} unit="px" />
    <Live label="Rotate" start={-6} unit="°" />
    <Live label="Hold" start={3} unit="days" />
  </div>
);

export const LongValue: Story = () => <div style={col}><NumberField label="Price" value="24.99" unit="USD" /></div>;

export const LongLabel: Story = () => <div style={col}><Live label="Space between the panels" start={12} unit="px" /></div>;

export const ReadOnly: Story = () => <div style={col}><NumberField label="Frames" value={24} unit="fps" readOnly /></div>;

export const Playground: Story<NumberFieldProps> = (args) => <div style={col}><NumberField {...args} /></div>;
Playground.args = { label: 'Border', value: 1, unit: 'px', readOnly: false };
