import type { Story, StoryDefault } from '@ladle/react';
import { Badge } from '../../ui/Badge/Badge';
import kiko from '@design/blobs/49427cdea65a882ce38fbe43e1fc916c.jpg';
import face from '@design/blobs/322a5d0e1f576b54cdd579a1f4bf2a2f.jpg';
import station from '@design/blobs/28395b51c4b11a6da6b67d8ff9d1b3e2.jpg';
import { EntityRow, type EntityRowProps } from './EntityRow';

export default { title: 'AniCanonKit / Story / EntityRow' } satisfies StoryDefault;

const col = { width: 320 };

export const Avatar: Story = () => <div style={col}><EntityRow visual={{ kind: 'avatar', image: kiko }} name="Kiko" before="Calm" after="Wary" afterVariant="new" chip="Ep 2" /></div>;

export const Initial: Story = () => <div style={col}><EntityRow visual={{ kind: 'avatar', initial: 'S' }} name="Smith" after="Missing" afterVariant="alert" chip="Ep 3" /></div>;

export const Pair: Story = () => <div style={col}><EntityRow visual={{ kind: 'pair', images: [kiko, face] }} name="Kiko and Ken" before="Friends" after="Rivals" afterVariant="alert" afterIcon="bolt" beforeIcon="heart" chip="Ep 3" /></div>;

export const Place: Story = () => <div style={col}><EntityRow visual={{ kind: 'place', image: station }} name="Sé station" after="Burning" afterVariant="alert" afterIcon="trait-fierce" chip="Ep 3" /></div>;

export const PlaceEmpty: Story = () => <div style={col}><EntityRow visual={{ kind: 'place' }} name="Red Line Platform" chip="Ep 1" /></div>;

export const Event: Story = () => <div style={col}><EntityRow visual={{ kind: 'event', type: 'twist' }} name="The doors close" chip="Ep 3" /></div>;

export const Question: Story = () => <div style={col}><EntityRow visual={{ kind: 'question', stage: 2 }} name="Cure, or the next threat?" after="Escalated" chip="Ep 1" /></div>;

export const Faded: Story = () => <div style={col}><EntityRow visual={{ kind: 'avatar', image: face }} name="Ken" after="Away" chip="Ep 1" faded /></div>;

export const StateSlot: Story = () => (
  <div style={col}>
    <EntityRow visual={{ kind: 'avatar', image: kiko }} name="Kiko" chip="Ep 2">
      <span slot="state"><span><Badge variant="new">Hurt</Badge></span></span>
    </EntityRow>
  </div>
);

export const Playground: Story<EntityRowProps> = (args) => <div style={col}><EntityRow {...args} /></div>;
Playground.args = { visual: { kind: 'question', stage: 2 }, name: 'Cure, or the next threat?', before: '', after: 'Escalated', chip: 'Ep 1', faded: false };
Playground.argTypes = { afterVariant: { options: ['new', 'alert'], control: { type: 'radio' } } };
