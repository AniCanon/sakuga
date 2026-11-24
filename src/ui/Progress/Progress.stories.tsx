import type { Story, StoryDefault } from '@ladle/react';
import { Text } from '../Text/Text';
import { Progress, type ProgressProps } from './Progress';

export default { title: 'Sakuga / Feedback / Progress' } satisfies StoryDefault;

const column = { display: 'flex', flexDirection: 'column', gap: 10, width: 320 } as const;

export const UnderItsWords: Story = () => (
  <div style={column}>
    <Text variant="label">Rendering your take</Text>
    <Progress value={40} label="Rendering your take" />
    <Text variant="caption" tone="muted">12 fragments held · charged only if it is delivered</Text>
  </div>
);

export const Values: Story = () => (
  <div style={column}>
    <Progress value={0} label="Queued" />
    <Progress value={25} label="Drawing" />
    <Progress value={75} label="Inking" />
    <Progress value={100} label="Done" />
  </div>
);

export const OverArt: Story = () => (
  <div data-theme="dark" style={{ ...column, justifyContent: 'flex-end', height: 150, padding: 16, borderRadius: 12, boxSizing: 'border-box', background: '#2a2140' }}>
    <Text variant="label" tone="on-media">Animating your clip</Text>
    <Progress value={65} tone="media" label="Animating your clip" />
  </div>
);

export const Playground: Story<ProgressProps> = (args) => <div style={column}><Progress {...args} /></div>;
Playground.args = { value: 40, label: 'Rendering your take' };
Playground.argTypes = { tone: { options: [undefined, 'media'], control: { type: 'radio' } } };
