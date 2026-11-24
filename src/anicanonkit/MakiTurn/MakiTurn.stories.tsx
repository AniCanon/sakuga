import type { Story, StoryDefault } from '@ladle/react';
import { Button } from '../../ui/Button/Button';
import { IconButton } from '../../ui/IconButton/IconButton';
import { MakiCard } from '../MakiCard/MakiCard';
import { MakiStep } from '../MakiStep/MakiStep';
import { MakiTurn, type MakiTurnProps } from './MakiTurn';

export default { title: 'AniCanonKit / Maki / MakiTurn' } satisfies StoryDefault;

const col = { width: 340 };

export const Turn: Story = () => <div style={col}><MakiTurn><p>Sé station has been burning since Fire at Sé.</p></MakiTurn></div>;

export const Steps: Story = () => <div style={col}><MakiTurn steps={<><MakiStep done label="Read the story" detail="26 events" /><MakiStep label="Checking the cast" /></>}><p>Three things don’t hold up.</p></MakiTurn></div>;

export const Quote: Story = () => <div style={col}><MakiTurn><p>Section 4 says</p><blockquote>Lisa waits at home</blockquote><p>but she is at Sé in section 3.</p></MakiTurn></div>;

export const WithCard: Story = () => (
  <div style={col}>
    <MakiTurn>
      <p>One way to fix it:</p>
      <MakiCard eyebrow="Story edit" title="Move it earlier in the story" check="The story stays consistent with this edit">
        <span slot="actions"><Button variant="ghost" size="sm">Reject</Button><Button variant="primary" size="sm">Accept</Button></span>
      </MakiCard>
    </MakiTurn>
  </div>
);

export const Actions: Story = () => <div style={col}><MakiTurn actions={<><IconButton variant="plain" icon="place" label="Show on the map" /><IconButton variant="plain" icon="more" label="More" /></>}><p>Fixed. The story holds again.</p></MakiTurn></div>;

export const Writing: Story = () => <div style={col}><MakiTurn writing /></div>;

export const Playground: Story<MakiTurnProps> = (args) => <div style={col}><MakiTurn {...args} /></div>;
Playground.args = { children: 'Sé station has been burning since Fire at Sé.', writing: false };
