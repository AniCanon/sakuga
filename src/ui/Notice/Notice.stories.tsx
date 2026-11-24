import type { Story, StoryDefault } from '@ladle/react';
import { Button } from '../Button/Button';
import { Loader } from '../Loader/Loader';
import { Notice, type NoticeProps } from './Notice';

export default { title: 'Sakuga / Feedback / Notice' } satisfies StoryDefault;

const column = { display: 'grid', gap: 12, maxWidth: 640 } as const;

export const Info: Story = () => <div style={column}><Notice title="Build changed." text="New looks use it." /></div>;

export const Attention: Story = () => (
  <div style={column}>
    <Notice tone="attention" title="Two scenes need a Festival look." text="Nothing fits yet.">
      <Button size="sm" icon="plus">Add a look</Button>
    </Notice>
  </div>
);

export const WithIcon: Story = () => <div style={column}><Notice icon="comment" title="Maki left a note." text="Scene 5 contradicts the story." /></div>;

export const WithMedia: Story = () => <div style={column}><Notice media={<Loader size={20} label="Rendering" />} title="Rendering your take." text="It lands in about a minute." /></div>;

export const Playground: Story<NoticeProps> = (args) => <div style={column}><Notice {...args} /></div>;
Playground.args = { title: 'Build changed.', text: 'New looks use it.' };
Playground.argTypes = { tone: { options: ['info', 'attention'], control: { type: 'radio' }, defaultValue: 'info' } };
