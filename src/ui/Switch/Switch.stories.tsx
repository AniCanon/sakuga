import type { Story, StoryDefault } from '@ladle/react';
import { useState } from 'react';
import { Switch, type SwitchProps } from './Switch';

export default { title: 'Sakuga / Actions / Switch' } satisfies StoryDefault;

function Live(props: Omit<SwitchProps, 'on' | 'onChange'> & { start?: boolean }) {
  const [on, set] = useState(!!props.start);
  return <Switch {...props} on={on} onChange={set} />;
}

const row = { display: 'flex', gap: 16, alignItems: 'center' } as const;

export const States: Story = () => (
  <div style={row}>
    <Live label="Name who speaks" start />
    <Live label="Loop this track" />
    <Switch label="Locked on" on disabled />
    <Switch label="Locked off" disabled />
  </div>
);

export const WithLabel: Story = () => (
  <div style={{ maxWidth: 360 }}><Live label="Loops without a seam" showLabel start /></div>
);

export const WithHint: Story = () => (
  <div style={{ maxWidth: 360 }}>
    <Live label="Lower the music under voices" showLabel hint="The music dips while someone speaks." start />
    <Live label="Subtitles" showLabel hint="Shown in the reader’s language."><span style={{ color: 'var(--text-secondary)' }}>English</span></Live>
  </div>
);

export const Playground: Story<SwitchProps> = (args) => <div style={{ maxWidth: 360 }}><Switch {...args} /></div>;
Playground.args = { label: 'Loop this track', on: true, showLabel: false, hint: '', disabled: false };
