import type { Story, StoryDefault } from '@ladle/react';
import { useState } from 'react';
import { SegmentedControl, type SegmentedControlProps } from './SegmentedControl';

export default { title: 'Sakuga / Actions / SegmentedControl' } satisfies StoryDefault;

const sections = [{ label: 'Episodes' }, { label: 'Shorts' }, { label: 'Cast' }, { label: 'World' }];

function Live(props: Omit<SegmentedControlProps, 'value' | 'onChange'> & { start: string }) {
  const [v, set] = useState(props.start);
  return <SegmentedControl {...props} value={v} onChange={set} />;
}

export const Fill: Story = () => <Live label="Feed" start="For you" options={[{ label: 'Following' }, { label: 'For you' }]} />;

export const FullWidth: Story = () => (
  <div style={{ maxWidth: 360 }}><Live label="Series sections" fullWidth start="Episodes" options={sections} /></div>
);

export const Values: Story = () => (
  <Live label="Reading direction" start="rtl" options={[{ label: 'Right to left', value: 'rtl' }, { label: 'Left to right', value: 'ltr' }]} />
);

export const Playground: Story<SegmentedControlProps> = (args) => <SegmentedControl {...args} />;
Playground.args = { label: 'Series sections', value: 'Shorts', options: sections, fullWidth: false };
