import type { Story, StoryDefault } from '@ladle/react';
import { useState } from 'react';
import lisa from '@design/blobs/f317ac32ab39c79831025401ea5f69c0.jpg';
import platform from '@design/blobs/70a79c6a67f31e4250d80f3e68d60502.jpg';
import { Button } from '../../ui/Button/Button';
import { IconButton } from '../../ui/IconButton/IconButton';
import { Mention } from '../Mention/Mention';
import { MentionChip } from '../MentionChip/MentionChip';
import { SpendButton } from '../SpendButton/SpendButton';
import { PromptComposer, type PromptComposerProps, type PromptMentions } from './PromptComposer';

export default { title: 'AniCanonKit / Productions / PromptComposer' } satisfies StoryDefault;

const col = { width: 340 };
const tools = <span slot="tools"><IconButton variant="plain" icon="image" label="Opening frame" /><Button variant="ghost" size="sm" icon="clock">10 s</Button></span>;
const generate = <span slot="footer"><SpendButton variant="primary" fullWidth cost="~100">Generate</SpendButton></span>;

export const Take: Story = () => (
  <div style={col}>
    <PromptComposer label="Make a take">
      <Mention>Lisa</Mention> waits for the last train in the rain; the doors close before she moves.
      <span slot="refs"><MentionChip name="Lisa" note="school" image={lisa} /><MentionChip kind="place" name="Red Line Platform Edge" image={platform} /></span>
      {tools}{generate}
    </PromptComposer>
  </div>
);

export const Web: Story = () => (
  <div style={{ width: 390 }}>
    <PromptComposer label="Make a take" variant="web">
      <Mention>Lisa</Mention> waits for the last train in the rain; the doors close before she moves.
      <span slot="refs"><MentionChip name="Lisa" note="school" image={lisa} /><MentionChip kind="place" name="Red Line Platform Edge" image={platform} /></span>
      <span slot="tools"><IconButton variant="solid" icon="image" label="Opening frame" /><Button variant="ghost" size="sm" icon="clock">10 s</Button></span>
      <span slot="footer"><SpendButton variant="primary" fullWidth cost="~100">Generate</SpendButton></span>
    </PromptComposer>
  </div>
);

export const Empty: Story = () => (
  <div style={col}>
    <PromptComposer label="Make a take" placeholder="Describe the moment">
      <span slot="hint">Add a place, or describe the moment in 24 characters or more</span>
      {tools}{generate}
    </PromptComposer>
  </div>
);

/* Who the prompt can tag: type @, # or $ at a word's start. Lisa has two outfits, so she asks for one */
const mentions: PromptMentions = {
  cast: [
    { id: 'lisa', name: 'Lisa', image: lisa, outfits: [{ id: 'school', label: 'school' }, { id: 'rain-coat', label: 'rain coat' }] },
    { id: 'smith', name: 'Smith', outfits: [{ id: 'tactical', label: 'Tactical Uniform' }] },
    { id: 'ken', name: 'Ken' },
  ],
  places: [{ id: 'b-platform', name: 'Red Line Platform Edge', image: platform }, { id: 'b-roof', name: 'Rooftop at dusk' }],
  references: [{ alias: 'rain-look', name: 'Style lock' }],
};

export const Writing: Story = () => {
  const [text, set] = useState('@[Lisa:character:lisa:outfit:school] waits at @[Red Line Platform Edge:backdrop:b-platform] for the last train, in $rain-look.');
  return (
    <div style={{ ...col, paddingTop: 240 }}>
      <PromptComposer label="Make a take" placeholder="Describe the moment" value={text} onChange={set} mentions={mentions}>
        <span slot="refs"><MentionChip name="Lisa" note="school" image={lisa} /><MentionChip kind="place" name="Red Line Platform Edge" image={platform} /></span>
        <span slot="tools"><IconButton variant="plain" icon="image" label="Opening frame" /><SpendButton variant="primary" size="sm" cost="~100">Generate</SpendButton></span>
      </PromptComposer>
      <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>{text}</pre>
    </div>
  );
};

/* Studio's clip: $ lists the frames, then the references; a frame removed leaves its mention missing */
export const MissingFrame: Story = () => {
  const [text, set] = useState('Push in as @[Lisa:character:lisa:outfit:school] runs from $last-train to $platform-edge, in $rain-look.');
  return (
    <div style={{ ...col, paddingTop: 240 }}>
      <PromptComposer label="Make a take" value={text} onChange={set}
        mentions={{ ...mentions, references: [{ alias: 'last-train', group: 'Frames', hint: 'Opening frame' }, { alias: 'rain-look', group: 'References', hint: 'Source still' }] }}>
        <span slot="hint">$platform-edge isn’t in this take. Add its picture back, or take it out of the words.</span>
      </PromptComposer>
    </div>
  );
};

/* A dialog's prompt: it fills the column, four lines of room at least, and the phrases a plan added are marked until the first edit */
export const Planned: Story = () => {
  const [text, set] = useState('@[Lisa:character:lisa:outfit:school] waits at the edge of @[Red Line Platform Edge:backdrop:b-platform]. Medium shot, slow push in.');
  return (
    <div style={{ ...col, height: 320, display: 'flex', flexDirection: 'column' }}>
      <PromptComposer label="Make a take" value={text} onChange={set} mentions={mentions} fill rows={4} revisions={['at the edge of', 'Medium shot, slow push in.']}>
        <span slot="tools"><SpendButton variant="primary" size="sm" cost="~100">Generate</SpendButton></span>
      </PromptComposer>
    </div>
  );
};

export const Playground: Story<PromptComposerProps> = (args) => <div style={col}><PromptComposer {...args}>{tools}{generate}</PromptComposer></div>;
Playground.args = { label: 'Prompt', promptLabel: 'Prompt', placeholder: 'Describe the moment' };
