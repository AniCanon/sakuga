import type { Story, StoryDefault } from '@ladle/react';
import { useState } from 'react';
import { MakiFindingGroup } from '../MakiFindingGroup/MakiFindingGroup';
import { MakiFinding, type MakiFindingProps } from './MakiFinding';

export default { title: 'AniCanonKit / Maki / MakiFinding' } satisfies StoryDefault;

const col = { width: 340 };
const events: MakiFindingProps['events'] = [
  { name: '“Genzo speaks at the shrine”', chip: 'Ep 1' },
  { name: '“The lighthouse goes dark over the harbour on the night of the festival”', type: 'twist', source: 'Episode 2 — Salt and Ash' },
  { name: '“Genzo hides the logbook”', type: 'clue', chip: 'Manga' },
];

/* A finding is always a line of a group in Maki's reply */
export const Closed: Story = () => (
  <div style={col}>
    <MakiFindingGroup label="Findings" count={2}>
      <MakiFinding severity="conflict" title="Genzo Arata appears in 3 events after dying" note="Genzo Arata died in “Genzo dies in the lighthouse fire”." events={events} pressable />
      <MakiFinding severity="warning" title="“Mio Arata at the Main Pavilion” connects to nothing" note="Nothing leads to it and it leads nowhere." pressable />
    </MakiFindingGroup>
  </div>
);

export const Open: Story = () => (
  <div style={col}>
    <MakiFindingGroup label="Conflicts" count={1}>
      <MakiFinding severity="conflict" title="Genzo Arata appears in 3 events after dying" note="Genzo Arata died in “Genzo dies in the lighthouse fire”." events={events} open pressable ask keep />
    </MakiFindingGroup>
  </div>
);

export const Kept: Story = () => (
  <div style={col}>
    <MakiFindingGroup label="Kept on purpose" count={1}>
      <MakiFinding title="Genzo Arata appears in 3 events after dying" kept={{ by: 'Raul', date: '3 Nov', reason: 'He is a ghost from here on.' }} reopen />
    </MakiFindingGroup>
  </div>
);

export const Selectable: Story = () => {
  const [at, set] = useState(0);
  return (
    <div style={col}>
      <MakiFindingGroup label="Findings" count={2}>
        {['Genzo Arata appears in 3 events after dying', '“Mio Arata at the Main Pavilion” connects to nothing'].map((t, i) => (
          <MakiFinding key={t} severity={i ? 'warning' : 'conflict'} title={t} events={events} open={at === i} onSelect={() => set(i)} onAsk={() => {}} onKeep={() => {}} />
        ))}
      </MakiFindingGroup>
    </div>
  );
};

export const Playground: Story<MakiFindingProps> = (args) => <div style={col}><MakiFindingGroup label="Findings"><MakiFinding {...args} /></MakiFindingGroup></div>;
Playground.args = { severity: 'conflict', title: 'Genzo Arata appears in 3 events after dying', note: 'Genzo Arata died in “Genzo dies in the lighthouse fire”.', events, open: false, pressable: true, ask: true, keep: true };
