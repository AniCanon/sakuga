import type { Story, StoryDefault } from '@ladle/react';
import { Caption, type CaptionProps } from './Caption';

export default { title: 'Sakuga / Media / Caption' } satisfies StoryDefault;

const frame = { display: 'flex', alignItems: 'flex-end', justifyContent: 'center', height: 110, padding: '0 12px 14px', borderRadius: 12, background: '#2a2140', maxWidth: 640 } as const;

export const Large: Story = () => <div style={frame}><Caption>To the people who did what I couldn’t do alone.</Caption></div>;

export const Medium: Story = () => <div style={{ ...frame, maxWidth: 360 }}><Caption size="md">To the people who did what I couldn’t do alone.</Caption></div>;

export const TwoLines: Story = () => (
  <div style={{ ...frame, maxWidth: 360 }}>
    <Caption size="md">I kept the ticket. The line closed in 1987, and still the train came for me.</Caption>
  </div>
);

export const Playground: Story<CaptionProps> = (args) => <div style={frame}><Caption {...args} /></div>;
Playground.args = { children: 'To the people who did what I couldn’t do alone.' };
Playground.argTypes = { size: { options: ['lg', 'md'], control: { type: 'radio' }, defaultValue: 'lg' } };
