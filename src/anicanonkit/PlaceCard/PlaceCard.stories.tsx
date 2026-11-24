import type { Story, StoryDefault } from '@ladle/react';
import station from '@design/blobs/28395b51c4b11a6da6b67d8ff9d1b3e2.jpg';
import stationLight from '@design/blobs/96ccc877edba6961f5ea118e33a96000.webp';
import { PlaceCard, type PlaceCardProps } from './PlaceCard';

export default { title: 'AniCanonKit / Places / PlaceCard' } satisfies StoryDefault;

const box = { width: 280 } as const;
const facts = [{ label: 'District', value: 'Centro' }, { label: 'Inside or out', value: 'Interior' }, { label: 'Views', value: '5 planned' }];

export const Drawing: Story = () => (
  <div style={box}>
    <PlaceCard name={'Sé station'} caption="A place in EBA" placeholder="Drawing" drawing facts={facts} note={'You can close this. We’ll tell you when the anchor is ready.'} />
  </div>
);

export const Empty: Story = () => <div style={box}><PlaceCard name={'Sé station'} caption="A place in EBA" placeholder="The anchor view" facts={facts} /></div>;

export const Drawn: Story = () => (
  <div style={box}>
    <PlaceCard name={'Sé station'} caption="A place in EBA" image={station} lightMap={stationLight} alt={'Sé station: the mezzanine over the platforms'} facts={facts} note="Approve it and the other 4 views are drawn from it." />
  </div>
);

export const Playground: Story<PlaceCardProps> = (args) => <div style={box}><PlaceCard {...args} /></div>;
Playground.args = { name: 'Sé station', caption: 'A place in EBA', image: station, lightMap: stationLight, facts, note: 'Approve it and the other 4 views are drawn from it.', drawing: false };
