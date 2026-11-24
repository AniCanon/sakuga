import type { Story, StoryDefault } from '@ladle/react';
import { useState } from 'react';
import { Button } from '../Button/Button';
import { Stepper, type StepperProps } from './Stepper';

export default { title: 'Sakuga / Navigation / Stepper' } satisfies StoryDefault;

const steps = ['How', 'Approve', 'Portrait'];

export const Steps: Story = () => {
  const [at, setAt] = useState(1);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
      <Stepper steps={steps} current={at} />
      <span style={{ display: 'flex', gap: 8 }}>
        <Button variant="ghost" size="sm" disabled={at === 0} onClick={() => setAt(at - 1)}>Back</Button>
        <Button variant="secondary" size="sm" disabled={at === steps.length - 1} onClick={() => setAt(at + 1)}>Next</Button>
      </span>
    </div>
  );
};

export const First: Story = () => <Stepper steps={steps} current={0} />;

export const Last: Story = () => <Stepper steps={['Basics', 'Look', 'Voice', 'Approve']} current={3} />;

export const Bar: Story = () => <div style={{ width: 320 }}><Stepper variant="bar" steps={['Basics', 'Photos', 'Approve']} current={1} /></div>;

export const BarOverMedia: Story = () => (
  <div style={{ width: 320, padding: 16, background: '#1b1b22' }}><Stepper variant="bar" tone="media" steps={['Basics', 'Photos', 'Approve']} current={1} /></div>
);

export const Playground: Story<StepperProps> = (args) => <Stepper {...args} />;
Playground.args = { steps, current: 1, label: 'Steps', variant: 'steps' };
Playground.argTypes = { variant: { options: ['steps', 'bar'], control: { type: 'radio' } } };
