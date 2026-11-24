import type { Story, StoryDefault } from '@ladle/react';
import { MakiFinding } from '../MakiFinding/MakiFinding';
import { MakiFindingGroup, type MakiFindingGroupProps } from './MakiFindingGroup';

export default { title: 'AniCanonKit / Maki / MakiFindingGroup' } satisfies StoryDefault;

const col = { width: 340 };

export const Group: Story = () => (
  <div style={col}>
    <MakiFindingGroup label="Warnings" count={2}>
      <MakiFinding severity="warning" title="“Genzo hides the logbook” connects to nothing" note="Nothing leads to it and it leads nowhere." pressable />
      <MakiFinding severity="warning" title="What did the subject see?" note="Opened in “Red Line awakening”, then nothing for 7 events." pressable />
    </MakiFindingGroup>
  </div>
);

export const Note: Story = () => (
  <div style={col}>
    <MakiFindingGroup label="Kept on purpose" count={1} note="Each reopens by itself if the story changes around it.">
      <MakiFinding title="“The last train” is not placed" kept={{ by: 'Raul', date: '3 Nov', reason: 'It pays off in season two.' }} reopen />
    </MakiFindingGroup>
  </div>
);

export const Playground: Story<MakiFindingGroupProps> = (args) => <div style={col}><MakiFindingGroup {...args}><MakiFinding severity="conflict" title="Genzo appears after dying" pressable /></MakiFindingGroup></div>;
Playground.args = { label: 'Conflicts', count: 1, note: '' };
