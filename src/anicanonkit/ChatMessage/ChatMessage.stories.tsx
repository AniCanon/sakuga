import type { Story, StoryDefault } from '@ladle/react';
import { ChatMessage, type ChatMessageProps } from './ChatMessage';

export default { title: 'AniCanonKit / Maki / ChatMessage' } satisfies StoryDefault;

const col = { width: 340, display: 'flex', flexDirection: 'column' as const };

export const Message: Story = () => <div style={col}><ChatMessage>Fix the last train</ChatMessage></div>;

export const Long: Story = () => <div style={col}><ChatMessage>Why does it matter that Lisa is at Sé in section 3 and at home in section 4? Nobody sees her travel.</ChatMessage></div>;

export const Playground: Story<ChatMessageProps> = (args) => <div style={col}><ChatMessage {...args} /></div>;
Playground.args = { name: 'You', children: 'Fix the last train' };
