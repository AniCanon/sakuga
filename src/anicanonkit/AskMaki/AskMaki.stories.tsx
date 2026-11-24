import type { Story, StoryDefault } from '@ladle/react';
import preview from '@design/previews/MakiTurn.html?raw';
/* Version 215's own Maki, from its MakiTurn preview: the mascot is not among the sample blobs */
const maki = /MAKI = '(data:[^']+)'/.exec(preview)![1];
import { AskMaki, type AskMakiProps } from './AskMaki';

export default { title: 'AniCanonKit / Maki / AskMaki' } satisfies StoryDefault;

const row = { display: 'flex', gap: 12, alignItems: 'center' };

export const Handed: Story = () => <div style={row}><AskMaki avatar={maki} /><AskMaki avatar={maki} variant="ghost" label="Ask Maki how it could be answered" /><AskMaki avatar={maki} variant="outline" /></div>;

export const Header: Story = () => <div style={row}><AskMaki avatar={maki} label="Maki" size="md" shape="pill" count="3" open={false} /><AskMaki avatar={maki} label="Maki" size="md" shape="pill" open={false} /></div>;

export const Open: Story = () => <div style={row}><AskMaki avatar={maki} label="Maki" size="md" shape="pill" count="3" open /></div>;

export const Link: Story = () => <div style={row}><AskMaki avatar={maki} href="#maki" /></div>;

export const Playground: Story<AskMakiProps> = (args) => <AskMaki {...args} />;
Playground.args = { avatar: maki, label: 'Ask Maki', variant: 'secondary', size: 'sm', count: '' };
Playground.argTypes = { variant: { options: ['secondary', 'ghost', 'outline'], control: { type: 'radio' } }, size: { options: ['sm', 'md'], control: { type: 'radio' } } };
