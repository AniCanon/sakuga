import type { Story, StoryDefault } from '@ladle/react';
import { useState } from 'react';
import { Chip } from '../Chip/Chip';
import { SegmentedControl } from '../SegmentedControl/SegmentedControl';
import { Field, type FieldProps } from './Field';

export default { title: 'Sakuga / Forms / Field' } satisfies StoryDefault;

function Mode() {
  const [v, set] = useState('Free');
  return <SegmentedControl label="Story Map mode" value={v} onChange={set} options={[{ label: 'Story Map' }, { label: 'Free' }]} />;
}

export const WithHint: Story = () => (
  <div style={{ width: 320 }}>
    <Field label="Story Map" hint="Free: the script isn’t checked against the story. You can switch later."><Mode /></Field>
  </div>
);

export const Optional: Story = () => (
  <div style={{ width: 320 }}>
    <Field label="Traits" optional>
      <Chip.Group label="Traits"><Chip selected>Calm</Chip><Chip>Witty</Chip><Chip>Stern</Chip></Chip.Group>
    </Field>
  </div>
);

export const Playground: Story<Omit<FieldProps, 'children'>> = (args) => <div style={{ width: 320 }}><Field {...args}><Mode /></Field></div>;
Playground.args = { label: 'Story Map', hint: 'You can switch later.', optional: false };
