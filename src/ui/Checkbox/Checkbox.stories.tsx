import type { Story, StoryDefault } from '@ladle/react';
import { useState } from 'react';
import { Checkbox, type CheckboxProps } from './Checkbox';

export default { title: 'Sakuga / Forms / Checkbox' } satisfies StoryDefault;

const col = { display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 320 } as const;
const row = { display: 'flex', gap: 16, alignItems: 'center' } as const;

export const States: Story = () => (
  <div style={row}>
    <Checkbox label="Off" />
    <Checkbox label="On" checked />
    <Checkbox label="Mixed" mixed />
    <Checkbox label="Off, disabled" disabled />
    <Checkbox label="On, disabled" checked disabled />
  </div>
);

export const WithLabel: Story = () => (
  <div style={col}>
    <Checkbox label="I agree to the terms" showLabel checked />
    <Checkbox label="Keep the originals" hint="Locked while the files are queued" showLabel checked disabled />
  </div>
);

export const SelectAll: Story = () => {
  const [v, set] = useState({ a: true, b: false, c: true });
  const n = (v.a ? 1 : 0) + (v.b ? 1 : 0) + (v.c ? 1 : 0);
  const one = (k: 'a' | 'b' | 'c') => (x: boolean) => set({ ...v, [k]: x });
  return (
    <div style={col}>
      <Checkbox label="All files" showLabel checked={n === 3} mixed={n > 0 && n < 3} onChange={(x) => set({ a: x, b: x, c: x })} />
      <div style={{ ...col, gap: 10, paddingLeft: 32 }}>
        <Checkbox label="rain-on-glass.wav" showLabel checked={v.a} onChange={one('a')} />
        <Checkbox label="toast-take-2.mp4" showLabel checked={v.b} onChange={one('b')} />
        <Checkbox label="cold-open-boards.pdf" showLabel checked={v.c} onChange={one('c')} />
      </div>
    </div>
  );
};

export const Playground: Story<CheckboxProps> = (args) => <Checkbox {...args} />;
Playground.args = { label: 'Queue this file', showLabel: true, hint: 'It goes after the two before it.', checked: true, mixed: false, disabled: false };
