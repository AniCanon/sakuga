import type { Story, StoryDefault } from '@ladle/react';
import { useState } from 'react';
import preview from '@design/previews/MakiTurn.html?raw';
/* Version 215's own Maki, from its MakiTurn preview: the mascot is not among the sample blobs */
const maki = /MAKI = '(data:[^']+)'/.exec(preview)![1];
import { Button } from '../../ui/Button/Button';
import { ChatMessage } from '../ChatMessage/ChatMessage';
import { MakiCard } from '../MakiCard/MakiCard';
import { MakiFinding } from '../MakiFinding/MakiFinding';
import { MakiFindingGroup } from '../MakiFindingGroup/MakiFindingGroup';
import { MakiStep } from '../MakiStep/MakiStep';
import { MentionChip } from '../MentionChip/MentionChip';
import { Mention } from '../Mention/Mention';
import kiko from '@design/blobs/49427cdea65a882ce38fbe43e1fc916c.jpg';
import { MakiTurn } from '../MakiTurn/MakiTurn';
import { MakiPanel, type MakiPanelProps } from './MakiPanel';

export default { title: 'AniCanonKit / Maki / MakiPanel' } satisfies StoryDefault;

const box = { width: 360, height: 560, display: 'flex' };

const talk = (
  <>
    <MakiTurn><p>Two things don’t hold up.</p></MakiTurn>
    <ChatMessage>Fix the last train</ChatMessage>
    <MakiTurn>
      <MakiCard eyebrow="Story edit" title="Move it earlier in the story" check="The story stays consistent with this edit">
        <span slot="actions"><Button variant="ghost" size="sm">Reject</Button><Button variant="primary" size="sm">Accept</Button></span>
      </MakiCard>
    </MakiTurn>
  </>
);

export const Chat: Story = () => <div style={box}><MakiPanel avatar={maki} waiting={2} cost={12}>{talk}</MakiPanel></div>;

/* Nothing said yet: Maki, one line, and what to ask first */
export const Greeting: Story = () => (
  <div style={box}>
    <MakiPanel avatar={maki} greeting="Ask me about the story. I can explain what doesn’t hold up and suggest a fix you accept or reject."
      suggestions={['Which issue matters most?', 'Why doesn’t the story hold up?', 'What happens to Mio next?']} />
  </div>
);

const events = [{ name: '“Genzo speaks at the shrine”', chip: 'Ep 1' }, { name: '“The lighthouse goes dark”', type: 'twist' as const, source: 'Episode 2 — Salt and Ash' }, { name: '“Genzo hides the logbook”', type: 'clue' as const, chip: 'Manga' }];

/* Review is one of Maki's replies: what she read, then the findings grouped inside it */
export const Review: Story = () => (
  <div style={box}>
    <MakiPanel avatar={maki} waiting={4}>
      <MakiTurn steps={<MakiStep done label="Read the story" detail="26 events" />}>
        <p>I read the story through “Mio swears to find Kaito”. 4 things don’t hold up.</p>
        <MakiFindingGroup label="Conflicts" count={1}>
          <MakiFinding severity="conflict" title="Genzo Arata appears in 3 events after dying" note="He dies in “Genzo dies in the lighthouse fire”." events={events} open pressable ask keep />
        </MakiFindingGroup>
        <MakiFindingGroup label="Warnings" count={3}>
          {['“Genzo hides the logbook” connects to nothing', '“Mio Arata at the Main Pavilion” connects to nothing', '“Mio watches the rain” connects to nothing'].map((t) => (
            <MakiFinding key={t} severity="warning" title={t} note="Nothing leads to it and it leads nowhere." pressable />
          ))}
        </MakiFindingGroup>
        <MakiFindingGroup label="Kept on purpose" count={1}>
          <MakiFinding title="“The last train” is not placed" kept={{ by: 'Raul', date: '3 Nov', reason: 'It pays off in season two.' }} reopen />
        </MakiFindingGroup>
      </MakiTurn>
    </MakiPanel>
  </div>
);

/* Tagging and the selection as context: names in Maki's words show who they are */
export const Rich: Story = () => (
  <div style={box}>
    <MakiPanel avatar={maki} waiting={1} cost={12} mentions={{ cast: [{ id: 'mio', name: 'Mio Arata', image: kiko, hint: 'Harbor Watch · lead' }], objects: [{ id: 'log', name: 'The logbook' }] }}
      context={<><MentionChip name="Mio Arata" image={kiko} note="Harbor Watch · lead" removable /><MentionChip kind="object" name="The logbook" removable /></>}>
      <ChatMessage>Why does Mio have the logbook?</ChatMessage>
      <MakiTurn><p><Mention image={kiko}>Mio Arata</Mention> finds <Mention kind="object">The logbook</Mention> in <Mention kind="event" type="revelation" told="Ep 1">Mio finds the logbook in the ashes</Mention>.</p></MakiTurn>
      <MakiTurn>
        <MakiCard eyebrow="Which one?" title="Who hid it?" chosen="genzo" choices={[{ name: 'Genzo Arata', value: 'genzo', visual: { kind: 'avatar', initial: 'G' }, labels: [{ label: 'Dead', variant: 'alert' }], source: 'In all 3' }, { name: 'Mio Arata', value: 'mio', visual: { kind: 'avatar', image: kiko }, labels: [{ label: 'Lead' }] }]} />
      </MakiTurn>
    </MakiPanel>
  </div>
);

/* Maki is writing: the loader before the first word, and Send becomes Stop */
export const Writing: Story = () => <div style={box}><MakiPanel avatar={maki} writing cost={12}><ChatMessage>Why does Mio have the logbook?</ChatMessage><MakiTurn writing /></MakiPanel></div>;

export const ReadOnly: Story = () => <div style={box}><MakiPanel avatar={maki} composer={false}>{talk}</MakiPanel></div>;

export const Working: Story = () => {
  const [v, set] = useState(''), [said, setSaid] = useState<string[]>([]);
  return (
    <div style={box}>
      <MakiPanel avatar={maki} waiting={2} value={v} onChange={set} onSend={(t) => { setSaid([...said, t]); set(''); }}>
        {talk}{said.map((t, i) => <ChatMessage key={i}>{t}</ChatMessage>)}
      </MakiPanel>
    </div>
  );
};

export const Playground: Story<MakiPanelProps> = (args) => <div style={box}><MakiPanel {...args}>{talk}</MakiPanel></div>;
Playground.args = { avatar: maki, waiting: 2, cost: 12, placeholder: 'Ask Maki…', busy: false, writing: false };
