import type { Story, StoryDefault } from '@ladle/react';
import { useState } from 'react';
import { PanelRow, type PanelRowProps } from './PanelRow';

export default { title: 'Sakuga / Actions / PanelRow' } satisfies StoryDefault;

const col = { display: 'grid', gap: 8, width: 300 } as const;

export const Sections: Story = () => {
  const [open, set] = useState(1);
  const row = (i: number, icon: PanelRowProps['icon'], title: string, value: string) => <PanelRow icon={icon} title={title} value={value} open={open === i} onClick={() => set(open === i ? -1 : i)} />;
  return <div style={col}>{row(0, 'camera', 'Camera', 'Close-up · push in · low')}{row(1, 'film', 'Into 2D', 'Cut')}</div>;
};

export const LongValue: Story = () => <div style={col}><PanelRow icon="lighting-golden" title="Light" value="Golden hour · rim from the left · warm haze" /></div>;

export const NoValue: Story = () => <div style={col}><PanelRow icon="effect-sparks" title="Effects" /></div>;

export const Playground: Story<PanelRowProps> = (args) => <div style={col}><PanelRow {...args} /></div>;
Playground.args = { icon: 'camera', title: 'Camera', value: 'Close-up · push in · low', open: false };
