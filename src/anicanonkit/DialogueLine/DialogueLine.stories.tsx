import type { Story, StoryDefault } from '@ladle/react';
import face from '@design/blobs/322a5d0e1f576b54cdd579a1f4bf2a2f.jpg';
import { Revision } from '../Revision/Revision';
import { DialogueLine, type DialogueLineProps } from './DialogueLine';

export default { title: 'AniCanonKit / Productions / DialogueLine' } satisfies StoryDefault;

const box = { width: 420 } as const;

export const Line: Story = () => <div style={box}><DialogueLine speaker="Kiko" delivery="quiet, certain" at="at 1.2 s" line="来なさい、ケン。" translation="Come here, Ken." /></div>;

export const WithPicture: Story = () => <div style={box}><DialogueLine speaker="Kiko" image={face} delivery="quiet, certain" at="at 1.2 s" line="来なさい、ケン。" translation="Come here, Ken." /></div>;

export const WithRevision: Story = () => (
  <div style={box}>
    <DialogueLine speaker="Kiko" delivery="quiet, certain" translation="Come here, Ken.">
      <Revision before="行きなさい" after="来なさい" />、ケン。
    </DialogueLine>
  </div>
);

export const Playground: Story<DialogueLineProps> = (args) => <div style={box}><DialogueLine {...args} /></div>;
Playground.args = { speaker: 'Kiko', delivery: 'quiet, certain', at: 'at 1.2 s', line: '来なさい、ケン。', translation: 'Come here, Ken.' };
