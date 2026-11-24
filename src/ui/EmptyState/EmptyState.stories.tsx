import type { Story, StoryDefault } from '@ladle/react';
import { Button } from '../Button/Button';
import { Loader } from '../Loader/Loader';
import { EmptyState, type EmptyStateProps } from './EmptyState';

export default { title: 'Sakuga / Feedback / EmptyState' } satisfies StoryDefault;

const box = { maxWidth: 520, padding: 32 } as const;

export const Nothing: Story = () => (
  <div style={box}><EmptyState icon="collection" title="No shorts yet" text="Shorts you make from an episode land here." /></div>
);

export const Making: Story = () => (
  <div style={box}>
    <EmptyState title="Warming up the booth" text="Recording a few takes of the same line. Usually under a minute.">
      <span slot="media"><Loader size={32} label="Recording" /></span>
    </EmptyState>
  </div>
);

export const Failed: Story = () => (
  <div style={box}>
    <EmptyState tone="attention" icon="warning" title="Ponytail didn’t finish" text="Your name and wording are kept. Adjust them or try again as is.">
      <Button variant="ghost" size="sm">Show details</Button>
    </EmptyState>
  </div>
);

export const Playground: Story<EmptyStateProps> = (args) => <div style={box}><EmptyState {...args} /></div>;
Playground.args = { icon: 'collection', title: 'No shorts yet', text: 'Shorts you make from an episode land here.' };
Playground.argTypes = { tone: { options: [undefined, 'attention'], control: { type: 'radio' } } };
