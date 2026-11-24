import type { Story, StoryDefault } from '@ladle/react';
import { IconButton } from '../IconButton/IconButton';
import { Text } from '../Text/Text';
import { SidePanel, type SidePanelProps } from './SidePanel';

export default { title: 'Sakuga / Containers / SidePanel' } satisfies StoryDefault;

const box = { width: 360, height: 480, display: 'flex' };
/* The head a page passes: here a title and close, as a PanelHeader would draw them on Story */
const head = <><Text variant="title-4" as="h2">Fire at Sé</Text><IconButton variant="plain" icon="close" label="Close" /></>;
const body = Array.from({ length: 14 }, (_, i) => <Text key={i} as="p">Line {i + 1} of what the panel holds, on the same 16 px edge as the head and the foot.</Text>);

export const Panel: Story = () => <div style={box}><SidePanel label="Event" role="region" bodyLabel="Fire at Sé" head={head}>{body}</SidePanel></div>;

export const Foot: Story = () => <div style={box}><SidePanel label="Event" role="region" bodyLabel="Fire at Sé" head={head} foot={<Text variant="small" tone="muted">The foot stays put.</Text>}>{body}</SidePanel></div>;

/* A conversation keeps to its newest line; scrolled back, a jump to it takes its own row above the foot */
export const Conversation: Story = () => <div style={box}><SidePanel label="Chat" follow role="log" bodyLabel="Conversation" foot={<Text variant="small" tone="muted">Composer</Text>}>{body}</SidePanel></div>;

export const Playground: Story<SidePanelProps> = (args) => <div style={box}><SidePanel {...args}>{body}</SidePanel></div>;
Playground.args = { label: 'Event', follow: false, role: 'region', bodyLabel: 'Details' };
