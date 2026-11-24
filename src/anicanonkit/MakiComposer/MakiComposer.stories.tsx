import type { Story, StoryDefault } from '@ladle/react';
import { useState } from 'react';
import kiko from '@design/blobs/49427cdea65a882ce38fbe43e1fc916c.jpg';
import { MentionChip } from '../MentionChip/MentionChip';
import { MakiComposer, type MakiComposerProps } from './MakiComposer';

export default { title: 'AniCanonKit / Maki / MakiComposer' } satisfies StoryDefault;

const col = { width: 340 };

export const Empty: Story = () => <div style={col}><MakiComposer /></div>;

/* What is selected goes inside the container, under "Asking about", each removable */
export const Context: Story = () => <div style={col}><MakiComposer cost={12} context={<><MentionChip name="Mio Arata" image={kiko} removable /><MentionChip kind="event" type="revelation" name="Mio finds the logbook" removable /></>} /></div>;

/* A file added with +: under "Attached", after what the question is about, each with its kind and Remove; one still uploading */
export const Attached: Story = () => <div style={col}><MakiComposer cost={12} context={<MentionChip name="Mio Arata" image={kiko} removable />}
  files={[{ id: 'a', name: 'lighthouse.png', image: kiko }, { id: 'b', name: 'storm-at-sea.mp4', kind: 'video' }, { id: 'c', name: 'harbour.jpg', adding: true }]} removable /></div>;

export const Cost: Story = () => <div style={col}><MakiComposer cost={12} /></div>;

export const Hint: Story = () => <div style={col}><MakiComposer hint="Explaining an issue is free." attach={false} /></div>;

/* Maki is writing: Send becomes Stop */
export const Writing: Story = () => <div style={col}><MakiComposer writing cost={12} /></div>;

export const Typing: Story = () => {
  const [v, set] = useState('Why does it matter?');
  return <div style={col}><MakiComposer value={v} onChange={set} onSend={() => set('')} cost={12} /></div>;
};

export const Playground: Story<MakiComposerProps> = (args) => <div style={col}><MakiComposer {...args} /></div>;
Playground.args = { placeholder: 'Ask Maki…', hint: '', attach: true, label: 'Message to Maki', cost: 12, writing: false };
