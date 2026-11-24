import type { Story, StoryDefault } from '@ladle/react';
import { Button } from '../Button/Button';
import { FlowFooter, type FlowFooterProps } from './FlowFooter';

export default { title: 'Sakuga / Navigation / FlowFooter' } satisfies StoryDefault;

const box = { maxWidth: 640 } as const;

export const WithBack: Story = () => <div style={box}><FlowFooter note="Free. The front and back covers are made with it." back={{ label: 'Back' }}><Button>Create issue</Button></FlowFooter></div>;

export const FirstStep: Story = () => <div style={box}><FlowFooter note="Free. Nothing is generated until you start it."><Button>Continue</Button></FlowFooter></div>;

export const Start: Story = () => (
  <div style={box}>
    <FlowFooter note="You can come back to it from Characters.">
      <span slot="start"><Button variant="ghost">Skip for now</Button></span>
      <Button>Continue</Button>
    </FlowFooter>
  </div>
);

export const Playground: Story<FlowFooterProps> = (args) => <div style={box}><FlowFooter {...args}><Button>Create issue</Button></FlowFooter></div>;
Playground.args = { note: 'Free. The front and back covers are made with it.', back: { label: 'Back' } };
