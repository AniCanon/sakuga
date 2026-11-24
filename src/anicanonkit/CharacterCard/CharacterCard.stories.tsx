import type { Story, StoryDefault } from '@ladle/react';
import { useState } from 'react';
import kiko from '@design/blobs/49427cdea65a882ce38fbe43e1fc916c.jpg';
import { CharacterCard, type CharacterCardProps } from './CharacterCard';

export default { title: 'AniCanonKit / Characters / CharacterCard' } satisfies StoryDefault;

const stats: CharacterCardProps['stats'] = [
  { icon: 'gender-female', value: 'Female', label: 'Gender' },
  { icon: 'age-adult', value: 'Adult', label: 'Age' },
  { icon: 'height-average', value: 'Average', label: 'Height' },
];
const traits: CharacterCardProps['traits'] = [{ icon: 'trait-calm', label: 'Calm' }, { icon: 'trait-bold', label: 'Bold' }];

export const Silhouette: Story = () => <CharacterCard name="Kiko" role="Leads the E.R.A." stage={{ kind: 'icon', icon: 'body-average' }} stats={stats} traits={traits} note="This card fills in as you go." />;

export const Avatar: Story = () => <CharacterCard name="Kiko" role="Leads the E.R.A." stage={{ kind: 'avatar', image: kiko }} stats={stats} traits={traits} />;

export const Portrait: Story = () => <CharacterCard name="Kiko" role="Leads the E.R.A." stage={{ kind: 'portrait', image: kiko }} stats={stats} />;

export const Voice: Story = () => {
  const [at, seek] = useState(1.2), [playing, toggle] = useState(false);
  return <CharacterCard name="Kiko" role="Leads the E.R.A." stage={{ kind: 'avatar', image: kiko }} traits={traits} voice={{ duration: 4, value: at, seed: 7, playing, onToggle: toggle, onSeek: seek }} note="Shounen Hero" />;
};

export const Playground: Story<CharacterCardProps> = (args) => <CharacterCard {...args} />;
Playground.args = { name: 'Kiko', role: 'Leads the E.R.A.', stage: { kind: 'icon', icon: 'body-average' }, stats, traits, note: 'This card fills in as you go.' };
