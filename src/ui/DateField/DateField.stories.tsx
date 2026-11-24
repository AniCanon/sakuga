import type { Story, StoryDefault } from '@ladle/react';
import { DateField, type DateFieldProps } from './DateField';

export default { title: 'Sakuga / Forms / DateField' } satisfies StoryDefault;

/* A board shows a fixed state: today, the month and the locale are set, so the calendar is the same every day */
const fixed = { today: '2026-10-23', locale: 'en-US' } as const;
const presets = [
  { label: 'This month', start: '2026-10-01', end: '2026-10-23' }, { label: 'Last month', start: '2026-09-01', end: '2026-09-30' },
  { label: 'Last 30 days', start: '2026-09-24', end: '2026-10-23' }, { label: 'Last 90 days', start: '2026-07-26', end: '2026-10-23' }, { label: 'This year', start: '2026-01-01', end: '2026-10-23' },
];
/* The calendar drops under the field, so an open story leaves it room */
const room = (h: number) => ({ width: 260, minHeight: h });

export const Closed: Story = () => <div style={room(0)}><DateField {...fixed} label="Airs" value="2026-10-05" hint="The episode goes out at 18:00." /></div>;

export const Empty: Story = () => <div style={room(0)}><DateField {...fixed} label="Ends" placeholder="No end date" optional /></div>;

export const OpenDate: Story = () => <div style={room(420)}><DateField {...fixed} label="Airs" value="2026-10-05" open /></div>;

export const OpenRange: Story = () => (
  <div style={room(420)}><DateField {...fixed} label="Dates" range open max="2026-10-23" month="2026-09-01" value={{ start: '2026-10-01', end: '2026-10-23' }} presets={presets} /></div>
);

export const AlignEnd: Story = () => (
  <div style={{ width: 640, minHeight: 420, display: 'flex', justifyContent: 'flex-end' }}>
    <div style={{ width: 260 }}><DateField {...fixed} label="Airs" value="2026-10-05" open align="end" /></div>
  </div>
);

export const Disabled: Story = () => <div style={room(0)}><DateField {...fixed} label="Airs" value="2026-10-05" disabled /></div>;

export const Playground: Story<DateFieldProps> = (args) => <div style={room(420)}><DateField key={String(args.range) + String(args.open)} {...fixed} {...args} presets={args.range ? presets : undefined} /></div>;
Playground.args = { label: 'Dates', range: false, open: false, placeholder: 'Pick a date', hint: '', disabled: false, min: '', max: '' };
